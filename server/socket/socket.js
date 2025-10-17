const socketQuery = require("./socketQuery");
const jwt = require("jsonwebtoken");

module.exports = (io) => {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error"));

        await jwt.verify(token, process.env.JWT, (err, decoded) => {
            if (err) return next(new Error("Authentication error"));
            socket.userId = decoded.id;
            next();
        });
    });

    io.on("connection", (socket) => {
        console.log("Client Connected..", socket.id);

        socketQuery(io, socket);

        socket.on("disconnect", () => {
            console.log("Client Disconnected..", socket.id);
        })
    })
}