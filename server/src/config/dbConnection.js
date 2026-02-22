const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDb = async() => {
    try{
        const dbUri = process.env.NODE_ENV === "test" ? process.env.MONGO_URI_TEST : process.env.MONGO_URI_DEV;
        if(!dbUri){
            throw new Error("Error connecting database");
        }
        await mongoose.connect(dbUri);
        console.log(`Connected to ${process.env.NODE_ENV === "test" ? "TEST DB" : "DEV DB"}`
    );
    }catch(err){
        console.log(err);
    }
}

module.exports = connectDb;