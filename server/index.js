const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const router = require("./router/route");
require("dotenv").config();

const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/user", router)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  }
})

require("./socket/socket")(io);

mongoose.connect(process.env.DB)
    .then(() => {
        console.log("DB Connected...");
        server.listen(process.env.PORT, () => {
            console.log(`Server Connected to PORT: ${process.env.PORT}`);
        })
    })
    .catch((err) => console.log("DB Connecteion Failed..", err))