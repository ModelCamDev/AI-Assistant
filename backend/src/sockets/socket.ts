import {Server} from 'socket.io';
import type { Server as HttpServer} from 'http';
import { registerSocketHandlers } from './socketManager';

let io: Server | null = null;
export const initializeSocket = (server: HttpServer)=>{
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    console.log("Socket initialized");
    registerSocketHandlers(io);
    return io;
}

export const getSocket = ()=>{
    if (!io) throw new Error('Socket not initialized');
    return io;
}