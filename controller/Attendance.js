const { db, admin } = require("../config/firebase");
const { computeDailySummary } = require("../utilities/attendance");

const getWorkDate = (date, schedule) => {
  const [startHour] = schedule.start.split(":").map(Number);
  const [endHour] = schedule.end.split(":").map(Number);

  const workDate = new Date(date);
  const isNightShift = endHour <= startHour;

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

const punchValidation = async ({ userId, punchType, schedule }) => {
  if (!["in", "out"].includes(punchType)) {
    throw new Error("Invalid punch type");
  }

  const now = new Date();
  const workDate = getWorkDate(now, schedule);

  const snapshot = await db
    .collection("attendance")
    .where("userId", "==", userId)
    .where("workDate", "==", workDate)
    .limit(1)
    .get();

  const attendanceDoc = snapshot.empty ? null : snapshot.docs[0];
  const attendance = attendanceDoc ? attendanceDoc.data() : null;
  if (punchType === "in") {
    if (attendance?.timeIn && !attendance?.timeOut) {
      throw new Error("You already punched in. Please punch out first.");
    }

    if (attendance?.timeIn && attendance?.timeOut) {
      throw new Error("You already completed your shift.");
    }
  }

  if (punchType === "out") {
    if (!attendance?.timeIn) {
      throw new Error("Punch In before Punch Out.");
    }

    if (attendance?.timeOut) {
      throw new Error("You already punched out.");
    }
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

  await db.collection("dailySummary").add({
    attendanceId: attendanceDoc.id,
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
