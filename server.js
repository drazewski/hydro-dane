const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./app/models");
db.sequelize.sync();
const whitelist = ["http://localhost:3000", "http://localhost:8081", "http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean);
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});
// set port, listen for requests
require("./app/routes/monthlyRecords.routes")(app);
require("./app/routes/yearlyRecords.routes")(app);
require("./app/routes/stations.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});