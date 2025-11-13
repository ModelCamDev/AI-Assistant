import OpenAI, { toFile } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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