const mongoose = require("mongoose");
const connectionUrl = process.env.CONNECTION_URL;

const connectMongoDb = async() => {
    try{
        await mongoose.connect(connectionUrl);
        console.log("Database Connected Successfully");
    }catch(error){
        console.log("Database connection error: ", error.message);
    }
}

module.exports = connectMongoDb;