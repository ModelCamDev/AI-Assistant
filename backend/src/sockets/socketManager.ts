import { Socket, Server} from 'socket.io';
import { textHandler } from './handlers/textHandler';
import { voiceHandler } from './handlers/voiceHandler';

export function registerSocketHandlers(io: Server){
    io.on('connection', (socket: Socket)=>{
        // Log when client connected
        console.log('Client socket connected:', socket.id);
        // Log when client disconnected
        socket.on('disconnect', ()=>{
            console.log('Client socket disconnected:', socket.id);
        })

        // Test handler
        socket.on('ping_check', ()=>{
            socket.emit('ping_response', 'pong')
        })
        // Text chat handler
        textHandler(socket);
        // Voice chat handler
        voiceHandler(socket);
    })
}