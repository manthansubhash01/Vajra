const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDb = async() => {
    try{
        const dbUri = process.env.MongoDB_URI;
        if(!dbUri){
            throw new Error("Error connecting database");
        }
        await mongoose.connect(dbUri);
        console.log("connected to the database");
    }catch(err){
        console.log(err);
    }
}

module.exports = connectDb;