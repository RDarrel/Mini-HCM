const router = require("express").Router(),
  { browse, punch } = require("../controller/Attendance"),
  verifyToken = require("../middleware/auth");

router.get("/", verifyToken, browse).post("/punch", verifyToken, punch);

module.exports = router;
