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
  //EMPLOYEE
  .get("/", verifyToken, myHistory)
  .get("/today", verifyToken, todayRecord)
  .post("/punch", verifyToken, punch)
  //ADMIN
  .get("/today/summary", verifyToken, verifyAdmin, todaySummary)
  .get("/records", verifyToken, verifyAdmin, records)
  .put("/update", verifyToken, verifyAdmin, update);

module.exports = router;
