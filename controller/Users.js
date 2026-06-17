const { db } = require("../config/firebase");
exports.browse = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(users);
    res.json({ message: "Attendance Browse Successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
