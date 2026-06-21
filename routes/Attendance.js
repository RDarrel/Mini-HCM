const router = require("express").Router(),
  { browse, punch, get_today_record } = require("../controller/Attendance"),
  verifyToken = require("../middleware/auth");

router
  .get("/", verifyToken, browse)
  .get("/get-today-record", verifyToken, get_today_record)
  .post("/punch", verifyToken, punch);

module.exports = router;
