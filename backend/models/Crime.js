const mongoose = require("mongoose");

const CrimeSchema = new mongoose.Schema({
    crimeType: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time:{
        type: String,
        required: true
    },
    criminal:{
        type: String
    },
    description: {
        type: String
    }
});

module.exports = mongoose.model("Crime", CrimeSchema);