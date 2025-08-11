const express = require("express");
const app = express();
const db = require("./models");
require("dotenv").config();
const cors = require("cors");
//Routes Called
const authRoutes = require("./routes/authRoutes");
const vehicleTypeRoutes = require("./routes/vehicleTypeRoutes");
const vehicleCapacityRoutes = require("./routes/vehicleCapacityRoutes");
const ltsDetailsRoutes = require("./routes/ltsDetailsRoutes");
const driverVehicleRoutes = require("./routes/driverVehicleRoutes");
const assignedLtsRoutes = require("./routes/assignedLtsRoutes");
const fetchDetailsRoutes = require("./routes/fetchDetailsRoutes");
const importDataRoutes = require("./routes/importDataRoute");
const syncDataRoutes = require("./routes/syncDataRoutes");
const formationRoutes = require("./routes/formationRoutes");
const driverVehicleNotLoadedRoutes = require("./routes/syncDriverDataRoutes");
const gateCheckoutSyncRoutes = require("./routes/gateCheckoutSyncRoutes");
const dashboardListViewRoute = require("./routes/dashboardListViewRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const backupRoutes = require("./routes/backupRoutes");
const checkConnectionRoutes = require("./routes/checkConnectionRoutes");
const logRoutes = require("./routes/logRoutes");
const amkQuantityRoutes = require("./routes/amkQuantityRoutes");
const seriesRoutes = require("./routes/seriesRouter")

const PORT = process.env.PORT || 8080;

// for parsing application/json
app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration

app.get("/", (req, res) => {
  res.send("Welcome to the Ammunition Cargo Management!");
});

// Serve static files from the "public" folder
app.use(express.static("public"));

// Routes declared
app.use("/api", authRoutes);
app.use("/api", vehicleTypeRoutes); // Mount the vehicle type routes under /api
app.use("/api", vehicleCapacityRoutes); // Mount the vehicle capacity routes under /api
app.use("/api", ltsDetailsRoutes); // Mount the LTS details routes under /api
app.use("/api", driverVehicleRoutes); // Mount the driver vehicle routes under /api
app.use("/api", assignedLtsRoutes); // Mount the assigned lts routes under /api
app.use("/api", fetchDetailsRoutes); // Mount the all details fetch routes under /api
app.use("/api", importDataRoutes);
app.use("/api", syncDataRoutes);
app.use("/api", formationRoutes);
app.use("/api", driverVehicleNotLoadedRoutes);
app.use("/api", gateCheckoutSyncRoutes);
app.use("/api", dashboardListViewRoute);
app.use("/api", userRoutes);
app.use("/api", roleRoutes);
app.use("/api", backupRoutes);
app.use("/api", logRoutes);
app.use("/api", checkConnectionRoutes);
app.use("/api", amkQuantityRoutes);
app.use("/api", seriesRoutes)

const { ipAddress } = process.env;
db.sequelize.sync().then(() => {
  app.listen(PORT, ipAddress, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
