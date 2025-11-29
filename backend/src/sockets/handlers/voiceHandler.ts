import { Socket } from "socket.io";
import conversationService from "../../services/conversation.service";
import { generateTextToSpeech, getTextToSpeech, transcribeAndStream } from "../../services/voice.service";

const buffersMap = new Map();
export function voiceHandler(socket: Socket){
    socket.on('conversation:init', async()=>{
        const conversation = await conversationService.createConversation();
        socket.emit('conversation_created', conversation._id.toString());
    })
    // Create conversation if not created.
    socket.on('voice:start', async ({ conversationId }) => {
        let finalConversationId = conversationId;
        try {
            if (!conversationId) {
                // const conversation = await conversationService.createConversation();
                // finalConversationId = conversation._id.toString();
                // socket.emit('conversation_created', conversation._id.toString());
                console.log("ConversationId not found on voice:start");
            }
            buffersMap.set(finalConversationId, []);
        } catch (error) {
            console.log('Error in starting voice');
        }
    })
    // Map voice buffer chunk to its respective conversation
    socket.on('voice:chunk', ({conversationId, audioBase64})=>{
        try {
            const buf = Buffer.from(audioBase64, 'base64');
            if (!buffersMap.get(conversationId)) {
                buffersMap.set(conversationId, [buf]);
            }else{
                buffersMap.get(conversationId)?.push(buf);
            }
        } catch (error) {
            console.log('Error in getting voice chunk');
        }
    })

    // Handle on voice stop
    socket.on('voice:stop', async({conversationId})=>{
        try {
            const buffers = buffersMap.get(conversationId)
            if (!buffers || buffers.length === 0) {
                console.log("No voice chunks recorded.", conversationId);
                return
            }
            const fullBuffers = Buffer.concat(buffers);
            await transcribeAndStream(fullBuffers, socket, conversationId);

            buffersMap.delete(conversationId);
            console.log('Voice stopped:', conversationId);
        } catch (error) {
            console.log('Error in handling voice:stop :', error);
        }
    })

    // Handle welcome message
    socket.on("generate_welcome_audio", async ({message}) => {
        const buffer = await generateTextToSpeech(message);
        socket.emit('tts:welcome', { audioBase64: buffer.toString('base64')})
    });
}