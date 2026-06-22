const router = require("express").Router(),
  {
    myHistory,
    punch,
    todayRecord,
    todaySummary,
    records,
    update,
  } = require("../controller/Attendance"),
  verifyToken = require("../middleware/auth"),
  verifyAdmin = require("../middleware/verifyAdmin");

router
  //Employee
  .get("/history", verifyToken, myHistory)
  .get("/today/record", verifyToken, todayRecord)
  .post("/punch", verifyToken, punch)
  //Admin
  .get("/today/summary", verifyToken, verifyAdmin, todaySummary)
  .get("/records", verifyToken, verifyAdmin, records)
  .put("/update", verifyToken, verifyAdmin, update);

module.exports = router;
