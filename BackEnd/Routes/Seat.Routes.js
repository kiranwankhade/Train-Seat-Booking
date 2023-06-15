const express = require("express");

const seatRouters = express.Router();

const { BookModel } = require("../Model/Seat.Model");

// Book seats
const totalSeats = 80;
const totalSeatsInRow = 7;
const lastRowSeats = 3;

const seatsArray = new Array(totalSeats).fill(false);

//Seat Booking Function

const trainSeatsBookingFunc = (seatCount) => {
  const result = [];

  // Check Availability
  let startIndex = -1;
  let seatsPerRow = 0;

  // Check if seats are available in one row
  for (let i = 0; i <= totalSeats - seatCount; i++) {
    seatsPerRow = i < totalSeats - lastRowSeats ? totalSeatsInRow : lastRowSeats;
    const availableSeats = seatsArray.slice(i, i + seatCount);
    if (
      (i % seatsPerRow) + seatCount <= seatsPerRow &&
      availableSeats.every((x) => x === false)
    ) {
      startIndex = i;
      break;
    }
  }

  // If seats are not available in one row, book nearby seats
  if (startIndex === -1) {
    let count = 0;
    for (let i = 0; i < totalSeats; i++) {
      if (seatsArray[i] === false) {
        seatsArray[i] = true;
        result.push(generateSeatNumber(i));
        count++;
        if (count === seatCount) {
          break;
        }
      }
    }
  } else { //check nearby not 
    const newSeats = [...seatsArray];
    for (let j = 0; j < seatCount; j++) {
      newSeats[startIndex + j] = true;
      result.push(generateSeatNumber(startIndex + j));
    }
    seatsArray.splice(0, totalSeats, ...newSeats);
  }

  return result;
};


// Generating Seat Number after Booking

const generateSeatNumber = (seatIndex) => {
  let rowLetter = String.fromCharCode(
    "a".charCodeAt(0) + Math.floor(seatIndex / totalSeatsInRow)
  );
  let seatNumber = (seatIndex % totalSeatsInRow) + 1;
  if (seatIndex >= totalSeats - lastRowSeats) {
    rowLetter = "z";
    seatNumber = seatIndex - (totalSeats - lastRowSeats) + 1;
  }
  return rowLetter + seatNumber;
};

//reset 
const resetFun = async () => {
  seatsArray.fill(false);
  return BookModel.deleteMany({ isReserved: true });
};

//get All Booked Seats
seatRouters.get("/", async (req, res) => {
  BookModel.find()
    .then((trainSeatsBooking) => {
      res.send(trainSeatsBooking);
    })
    .catch((error) => {
      console.error("Error fetching booked seats:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

//Reserve Seats
seatRouters.post("/reserve", async (req, res) => {
  
  const seatCount = parseInt(req.body.seats);

  BookModel.find().then(async(trainSeatsBooking)=>{
    if(trainSeatsBooking.length === 0){
     await resetFun();
    }
  })

  const newBookedSeats = trainSeatsBookingFunc(seatCount);
  console.log("newBookedSeats:", newBookedSeats);

  if (newBookedSeats.length > 0) {
    const seatDocuments = newBookedSeats.map((seatNumber) => ({
      seatNumber: seatNumber,
      isReserved: true,
    }));
    console.log("seatDocuments:", seatDocuments);

    BookModel.insertMany(seatDocuments)
      .then(() => {
        res.json({ trainSeatsBooking: seatDocuments });
        console.log("newBookedSeats:", newBookedSeats);
      })
      .catch((error) => {
        console.error("Error saving booked seats:", error.message);
        res.status(500).json({ error: "Internal server error" });
      });
  } else {
    res.status(400).json({ error: "No seats available" });
  }
});

//Delete

seatRouters.delete("/delete", async (req, res) => {
  try {
    await BookModel.deleteMany({ isReserved: true }).then((trainSeatsBooking) => {
      console.log("Data deleted", trainSeatsBooking);
      res.send(trainSeatsBooking);
    });
    resetFun();
    
  } catch (error) {
    console.error("Error deleting and resetting seats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = {
  seatRouters,
};
