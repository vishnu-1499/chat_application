const express = require("express");
const userController = require("../controller/userController");
const { verifyToken, adminOnly } = require("../config/auth");
const router = express.Router()

router.post("/signUp", userController.register);
router.post("/signIn", userController.login);
router.get("/get-Data", verifyToken, userController.getUserData);

module.exports = router;