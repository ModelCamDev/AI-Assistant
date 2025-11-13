import React, { useEffect, useRef, useState } from "react"
import { LuAudioLines, LuCircleStop, LuKeyboard, LuMic, LuSendHorizontal } from "react-icons/lu"
import { useAppDispatch, useAppSelector } from "../redux/app/hooks";
import { toast } from "react-toastify";
import { addLocalMessage } from "../redux/slices/chatSlice";
import { generateVoiceThunk, sendMessageThunk, sendVoiceThunk } from "../redux/thunks/chatThunk";
import ReactMarkdown from 'react-markdown';
import LoadingComponent from "../components/User/LoadingComponent";

function Chat() {
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(true);
  const [ isRecording, setIsRecording ] = useState(false);
  const [text, setText] = useState<string>('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const {messages, loading} = useAppSelector((state)=>state.chat);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunk = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // const welcomePlayedRef = useRef<boolean>(false);

  const dispatch = useAppDispatch();
  useEffect(()=>{
    const hasWelcomed = sessionStorage.getItem('hasWelcomedUser')
    console.log("hasWelcomed:", hasWelcomed);
    console.log("Chat component mounted");
    if (!hasWelcomed) {
      sessionStorage.setItem('hasWelcomedUser', "true");
      handleWelcomeMessage();
    }
    return ()=>{
      console.log("Chat component unmounted");
    }
  },[])
  const scrollToBottom = ()=>{
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }
  useEffect(()=>{
    scrollToBottom()
  },[messages, loading])
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setText(e.target.value);
  }
  const handleOnSubmit = (e: React.FormEvent)=>{
    e.preventDefault();
    if (!text.trim()){
      toast.warning('Question cannot be empty');
      return
    }
    dispatch(addLocalMessage({role: 'user', content: text}))
    dispatch(sendMessageThunk(text));
    setText('');
  }

  const handleRecordingToggle = ()=>{
    if (isRecording) {
      setIsRecording(false);
      stopRecording()
    } else {
      setIsRecording(true);
      startRecording()
    }

  }
  const startRecording = async ()=>{
        try {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            // Get permission and recieve media stream
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});

            // Create new media recorder and pass media stream to it
            const mediaRecorder = new MediaRecorder(stream);
            // Store media recorder inside its ref to start/stop it later
            mediaRecorderRef.current = mediaRecorder;

            // Since we are starting recording so set audio chunks to empty array
            audioChunk.current = [];

            // Push recorded audio chunk into audioChunkRef array when data is available.
            mediaRecorder.ondataavailable = (event)=>{
                if (event.data.size>0) audioChunk.current.push(event.data);
            }
            // when mediarecorder stops handle stop recording i.e. process audioChunks and male request to backend
            mediaRecorder.onstop = handleStopRecording;

            // START RECORDING FOR USER MEDIA (Input)
            mediaRecorder.start();
            setIsRecording(true);
            console.log("Listening for User Voice...");
        } catch (error) {
            console.log("Error accessing mic");
        }
    }

  const stopRecording = ()=>{
    if(mediaRecorderRef.current){
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            console.log("Stopped Listening for User Voice...");
        }
  }

  const handleStopRecording = async()=>{
        // Create Audio blob from chunks
        const audioBlob = new Blob(audioChunk.current, {type: 'audio/webm'});
        // Create formData
        const formData = new FormData();
        formData.append('audio', audioBlob);
        try {
            const payload = await dispatch(sendVoiceThunk(formData)).unwrap();
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            audioRef.current = new Audio(`data:${payload.contentType};base64,${payload.audio}`);
            audioRef.current.play();
        } catch (error) {
            console.log("Error during voice chat");
        }
    }
  const handleWelcomeMessage = async () => {
    try {
      const welcomMessage = `Hello! Welcome to Modelcam Technologies.   
      How can I help you today?`;
      const payload = await dispatch(generateVoiceThunk(welcomMessage)).unwrap();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioRef.current = new Audio(`data:${payload.contentType};base64,${payload.audio}`);
      audioRef.current.play();
    } catch (error) {
      console.log("Error while playing welcome message");
    }
  }

  return (
    <div className="chat-view">
      <div className="chat-history" ref={chatHistoryRef}>
        {
          messages.map((message, idx)=>(
            message.role==='user'?
            (<div className="user-message" key={idx}>{message.content}</div>):
            (<div className="ai-message" key={idx}><ReactMarkdown>{message.content}</ReactMarkdown></div>)
          ))
        }
        {loading && <div className="typing-container">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          </div>}
      </div>
      <div className="chat-actions">
        <button className="chat-button" onClick={()=>setIsVoiceMode(prev=>!prev)}>
          {isVoiceMode?<LuKeyboard title="Text Mode" />:<LuAudioLines title="Voice Mode"/>}
        </button>
        {
        isVoiceMode?
        (<div className="input-form">
          <div className="audio-wave">{isRecording && <LoadingComponent text="Listening"/>}</div>
          <button className="chat-button" disabled={loading} onClick={handleRecordingToggle}>{isRecording?<LuCircleStop />:<LuMic/>}</button>
        </div>):
        (<form onSubmit={handleOnSubmit} className="input-form">
          <input type="text" value={text} onChange={handleOnChange} name="query" placeholder="Ask question" className="query-input" />
          <button type="submit" disabled={loading} className="chat-button"><LuSendHorizontal /></button>
        </form>)
        }
      </div>
    </div>
  )
}

export default Chat