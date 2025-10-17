require("dotenv").config();
const jwt = require("jsonwebtoken");
const users = require("../model/user");

exports.signedToken = (payload) => {
    return jwt.sign(payload, process.env.JWT, { expiresIn: "8h" })
}

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
    try {
        if (!token) return res.send({ status: false, message: "Invalid Token Credentials..." })

        const tokenDecode = await jwt.verify(token, process.env.JWT);
        const userData = await users.findById({ _id: tokenDecode.id })
        if (!userData) return res.send({ status: false, message: "Session Expired.." })

        res.users = {id: userData._id, role: userData.role}
        next()
    } catch (error) {
        console.log('error---', error);
        res.send({ status: false, message: "Internal Error in VerifyToken..." })
    }
}

exports.adminOnly = async (req, res, next) => {
  const user = res.users;

  if (user.role !== "admin") {
    return res.send({ status: false, message: "Admins only" });
  }
  next();
};