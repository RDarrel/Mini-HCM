const { db } = require("../config/firebase");
exports.browse = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    res.json({ message: "Users Browse Successfully", payload: users });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
