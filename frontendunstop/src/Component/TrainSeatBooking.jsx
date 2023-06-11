import React, { useState, useEffect } from "react";

import "../Styles/TrainSeatBooking.css"


function TrainSeatBooking() {    
    //Data Given
  const totalSeats = 80;
  const totalSeatsInRow = 7;
  const lastRowSeats = 3;

  const [seats, setSeats] = useState(new Array(totalSeats).fill(false));
  const [bookedSeats, setBookedSeats] = useState([]);
  const [seatCount, setSeatCount] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchBookedSeats();
  }, [seatCount]);

  const fetchBookedSeats = () => {
    fetch("https://unstop-lsm6.onrender.com/seats")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if(seatCount === ""){
            if(data && data.length > 0){
                const newSeats = [...seats];
                data.forEach((el,i) => {
                    const seatIndex = getSeatIndex(el.seatNumber);
                    if (seatIndex !== -1) {
                      newSeats[seatIndex] = true;
                    }
                  });
                setSeats(newSeats);
                setBookedSeats(data);
            }
        }

        // console.log('data.trainSeatsBooking:', data.trainSeatsBooking)
        if (data.trainSeatsBooking && data.trainSeatsBooking.length > 0) {
          const newSeats = [...seats];
          data.trainSeatsBooking.forEach((seatNumber) => {
            const seatIndex = getSeatIndex(seatNumber);
            if (seatIndex !== -1) {
              newSeats[seatIndex] = true;
            }
          });
          setSeats(newSeats);
          setBookedSeats(data.bookedSeats);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleSeatBooking = async() => {
    if (seatCount === "" || parseInt(seatCount) <= 0) {
      setMsg("Please enter a valid number of seats");
      setTimeout(() => {
        setMsg("");
      }, 3000);
      return;
    }

    if(parseInt(seatCount) > 7) {
        setMsg("⚠️can't Booked more than 7 seats at one time");
        setTimeout(() => {
          setMsg("");
        }, 3000);
      }


    try{

        let res = await fetch("https://unstop-lsm6.onrender.com/seats/reserve", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ seats: parseInt(seatCount) }),
          })

        let data = await res.json();

        if (data.trainSeatsBooking && data.trainSeatsBooking.length > 0) {
            const newSeats = [...seats];
            data.trainSeatsBooking.forEach((seatNumber) => {
              const seatIndex = getSeatIndex(seatNumber);
              if (seatIndex !== -1) {
                newSeats[seatIndex] = true;
              }
            });
            setSeats(newSeats);
            setBookedSeats(data.trainSeatsBooking);
            setSeatCount("");
          } 
          

    }catch(err){
        console.error("Error:", err);
        setMsg("Something went wrong. Please try again later.");
        setTimeout(() => {
          setMsg("");
        }, 3000);
    }
    
   
  };

  //generating Seat Numbers As in row with alphabet
  const generateSeatNumber = (seatIndex) => {
    let rowLetter = String.fromCharCode("a".charCodeAt(0) + Math.floor(seatIndex / totalSeatsInRow));
    let seatNumber = (seatIndex % totalSeatsInRow) + 1;
    if (seatIndex >= totalSeats - lastRowSeats) {
      rowLetter = "z";
      seatNumber = seatIndex - (totalSeats - lastRowSeats) + 1;
    }
    return rowLetter + seatNumber;
  };

  //Get the Seat Index so we can show up it in UI
  const getSeatIndex = (seatNumber) => {
    for (let i = 0; i < totalSeats; i++) {
      if (generateSeatNumber(i) === seatNumber) {
        return i;
      }
    }
    return -1;
  };


  //Handle function For Input Field
  const handleChange = (event) => {
    setSeatCount(event.target.value);
  };

  return (
    <div id="main">
    <h1>Train Seat Booking System</h1>
    <br/>
    <div id="main-container" >
         
        <div id="leftDiv">
        <h3>Booking App 🚊</h3>
        <hr />
      <p>Enter the number of seats you want to book:</p>
      <div id="inputField">
      <input
        type="number"
        value={seatCount}
        onChange={handleChange}
        placeholder="No of seats to book. eg. 1-7"
      />
      <h3 id="msg">{msg}</h3>
      <button
        onClick={handleSeatBooking}
      >
        Book
      </button>

        <hr />
        <br />
      <div>
        Total Available : <span style={{color:"red"}}>{80-bookedSeats.length}</span>
      </div>
    <br />
      </div>
      <hr />
      {bookedSeats.length > 0 && (
        <div id="bookSeats"><strong>Booked Seat no:</strong>
        <p>{bookedSeats.map((el) => (
           " "+ el.seatNumber + ","
        ))}</p></div>
      )}
      <hr />
      </div>
      <div id="rightDiv">

      <div className="Hint">
        <div>
        <div className="Available"></div>
        <p className="hint_text">Available</p>
        </div>
            <div>
            <div className="Booked"></div>
        <p className="hint_text">Booked</p>
            </div>
       
       
      </div>
        <div id="gridView">
        {seats.map((isReserved, index) => (
          <div
            key={index}
            style={{
                width:"80%",
              display: "inline-block",
              backgroundColor: isReserved ? "tomato" : "#023530",
              padding: "5px",
              margin: "5px",
              color: "white",
              borderRadius: "3px",
            }}
          >
            {generateSeatNumber(index)}
          </div>
        ))}
      </div>
      </div>
     
    </div>
    </div>
  );
}

export default TrainSeatBooking;