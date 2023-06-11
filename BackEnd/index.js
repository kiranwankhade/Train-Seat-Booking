const express = require("express");
const app = express();

app.use(express.json());



const { seatRouters } = require("./Routes/Seat.Routes");

require('dotenv').config();
const {connection} = require("./db");

app.get("/",(req,res)=>{
    console.log("HOME");
    res.send("WELCOME TO Unstop HOME PAGE")
})

app.use("/seats",seatRouters)

app.listen(process.env.port,async()=>{
    try{
        await connection;
        console.log("Connected")

    }catch(err){
        console.log("NOT Connected");
        console.log(err);
    }
    console.log(`CONNECT SERVER TO ${process.env.port} PORT`)
})
