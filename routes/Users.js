const router = require("express").Router(),
  { browse } = require("../controller/Users");

router.get("/", browse);

module.exports = router;
