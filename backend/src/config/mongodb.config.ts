import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leadflow'
async function connectToMongodb() {
    try {
        const client = await mongoose.connect(mongoURI)
        console.log('Connencted to DB:', client.connection.name);
        return
    } catch (error:any) {
        console.log('Error connecting to MongoDB', error);
    }
}

export default connectToMongodb;