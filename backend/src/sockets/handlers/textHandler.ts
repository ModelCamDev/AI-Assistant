import { Socket } from "socket.io";
import { leadFlow } from "../../ai/workflow/leadFlow";
import conversationService from "../../services/conversation.service";

export function textHandler(socket: Socket){
    socket.on('user_message', async ({message, conversationId, mode})=>{
        let finalConversationId = conversationId;
        try {
            if (!conversationId) {
                const conversation = await conversationService.createConversation();
                finalConversationId = conversation._id.toString();
                socket.emit('conversation_created', conversation._id.toString());
            }
            console.time('graphInvokationStream')
            const stream = await leadFlow.stream({userMessage: message, socketId: socket.id, conversationId: finalConversationId, mode}, {configurable: {thread_id: finalConversationId}});
            for await(const _ of stream){}
            console.timeEnd('graphInvokationStream')
        } catch (error) {
            console.log('Error in streaming graph', error);
            socket.emit('graph stream error')
        }
    })
}