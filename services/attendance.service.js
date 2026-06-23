const { db, admin } = require("../config/firebase");
const { computeDailySummary, getWorkDate } = require("../utilities/attendance");
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

exports.punch = async ({ userId, punchType, schedule, timezone }) => {
  const { workDate, attendanceDoc } = await punchValidation({
    userId,
    punchType,
    schedule,
    timezone,
  });

  const data =
    punchType === "in"
      ? await punchIn({ userId, workDate, timezone })
      : await punchOut({ schedule, attendanceDoc, timezone });

  return {
    ...data,
    punchType,
  };
};
