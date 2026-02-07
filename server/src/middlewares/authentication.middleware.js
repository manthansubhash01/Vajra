const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authenticate = async(req, res, next) => {
    try{
        const {name, phone, password} = req.body;

        if(!name && !phone){
            res.status(400).json({ message : "Either name or phone is required"});
        }

        if(!password){
            res.status(400).json({ message : "Password is required"});
        }

        const user  = await User.find({name : name, phone : phone})
        const isCorrectPassword = await bcrypt.compare(password, user.password);

        if(!isCorrectPassword){
            res.status(400).json({ message: "Incorrect password please try again with correct one"});
        }

        req.body.user = user

        next();
    }catch(err){
        console.log(err);
        res.status(500).json({ message : "Failed to authenticate user"})
    }
}

module.exports = authenticate;