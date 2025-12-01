import OpenAI, { toFile } from 'openai';
import { Socket } from 'socket.io';
import { getSocket } from '../sockets/socket';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const transcribeAndStream = async (fullBuffer: Buffer, socket: Socket, conversationId: string)=>{
    try {
        const webmFile = await toFile(fullBuffer, 'audio.webm', { type: 'audio/webm'});
        const stream = await openai.audio.transcriptions.create({
            file: webmFile,
            model: 'gpt-4o-mini-transcribe',
            language: 'en',
            temperature: 0.3,
            stream: true
        });
        let partial = '';
        for await(const event of stream){
            if (event.type === 'transcript.text.delta') {
                partial += event.delta;
                socket.emit('transcribe_partial', {conversationId, text: partial});
            }
            if (event.type === 'transcript.text.done') {
                socket.emit('transcribe_complete', {conversationId, text: event.text});
                partial = '';
            }
        }
    } catch (error) {
        console.error("Transcription error:", error);
        socket.emit("transcript_error", {
            conversationId,
            error: "Transcription failed.",
        });
    }
}
export const transcribeAudio = async (audioBuffer: Buffer, fileName: string):Promise<string>=>{
    try {
        const webmFileName = fileName.includes('.') 
            ? fileName 
            : `${fileName}.webm`;

        const file = await toFile(audioBuffer, webmFileName, { type: "audio/webm" })
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            language: 'en',
            temperature: 0.5
        })
    
        return transcription.text;
    } catch (error) {
        console.log("Error while transcribing audio", error)
        throw new Error('Failed to transcribe audio')
    }
}

export const generateTextToSpeech = async(text: string):Promise<Buffer>=>{
    try {
        const response = await openai.audio.speech.create({
            input: text,
            model: 'gpt-4o-mini-tts',
            voice: 'coral',
            instructions: 'Use a polite, welcoming tone. Give helpful, concise responses, and naturally guide customers toward suitable products or services when it adds value.',
            speed: 0.9
        });
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        return audioBuffer;
    } catch (error) {
        console.log("Error while generating audio TTS:", error);
        throw new Error("Error while generating audio");
    }
}

export const getTextToSpeech = async(text: string, socketId: string)=>{
    try {
        if (!text.trim()) return;
        
        const response = await openai.audio.speech.create({
            input: text,
            model: 'gpt-4o-mini-tts',
            voice: 'coral',
            instructions: 'Use a polite, welcoming tone. Give helpful, concise responses, and naturally guide customers toward suitable products or services when it adds value.',
            speed: 0.9
        });
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const io = getSocket();
        io.to(socketId).emit('tts:complete', { audioBase64: audioBuffer.toString('base64')});

    } catch (error) {
        console.log("Error while generating audio TTS:", error);
        throw new Error("Error while generating audio");
    }
}