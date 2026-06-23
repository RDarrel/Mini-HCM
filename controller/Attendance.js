const { db, admin } = require("../config/firebase");
const { DateTime } = require("luxon");
const { computeDailySummary, getWorkDate } = require("../utilities/attendance");
const { getPagination, getPaginationMeta } = require("../utilities/pagination");
const attendanceService = require("../services/attendance.service");
const reportService = require("../services/report.service");

// Get employee attendance history
exports.myHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    const { page, limit, offset } = getPagination(req.query);

    let query = db.collection("dailySummary").where("userId", "==", userId);

    const totalSnapshot = await query.count().get();
    const totalRecords = totalSnapshot.data().count;

    const snapshot = await query
      .orderBy("workDate", "desc")
      .offset(offset)
      .limit(limit)
      .get();

    const summary = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      message: "Attendance history fetched successfully",
      data: summary,
      pagination: getPaginationMeta({
        page,
        limit,
        totalRecords,
      }),
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// Returns today's attendance record along with its computed summary if available.
exports.todayRecord = async (req, res) => {
  try {
    const { uid: userId, schedule, timezone } = req.user;
    const now = new Date();
    const workDate = getWorkDate(now, schedule, timezone);
    const snapshot = await db
      .collection("dailySummary")
      .where("userId", "==", userId)
      .where("workDate", "==", workDate)
      .limit(1)
      .get();

    const doc = snapshot.docs[0] || null;

    if (!doc) {
      return res.json({
        message: "Today record fetched successfully",
        data: null,
      });
    }

    res.json({
      message: "Today record fetched successfully",
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

exports.punch = async (req, res) => {
  try {
    const { punchType } = req.body;
    const { schedule, uid: userId, timezone = "Asia/Manila" } = req.user;

    if (!punchType) {
      return res.status(400).json({
        error: "Punch type is required!",
      });
    }

    if (!schedule?.start || !schedule?.end) {
      return res.status(400).json({
        error: "Schedule start and end are required!",
      });
    }

    const data = await attendanceService.punch({
      userId,
      punchType,
      schedule,
      timezone,
    });

    res.json({
      message: "Attendance Punch Successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin routes

// Get today's employees summary
exports.todaySummary = async (req, res) => {
  try {
    const { timezone, role } = req.user;

    const workDate = DateTime.now()
      .setZone(timezone || "Asia/Manila")
      .toISODate();

    const [usersSnapshot, summarySnapshot] = await Promise.all([
      db.collection("users").where("role", "==", "employee").get(),
      db.collection("dailySummary").where("workDate", "==", workDate).get(),
    ]);

    const totalEmployees = usersSnapshot.size;
    const presentToday = summarySnapshot.size;
    const absentToday = Math.max(totalEmployees - presentToday, 0);

    let lateToday = 0;
    let employeesWithOT = 0;
    let employeesWithND = 0;

    let currentlyWorking = 0;
    let completedShifts = 0;

    summarySnapshot.forEach((doc) => {
      const data = doc.data();

      if ((data.lateMinutes || 0) > 0) lateToday++;
      if ((data.overtimeMinutes || 0) > 0) employeesWithOT++;
      if ((data.nightDiffMinutes || 0) > 0) employeesWithND++;
      if (data.timeIn && !data.timeOut) currentlyWorking++;
      if (data.timeIn && data.timeOut) completedShifts++;
    });

    res.json({
      message: "Summary fetched successfully",
      data: {
        workDate,
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        currentlyWorking,
        completedShifts,
        employeesWithOT,
        employeesWithND,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.records = async (req, res) => {
  try {
    const { from, to, search = "" } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "From and to date are required!" });
    }

    const { page, limit, offset } = getPagination(req.query);

    const dailySummarySnapshot = await db
      .collection("dailySummary")
      .where("workDate", ">=", from)
      .where("workDate", "<=", to)
      .orderBy("workDate", "desc")
      .get();

    // Aggregate attendance metrics per employee
    const computedDailySummary = reportService.aggregateSummaryByUser(
      dailySummarySnapshot.docs,
    );

    const userIds = [
      ...new Set(computedDailySummary.map((item) => item.userId)),
    ];

    // Load employee information and create a lookup map
    const userMap = await reportService.getUserMap(userIds);

    const keyword = search.toLowerCase().trim();

    // Attach employee details to each aggregated summary
    const summariesWithUser = computedDailySummary.map((summary) => ({
      ...summary,
      user: userMap.get(summary.userId) || null,
    }));

    // Apply employee name search filter
    const filteredSummary = reportService.filterSummaryBySearch(
      summariesWithUser,
      keyword,
    );

    const totalRecords = filteredSummary.length;
    const records = filteredSummary.slice(offset, offset + limit);

    res.json({
      message: "Records fetched successfully",
      data: records,
      pagination: getPaginationMeta({
        page,
        limit,
        totalRecords,
      }),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      timeIn = null,
      timeOut = null,
      userId = null,
      id = null,
      reason = "",
    } = req.body;

    if (!timeIn || !timeOut || !userId || !id || !reason) {
      return res.status(400).json({ error: "Missing required fields!" });
    }

    const userSnapshot = await db.collection("users").doc(userId).get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const { timezone = "Asia/Manila", schedule } = userSnapshot.data();

    if (!schedule?.start || !schedule?.end) {
      return res.status(400).json({
        error: "Employee schedule is required",
      });
    }

    const parsedTimeIn = DateTime.fromISO(timeIn, {
      zone: timezone,
    }).toJSDate();

    const parsedTimeOut = DateTime.fromISO(timeOut, {
      zone: timezone,
    }).toJSDate();

    if (parsedTimeOut <= parsedTimeIn) {
      return res.status(400).json({
        error: "Time Out must be after Time In",
      });
    }

    // Recompute attendance summary based on the updated time entries.
    const summary = computeDailySummary({
      timeIn: parsedTimeIn,
      timeOut: parsedTimeOut,
      timezone,
      schedule,
    });

    await db
      .collection("attendance")
      .doc(id)
      .update({
        timeIn: parsedTimeIn,
        timeOut: parsedTimeOut,
        lastEdit: {
          reason,
          by: req.user.uid,
          at: admin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Sync the reporting record after recalculating attendance metrics.
    await db
      .collection("dailySummary")
      .doc(id)
      .update({
        timeIn: parsedTimeIn,
        timeOut: parsedTimeOut,
        status: "completed",
        ...summary,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({
      message: "Attendance updated successfully",
      data: {
        id,
        timeIn: parsedTimeIn,
        timeOut: parsedTimeOut,
        ...summary,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
