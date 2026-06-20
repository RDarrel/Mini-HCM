const { db, admin } = require("../config/firebase");
const { computeDailySummary } = require("../utilities/attendance");

// Determines the work date used for attendance records.
const getWorkDate = (date, schedule) => {
  const [startHour] = schedule.start.split(":").map(Number);
  const [endHour] = schedule.end.split(":").map(Number);

  const workDate = new Date(date);
  const isNightShift = endHour <= startHour;
  // Night shift example:
  // Schedule: 22:00 - 06:00
  // Punch at 05:00 AM should still belong to the previous work day.
  if (isNightShift && date.getHours() < endHour) {
    workDate.setDate(workDate.getDate() - 1);
  }

  return workDate.toISOString().slice(0, 10);
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
const punchValidation = async ({ userId, punchType, schedule }) => {
  if (!["in", "out"].includes(punchType)) {
    throw new Error("Invalid punch type");
  }
  const now = new Date();
  const workDate = getWorkDate(now, schedule);

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

const punchIn = async ({ userId, workDate }) => {
  const docRef = await db.collection("attendance").add({
    userId,
    workDate,
    timeIn: admin.firestore.FieldValue.serverTimestamp(),
    timeOut: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();

  return {
    id: doc.id,
    ...doc.data(),
  };
};

const punchOut = async ({ schedule, attendanceDoc }) => {
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
  });

  // Store computed attendance metrics to avoid recalculation.
  await db.collection("dailySummary").add({
    attendanceId: attendanceDoc.id,
    userId: attendance.userId,
    workDate: attendance.workDate,
    ...summary,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: attendanceDoc.id,
    ...attendance,
    summary,
  };
};

exports.punch = async (req, res) => {
  try {
    const { punchType } = req.body;
    const { schedule, uid: userId } = req.user;
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
    });

    const data =
      punchType === "in"
        ? await punchIn({ userId, workDate })
        : await punchOut({
            schedule,
            attendanceDoc,
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
