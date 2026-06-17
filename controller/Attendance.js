exports.browse = async (req, res) => {
  try {
    res.json({ message: "Attendance Browse Successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
