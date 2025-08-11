const express = require("express");
const responseHandler = require("../helpers/responseHandler");
const router = express.Router();

router.get("/check-connection", (req, res) => {
  // Set caching headers for 30 sec (adjust as needed)
  res.setHeader("Cache-Control", "public, max-age=30");

  responseHandler(
    req,
    res,
    200,
    true,
    "",
    "",
    "Welcome to the Ammunition Cargo Management!"
  );
});


module.exports = router;
