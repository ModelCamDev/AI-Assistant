import { Socket } from "socket.io";
import { leadFlow } from "../../ai/workflow/leadFlow";

export function textHandler(socket: Socket){
    socket.on('user_message', async ({message, conversationId = "conv_1"})=>{
        try {
            const stream = await leadFlow.stream({userMessage: message, socketId: socket.id}, {configurable: {thread_id: conversationId}});
            for await(const _ of stream){}
        } catch (error) {
            console.log('Error in streaming graph');
            socket.emit('graph stream error')
        }
    })
}