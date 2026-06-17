const fs = require("fs"),
  { blue, green } = require("colorette");

const generateRoutes = async (app, folder, src) => {
  //read files except index.js
  const files = fs.readdirSync(src).filter((r) => r !== "index.js");

  //loop files
  for (const file of files) {
    //detect if file
    if (file.includes(".js")) {
      //for creating logs and api path
      const formatPath = (api = false) => {
        if (!folder) return "";
        const baseSrc = src.slice(9, src.length);

        if (api) return `${baseSrc}/`;

        return `[${baseSrc.split("/").join("][")}]`;
      };

      const [name] = file.split("."),
        pathName = `./${folder && `${folder}/`}${file}`;

      //create route
      app.use(`/${formatPath(true)}${name}`, require(pathName));

      //log if success
      console.log(
        blue(`[Route]${formatPath()}[${file}] created successfully.`),
      );
      continue;
    }

    //recursive function
    generateRoutes(app, folder ? `${folder}/${file}` : file, `${src}/${file}`);
  }
};

module.exports = (app) => {
  //generate base routes
  generateRoutes(app, "", "./routes");
  console.log(green("[Routes] generated successfully."));
};
