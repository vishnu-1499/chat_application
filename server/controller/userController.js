const mongoose = require("mongoose");
const { signedToken } = require("../config/auth");
const { encPassword, decPassword } = require("../config/hash");
const userShema = require("../model/user");

class userController {
    register = async (req, res) => {
        const { email, password, role } = req.body;
        try {
            const existingUser = await userShema.findOne({ email })
            if (existingUser) return res.send({ status: false, message: "Mail Aldready Exists.." })

            const pass = await encPassword(password, process.env.PASS_KEY)
            const newUser = new userShema({
                email, name: email.split("@")[0], password: pass, role
            })
            await newUser.save()
                .then((resp) => res.send({ status: true, message: "Register Successfully..", data: resp }))
                .catch((err) => res.send({ status: false, message: "Register Failed..", err }))
        } catch (error) {
            console.log('error---', error);
            res.send({ status: false, message: "Internal Error in Register..." })
        }
    }

    login = async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await userShema.findOne({ email })
            if (!user) return res.send({ status: false, message: "Invalid Mail.." })

            const pass = await decPassword(user.password, process.env.PASS_KEY)
            if (pass !== password) return res.send({ status: false, message: "Invalid Password.." })
            const token = await signedToken({ id: user._id, role: user.role })
            if (token) {
                res.send({ status: true, message: "Login Successfully..", token, role: user.role })
            } else {
                res.send({ status: false, message: "Login Failed.." })
            }

        } catch (error) {
            console.log('error---', error);
            res.send({ status: false, message: "Internal Error in Login..." })
        }
    }

    getUserData = async (req, res) => {
        const { id, role } = res.users;
        try {
            const userData = await userShema.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id),
                        role: role
                    }
                },
                {
                    $lookup: {
                        from: "chatdetails",
                        localField: "_id",
                        foreignField: "senderID",
                        as: "chatData"
                    }
                },
                {
                    $project: {
                        password: 0,
                        "chatData.totalMessage.recieverData.recieverMessage": 0,
                        "chatData.totalMessage.recieverData.senderMessage": 0,
                    }
                }
            ]);

            const userDetail = await userShema.find({ _id: { $ne: id } }, { password: 0 });

            return res.send({ status: true, message: "User Data", data: userDetail });
        } catch (error) {
            console.error('Aggregation error:', error);
            return res.send({ status: false, message: "Internal Error in Get-User..." });
        }
    }
}

module.exports = new userController;