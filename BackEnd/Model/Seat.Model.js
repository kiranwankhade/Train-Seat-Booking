const mongoose = require("mongoose");

// Seat Reservation Schema
const bookedSchema = new mongoose.Schema({
    seatNumber: String,
    isReserved: {
      type:Boolean,
      default:false
    }
},{
    versionKey:false
});

const BookModel = mongoose.model("seatsbooks",bookedSchema);

module.exports = {
    BookModel
}

