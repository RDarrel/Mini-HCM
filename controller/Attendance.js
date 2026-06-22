const { db, admin } = require("../config/firebase");
const { DateTime } = require("luxon");
const { computeDailySummary } = require("../utilities/attendance");
const { getPagination, getPaginationMeta } = require("../utilities/pagination");

// Determines the work date used for attendance records.
const getWorkDate = (date, schedule, timezone = "Asia/Manila") => {
  const [startHour] = schedule.start.split(":").map(Number);
  const [endHour] = schedule.end.split(":").map(Number);

  let workDate = DateTime.fromJSDate(date).setZone(timezone);

  const isNightShift = endHour <= startHour;
  // Night shift example:
  // Schedule: 22:00 - 06:00
  // Punch at 05:00 AM should still belong to the previous work day.
  if (isNightShift && workDate.hour < endHour) {
    workDate = workDate.minus({ days: 1 });
  }

  return workDate.toFormat("yyyy-MM-dd");
};

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

// Fetch the summary record linked to an attendance entry.
const getDailySummary = async (attendanceId) => {
  const doc = await db.collection("dailySummary").doc(attendanceId).get();

  return doc.exists
    ? {
        id: doc.id,
        ...doc.data(),
      }
    : null;
};

// Returns today's attendance record along with its computed summary if available.
exports.todayRecord = async (req, res) => {
  try {
    const { uid: userId, schedule, timezone } = req.user;
    const now = new Date();

    const workDate = getWorkDate(now, schedule, timezone);

    const snapshot = await db
      .collection("attendance")
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

    const summary = await getDailySummary(doc.id);

    res.json({
      message: "Today record fetched successfully",
      data: {
        id: doc.id,
        ...doc.data(),
        ...summary,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// Validates punch in/out requests and enforces attendance rules.
const punchValidation = async ({ userId, punchType, schedule, timezone }) => {
  if (!["in", "out"].includes(punchType)) {
    throw new Error("Invalid punch type");
  }
  const now = new Date();
  const workDate = getWorkDate(now, schedule, timezone);

  // Check if the employee has an active attendance record.
  const openAttSnapshot = await db
    .collection("attendance")
    .where("userId", "==", userId)
    .where("timeOut", "==", null)
    .limit(1)
    .get();

  const attendanceDoc = openAttSnapshot.empty ? null : openAttSnapshot.docs[0];
  if (punchType === "in") {
    if (!openAttSnapshot.empty) {
      throw new Error("You are already punched in. Please punch out first.");
    }

    // Prevent creating more than one attendance record for the same work day.
    const sameWorkDaySnapshot = await db
      .collection("attendance")
      .where("userId", "==", userId)
      .where("workDate", "==", workDate)
      .limit(1)
      .get();

    if (!sameWorkDaySnapshot.empty) {
      throw new Error("Your shift is already completed.");
    }
  }

  if (openAttSnapshot.empty && punchType === "out") {
    throw new Error("Please punch in first before punching out.");
  }

  return { workDate, attendanceDoc };
};

const punchIn = async ({ userId, workDate, timezone }) => {
  const docRef = await db.collection("attendance").add({
    userId,
    workDate,
    timeIn: admin.firestore.FieldValue.serverTimestamp(),
    timeOut: null,
    timezone,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  const attendance = doc.data();

  // Create an initial summary record so attendance history can
  // immediately display the ongoing shift after Punch In.
  await db.collection("dailySummary").doc(doc.id).set({
    attendanceId: doc.id,
    userId,
    workDate,
    timeIn: attendance.timeIn,
    timeOut: null,
    regularMinutes: 0,
    overtimeMinutes: 0,
    nightDiffMinutes: 0,
    lateMinutes: 0,
    undertimeMinutes: 0,
    totalLoggedMinutes: 0,
    status: "in_progress",
    timezone,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: doc.id,
    ...attendance,
    status: "in_progress",
  };
};

const punchOut = async ({ schedule, attendanceDoc, timezone }) => {
  if (!attendanceDoc) {
    throw new Error("Attendance record not found.");
  }

  await attendanceDoc.ref.update({
    timeOut: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await attendanceDoc.ref.get();
  const attendance = updatedDoc.data();

  const summary = computeDailySummary({
    timeIn: attendance.timeIn.toDate(),
    timeOut: attendance.timeOut.toDate(),
    schedule,
    timezone,
  });

  // Finalize the reporting record used by dashboards,
  // attendance history, and admin reports.
  await db
    .collection("dailySummary")
    .doc(attendanceDoc.id)
    .set(
      {
        attendanceId: attendanceDoc.id,
        userId: attendance.userId,
        workDate: attendance.workDate,
        timeIn: attendance.timeIn,
        timeOut: attendance.timeOut,
        ...summary,
        timezone: attendance.timezone,
        status: "completed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  return {
    id: attendanceDoc.id,
    ...attendance,
    ...summary,
    status: "completed",
  };
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

    const { workDate, attendanceDoc } = await punchValidation({
      userId,
      punchType,
      schedule,
      timezone,
    });

    const data =
      punchType === "in"
        ? await punchIn({ userId, workDate, timezone })
        : await punchOut({
            schedule,
            attendanceDoc,
            timezone,
          });

    res.json({
      message: "Attendance Punch Successfully",
      data: {
        ...data,
        punchType,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get today's employees summary
exports.todaySummary = async (req, res) => {
  try {
    const { timezone, role } = req.user;

    if (role !== "administrator") {
      return res.status(403).json({ error: "You are not authorized" });
    }

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
    const { role } = req.user;

    if (role !== "administrator") {
      return res.status(403).json({ error: "You are not authorized" });
    }

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

    const fields = [
      "lateMinutes",
      "overtimeMinutes",
      "nightDiffMinutes",
      "regularMinutes",
      "undertimeMinutes",
      "totalLoggedMinutes",
    ];

    const computedDailySummary = Object.values(
      dailySummarySnapshot.docs.reduce((acc, curr) => {
        const summary = curr.data();
        const key = summary.userId;

        if (!acc[key]) {
          acc[key] = {
            userId: summary.userId,
            lateMinutes: 0,
            overtimeMinutes: 0,
            nightDiffMinutes: 0,
            regularMinutes: 0,
            undertimeMinutes: 0,
            totalLoggedMinutes: 0,
          };
        }

        fields.forEach((field) => {
          acc[key][field] += summary[field] || 0;
        });

        return acc;
      }, {}),
    );

    const userIds = [
      ...new Set(computedDailySummary.map((item) => item.userId)),
    ];

    let userMap = new Map();

    if (userIds.length > 0) {
      const usersSnapshot = await db
        .collection("users")
        .where("uid", "in", userIds)
        .get();

      userMap = new Map(
        usersSnapshot.docs.map((doc) => {
          const user = doc.data();

          return [
            user.uid,
            {
              uid: user.uid,
              name: user.name,
              email: user.email,
            },
          ];
        }),
      );
    }

    const keyword = search.toLowerCase().trim();

    const filteredSummary = computedDailySummary
      .map((summary) => ({
        ...summary,
        user: userMap.get(summary.userId) || null,
      }))
      .filter(({ user }) => {
        if (!keyword) return true;

        const fname = user?.name?.fname?.toLowerCase() || "";
        const lname = user?.name?.lname?.toLowerCase() || "";
        const fullName = `${fname} ${lname}`;

        return fullName.includes(keyword);
      });

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
