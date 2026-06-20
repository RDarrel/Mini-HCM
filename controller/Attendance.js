const { db, admin } = require("../config/firebase");
const { DateTime } = require("luxon");
const { computeDailySummary } = require("../utilities/attendance");

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
exports.browse = async (req, res) => {
  try {
    const snapshot = await db
      .collection("attendance")
      .orderBy("createdAt", "desc")
      .get();

    const attendance = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      message: "Attendance Browse Successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
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

  return {
    id: doc.id,
    ...doc.data(),
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

  // Store computed attendance metrics to avoid recalculation.
  await db.collection("dailySummary").add({
    attendanceId: attendanceDoc.id,
    userId: attendance.userId,
    workDate: attendance.workDate,
    ...summary,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    timezone: attendance.timezone,
  });

  return {
    id: attendanceDoc.id,
    ...attendance,
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
