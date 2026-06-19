const { db, admin } = require("../config/firebase");
const { computeDailySummary } = require("../utilities/attendance");

exports.browse = async (req, res) => {
  try {
    const snapshot = await db.collection("attendance").get();
    const attendance = snapshot.docs.map((doc) => doc.data());
    res.json({ message: "Attendance Browse Successfully", data: attendance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const punchIn = async (userId) => {
  try {
    const docRef = await db.collection("attendance").add({
      userId,
      timeIn: admin.firestore.FieldValue.serverTimestamp(),
      timeOut: null,
    });
    const doc = await docRef.get();
    return { id: docRef.id, ...doc.data() };
  } catch (error) {
    console.log("Error in punchIn:", error.message);
  }
};

const punchOut = async (userId, schedule) => {
  try {
    const snapshot = await db
      .collection("attendance")
      .where("userId", "==", userId)
      .where("timeOut", "==", null)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error("Attendance record not found");
    }

    const doc = snapshot.docs[0];

    await doc.ref.update({
      timeOut: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await doc.ref.get();
    const attendance = updatedDoc.data();

    const summary = computeDailySummary({
      timeIn: attendance.timeIn.toDate(),
      timeOut: attendance.timeOut.toDate(),
      schedule,
    });

    // Add daily summary
    await db
      .collection("dailySummary")
      .add({ attendanceId: doc.id, ...summary });

    return { id: doc.id, ...attendance };
  } catch (error) {
    console.log("Error in punchOut:", error.message);
  }
};

exports.punch = async (req, res) => {
  try {
    const { userId, punchType, schedule = {} } = req.body;
    let data = {};
    if (!userId || !punchType) {
      return res
        .status(400)
        .json({ error: "UserId and punchType are required!" });
    }

    if (punchType === "in") {
      data = await punchIn(userId);
    } else {
      data = await punchOut(userId, schedule);
    }

    res.json({
      message: "Attendance Punch Successfully",
      data: { ...data, punchType },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
