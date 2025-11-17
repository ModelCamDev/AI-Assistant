import { io, Socket } from "socket.io-client";

const BACKEND_URL = "http://localhost:3000"; // adjust for production

let socket: Socket | null = null;

export const initSocket = () => {
  socket = io(BACKEND_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Connected to socket server:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
};
