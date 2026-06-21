const router = require("express").Router(),
  {
    myHistory,
    punch,
    todayRecord,
    todaySummary,
    records,
  } = require("../controller/Attendance"),
  verifyToken = require("../middleware/auth");

router
  .get("/", verifyToken, myHistory)
  .get("/today", verifyToken, todayRecord)
  .get("/today/summary", verifyToken, todaySummary)
  .get("/records", verifyToken, records)
  .post("/punch", verifyToken, punch);

module.exports = router;
