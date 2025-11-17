import connectToMongodb from "./config/mongodb.config";
import app from "./server";
import http from 'http';
import { initializeSocket } from "./sockets/socket";
const httpServer = http.createServer(app);

initializeSocket(httpServer);

httpServer.listen(3000, async()=>{
    console.log("Server is running on port 3000");
    await connectToMongodb();
})