const router = require("express").Router(),
  { browse } = require("../controller/Attendance");

router.get("/", browse);

module.exports = router;
