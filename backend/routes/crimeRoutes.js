const express = require("express");
const Crime = require("../models/Crime");

const router = express.Router();


// ===============================
// GET ALL CRIMES
// ===============================

router.get("/", async (req, res) => {
  try {
    const crimes = await Crime.find().sort({ date: -1 });

    res.status(200).json(crimes);

  } catch (error) {

    console.error("GET crimes error:", error);

    res.status(500).json({
      message: error.message
    });

  }
});


// ===============================
// ADD CRIME
// ===============================

router.post("/", async (req, res) => {
  try {

    const crime = new Crime(req.body);

    await crime.save();

    res.status(201).json({
      message: "Crime added successfully",
      crime
    });

  } catch (error) {

    console.error("POST crime error:", error);

    res.status(500).json({
      message: error.message
    });

  }
});


// ===============================
// UPDATE CRIME
// ===============================

router.put("/:id", async (req, res) => {
  try {

    const crime = await Crime.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!crime) {
      return res.status(404).json({
        message: "Crime not found"
      });
    }

    res.status(200).json({
      message: "Crime updated successfully",
      crime
    });

  } catch (error) {

    console.error("UPDATE crime error:", error);

    res.status(500).json({
      message: error.message
    });

  }
});


// ===============================
// DELETE CRIME
// ===============================

router.delete("/:id", async (req, res) => {
  try {

    const crime = await Crime.findByIdAndDelete(
      req.params.id
    );

    if (!crime) {
      return res.status(404).json({
        message: "Crime not found"
      });
    }

    res.status(200).json({
      message: "Crime deleted successfully"
    });

  } catch (error) {

    console.error("DELETE crime error:", error);

    res.status(500).json({
      message: error.message
    });

  }
});


module.exports = router;