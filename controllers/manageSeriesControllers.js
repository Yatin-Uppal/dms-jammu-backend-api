const responseHandler = require("../helpers/responseHandler");
const db = require("../models");
const { validationResult } = require("express-validator");
const { softDeleteTables } = require("../services/softDeleteAllTableEntries");

// controller
const SetSeries = async (req, res, next) => {
  try {
    const user_id = req.header('user_id');
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Validation errors",
        {
          errors: errors.array(),
        },
        ""
      );
    }
    const validate = validateSeries(req)
    if (validate) {
      return responseHandler(req, res, 500, false, "Server error", validate, "");
    }
    // const seriesData = await db.Series.count({userId: user_id});
    const seriesData = await db.Series.count();

    if (seriesData) {
      return responseHandler(req, res, 500, false, "Can't create more than 1 series", "Can't create more than 1 series", "");
    }

    const series = await db.Series.create({ ...req.body, userId: user_id });

    return responseHandler(req, res, 200, true, "", series, "Series Data stored successfully.");
  } catch (error) {
    return responseHandler(req, res, 500, false, "Server error", error, "");
  }
}

// controller
const UpdateSeriesData = async (req, res, next) => {
  try {
    const user_id = req.header('user_id');
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHandler(
        req,
        res,
        400,
        false,
        "Validation errors",
        {
          errors: errors.array(),
        },
        ""
      );
    }
    const validate = validateSeries(req)
    if (validate) {
      return responseHandler(req, res, 500, false, "Server error", validate, "");
    }

    const seriesData = await db.Series.findAll();
    const selectedSeries = seriesData?.length ? seriesData[0] : {}
    const series = await db.Series.update({ ...req.body }, {
      where: {
        id: selectedSeries?.id,
      },
    });
    // soft delete all the table entries.
    await softDeleteTables()
    return responseHandler(req, res, 200, true, "", series, "Series Data stored successfully.");


  } catch (error) {
    return responseHandler(req, res, 500, false, "Server error", error, "");

  }
}

// controller
const GetAllSeriesByUserId = async (req, res, next) => {
  try {
    const user_id = parseInt(req.header("user_id"));
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    // Fetch series for the given user
    const { rows: seriesData, count: totalRecords } = await db.Series.findAndCountAll({
      // where: { userId: user_id },
      order: [["updated_at", "DESC"]],
      limit,
      offset
    });

    // Construct pagination response
    const totalPages = Math.ceil(totalRecords / limit);
    const pagination = {
      currentPage: page,
      totalPages,
      totalRecords,
      perPage: limit
    };
    return responseHandler(req, res, 200, true, "", { seriesData, pagination }, "Successfully get series data.");

  } catch (error) {
    return responseHandler(req, res, 500, false, "Server error", error, "");
  }
}


// halper function
const generateBatches = (startDate, time, interval) => {
  const start = new Date(startDate);
  const startHour = start.getHours();

  let batches = [];
  let currentStart = startHour;

  while (currentStart < time + startHour) {
    let currentEnd = currentStart + interval;
    if (currentEnd > time + startHour) break; // Prevent overshooting the total time
    
    // Calculate which day each hour falls into (each day is 24 hours)
    const startDay = Math.floor(currentStart / 24) + 1;
    const endDay = Math.floor((currentEnd - 1) / 24) + 1;
    
    // Create appropriate batch string with day information
    if (startDay === endDay) {
      batches.push(`M+${currentStart} - M+${currentEnd}`);
    } else {
      // Handle the case where a batch crosses days
      batches.push(`M+${currentStart} - M+${currentEnd}`);
    }

    currentStart = currentEnd; // Move to the next batch
  }

  return batches;
};


// controller
const GetSeriesBatchByUserId = async (req, res, next) => {
  try {
    // Fetch series for the given user
    const seriesData = await db.Series.findOne(); //{ where: { userId: user_id } }

    if (!seriesData) {
      return responseHandler(req, res, 200, false, "First create a series", [], "");
    }

    const { time, interval, startDate } = seriesData;
    const batches = generateBatches(startDate, time, interval);

    return responseHandler(req, res, 200, true, "", batches, "Successfully get series data.");


  } catch (error) {
    return responseHandler(req, res, 500, false, "Server error", error, "");
  }
};



const validateSeries = (req) => {
  const { interval, time, startDate, endDate } = req.body;

  // Check required fields
  if (!interval || !time || !startDate || !endDate) {
    return { error: "All fields are required." };
  }

  // Validate data types
  if (!Number.isInteger(interval) || interval < 1 || interval > 24) {
    return { error: "Interval must be an integer between 1 and 24." }
  }
  if (!Number.isInteger(time) || time < 0) {
    return { error: "Time must be a non-negative integer." }
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: "Invalid date format." }
  }

  if (end <= start) {
    return { error: "End date must be after start date." }
  }

  return null;
};



module.exports = { SetSeries, UpdateSeriesData, GetAllSeriesByUserId, GetSeriesBatchByUserId, generateBatches };