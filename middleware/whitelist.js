const whitelist = require("../config/whitelist");

const whitelisted = (req, res, proceed) => {
  const { origin } = req.headers;

  if (whitelist.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    proceed();
  } else {
    return res.status(403).json({ error: "Blocked by CORS" });
  }
};

module.exports = whitelisted;
