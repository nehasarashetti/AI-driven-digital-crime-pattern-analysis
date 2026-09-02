const express = require("express");
const { execFile } = require("child_process");
const path = require("path");

const Crime = require("../models/Crime");

const router = express.Router();


// =================================
// SUMMARY
// =================================

router.get("/summary", async (req, res) => {
  try {

    const totalCrimes =
      await Crime.countDocuments();

    const knownCriminals =
      await Crime.countDocuments({
        criminal: {
          $nin: [
            "",
            "Not yet found",
            "Unknown",
          ],
        },
      });

    const unknownCriminals =
      totalCrimes - knownCriminals;


    const topCrime = await Crime.aggregate([
      {
        $group: {
          _id: "$crimeType",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);


    const topLocation =
      await Crime.aggregate([
        {
          $group: {
            _id: "$location",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 1,
        },
      ]);


    res.json({
      totalCrimes,
      knownCriminals,
      unknownCriminals,

      mostCommonCrime:
        topCrime[0]?._id || "N/A",

      mostAffectedLocation:
        topLocation[0]?._id || "N/A",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});


// =================================
// CRIME TYPES
// =================================

router.get("/crime-types", async (req, res) => {

  try {

    const data =
      await Crime.aggregate([
        {
          $group: {
            _id: "$crimeType",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);

    res.json(data);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});


// =================================
// LOCATIONS
// =================================

router.get("/locations", async (req, res) => {

  try {

    const data =
      await Crime.aggregate([
        {
          $group: {
            _id: "$location",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);

    res.json(data);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});


// =================================
// MONTHLY TREND
// =================================

router.get("/monthly", async (req, res) => {

  try {

    const data =
      await Crime.aggregate([
        {
          $match: {
            date: {
              $exists: true,
            },
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year: "$date",
              },

              month: {
                $month: "$date",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

    res.json(data);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});


// =================================
// TIME PATTERN
// =================================

router.get("/time-pattern", async (req, res) => {

  try {

    const data =
      await Crime.aggregate([
        {
          $match: {
            time: {
              $exists: true,
              $ne: "",
            },
          },
        },

        {
          $project: {
            hour: {
              $toInt: {
                $substrBytes: [
                  "$time",
                  0,
                  2,
                ],
              },
            },
          },
        },

        {
          $group: {
            _id: "$hour",
            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);

    res.json(data);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});
// ============================================================
// HISTORICAL DATASET ANALYSIS
// Connects Node.js with Python crime_analysis.py
// ============================================================

router.get("/dataset-analysis", (req, res) => {
    const pythonCode = `
import json
from services.crime_analysis import get_complete_analysis

result = get_complete_analysis()

print(json.dumps(result))
`;

    const pythonCommand = process.env.PYTHON_PATH || "python";

    execFile(
        pythonCommand,
        ["-c", pythonCode],
        {
            cwd: process.cwd(),
            maxBuffer: 10 * 1024 * 1024
        },
        (error, stdout, stderr) => {

            if (error) {
                console.error(
                    "Python analysis error:",
                    error
                );

                console.error(
                    "Python stderr:",
                    stderr
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to run crime dataset analysis",
                    error: error.message,
                    details: stderr
                });
            }

            try {

                const analysis = JSON.parse(
                    stdout.trim()
                );

                return res.json({
                    success: true,
                    data: analysis
                });

            } catch (parseError) {

                console.error(
                    "Python JSON parsing error:",
                    parseError
                );

                console.error(
                    "Python output:",
                    stdout
                );

                return res.status(500).json({
                    success: false,
                    message: "Invalid response from Python analysis engine",
                    error: parseError.message
                });
            }
        }
    );
});
// ============================================================
// RELATED CASES
// ============================================================

router.post("/related-cases", async (req, res) => {

  try {

    const {
      crime,
      weapon,
      city,
      domain,
      hour,
      limit = 10
    } = req.body;

    const pythonScript = path.join(
      __dirname,
      "..",
      "services",
      "related_cases.py"
    );

    const input = JSON.stringify({
      crime,
      weapon,
      city,
      domain,
      hour,
      limit
    });

    execFile(
      "python",
      [pythonScript, input],
      (error, stdout, stderr) => {

        if (error) {

          console.error(
            "Related Cases Error:",
            stderr || error.message
          );

          return res.status(500).json({
            success: false,
            message: "Unable to find related cases",
            error: stderr || error.message
          });

        }

        try {

          const result = JSON.parse(stdout);

          res.json({
            success: true,
            data: result
          });

        } catch (parseError) {

          console.error(
            "JSON Parse Error:",
            parseError
          );

          res.status(500).json({
            success: false,
            message: "Invalid response from Python analysis engine",
            error: parseError.message
          });

        }

      }
    );

  } catch (error) {

    console.error(
      "Related cases route error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Related cases analysis failed",
      error: error.message
    });

  }

});
module.exports = router;