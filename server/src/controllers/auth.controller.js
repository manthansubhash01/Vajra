const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async(req,res) => {
    try{
        const {name, password, age, phone, email, address} = req.body;

        if(!name || !password || !age || !phone || !email || !address){
            res.status(400).json({ message : "All fields are required"});
        };

        if(!email.includes("@")){
            res.status(400).json({ message : "Email is not valid"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name : name,
            password : hashedPassword,
            age : age,
            phone : phone,
            email : email,
            address : address
        })

        await newUser.save();

        res.status(201).json({ message : "User registered successfully"});
    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Faild to register user try again"});
    }
};

const login = async(req, res) => {
    try{
        const user = req.body.user;

        const secretKey = process.env.JWT_SECRET;
        const token = await jwt.sign(
            { id: user._id, name: user.name },
            secretKey,
            {expiresIn : '24h'}
        )

        res.status(200).josn({ token : token})

    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Failed to login user try again"})
    }
}

module.exports = {register, login};