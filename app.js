const express = require("express"),
  app = express(),
  path = require("path"),
  http = require("http"),
  cors = require("cors"),
  whitelist = require("./config/whitelist"),
  { red, green } = require("colorette");
require("dotenv").config();

const corsConfig = {
  origin: whitelist, // Do not use wildcard
  methods: ["GET", "POST", "PUT", "DELETE"], // List only available methods
  credentials: true, // Must be set to true for jwt
  allowedHeaders: [
    "Origin",
    "Content-Type",
    "X-Requested-With",
    "Accept",
    "Authorization",
  ], // Allowed Headers to be received
};

// Comment when client and server are joined
app.use(cors(corsConfig)); // Pass configuration to cors

// Used to receive json and form-data in req.body
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);
app.use(express.json({ limit: "50mb" }));

// Routes
require("./routes")(app);

// used when deployed, make sure it is below routes.
app.use(express.static(path.join(__dirname, "./view")));
app.get("/*splat", (req, res) =>
  res.sendFile(path.resolve(__dirname, "./", "view", "index.html")),
);

const server = http.createServer(app);

const port = process.env.PORT || 5000; // Dynamic port for deployment
server.listen(port, () => {
  console.log(green(`[Server] running on port: ${port}`));
});

server.on("error", (error) => console.log(red(`[Server] ${error.message}`)));
