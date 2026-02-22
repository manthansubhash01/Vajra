const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async(req,res) => {
    try{
        const {name, password, age, phone, email, address} = req.body;

        if(!name || !password || !age || !phone || !email || !address){
            return res.status(400).json({ message : "All fields are required"});
        };

        if(!email.includes("@")){
            return res.status(400).json({ message : "Email is not valid"});
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

        return res.status(201).json({ message : "User registered successfully"});
    }catch(err){
        console.log(err)
        return res.status(500).json({ message : "Faild to register user try again"});
    }
};

const login = async (req, res) => {
    try {
        const { name, phone, password } = req.body;

        if ((!name && !phone) || !password) {
        return res.status(400).json({
            message: "Name or phone and password are required",
        });
        }

        const user = await User.findOne({
        $or: [{ name }, { phone }],
        });

        if (!user) {
        return res.status(400).json({ message: "User not found" });
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);

        if (!isCorrectPassword) {
        return res.status(400).json({ message: "Incorrect password" });
        }

        const token = jwt.sign(
        { id: user._id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
        );

        return res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
        message: "Failed to login user try again",
        });
    }
};

module.exports = {register, login};