import connectToMongodb from "./config/mongodb.config";
import app from "./server";

app.listen(3000, async()=>{
    console.log("Server is running on port 3000");
    await connectToMongodb();
})