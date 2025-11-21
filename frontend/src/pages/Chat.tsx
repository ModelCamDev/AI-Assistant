import React, { useEffect, useRef, useState } from "react"
import { LuAudioLines, LuCircleStop, LuKeyboard, LuMic, LuSendHorizontal } from "react-icons/lu"
import { useAppDispatch, useAppSelector } from "../redux/app/hooks";
import { toast } from "react-toastify";
import { addLocalMessage, addWelcomeMessage, endLiveTranscript, setConversationId, startAIStreaming, startLiveTranscript, updateAIStreaming, updateLiveTranscript } from "../redux/slices/chatSlice";
import ReactMarkdown from 'react-markdown';
import LoadingComponent from "../components/User/LoadingComponent";
import { getSocket, initSocket } from "../sockets/socket";

function Chat() {
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(true);
  const [ isRecording, setIsRecording ] = useState(false);
  const [text, setText] = useState<string>('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const {messages, loading, conversationId} = useAppSelector((state)=>state.chat);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

// Handle welcome message
  const dispatch = useAppDispatch();
  useEffect(()=>{
    console.log("Chat component mounted");
    
    
    return ()=>{
      console.log("Chat component unmounted");
    }
  },[])

  // Handle Socket connection
  useEffect(()=>{
    const socket = initSocket();
    const welcomeMessage = `Hello! Welcome to Modelcam Technologies.   
      How can I help you today?`;
    const hasWelcomed = sessionStorage.getItem('hasWelcomedUser');
    if (!hasWelcomed) {
      console.log('Welcomed the user first time')
      sessionStorage.setItem('hasWelcomedUser', "true");
      socket.emit('generate_welcome_audio', {message: welcomeMessage});
      
    }else{
      console.log("Already welcomed")
    }
    socket.on('tts:welcome', ({ audioBase64 })=>{
      const byteString = atob(audioBase64);
      const byteArray = new Uint8Array(byteString.length);
      for(let i=0; i<byteString.length; i++){
        byteArray[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], {type: 'audio/mp3'});
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
      dispatch(addWelcomeMessage(welcomeMessage))
    });
    socket.on('ping_response', (msg)=>{
      console.log("Recieved Ping response:", msg)
    })
    // Handle conversation
    socket.on('conversation_created', (id)=>{
      console.log("Recieved ConversationId:", id);
      dispatch(setConversationId(id))
    })
    // Listen for ai response chunks
    let isStreaming = false;
    socket.on('agent_chunk', (token)=>{
      if (!isStreaming) {
        dispatch(startAIStreaming());
        isStreaming = true;
      }
      dispatch(updateAIStreaming(token));
    })
    // Streaming ended
    socket.on('agent_complete', ()=>{
      console.log('Full resposne recieved from AI')
      isStreaming = false
    })

    return ()=>{
      if (socket.id) {
        socket.disconnect();
      }
    }
  },[])

  // Handle Voice Events
  useEffect(() => {
    const socket = getSocket();
    socket.on("transcribe_partial", (data) => {
      console.log("Partial Transcript:", data.text);
      // Dispatch action to update live transcript
      dispatch(updateLiveTranscript(data.text));
    });

    socket.on("transcribe_complete", (data) => {
      console.log("Final Transcript:", data.text);
      // Dispatch action to update final transcript
      dispatch(endLiveTranscript(data.text));
      socket.emit('user_message', {message: data.text, conversationId: data.conversationId, mode:'voice'});
    });

    socket.on('tts:complete', ({ audioBase64 })=>{
      const byteString = atob(audioBase64);
      const byteArray = new Uint8Array(byteString.length);
      for(let i=0; i<byteString.length; i++){
        byteArray[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], {type: 'audio/mp3'});
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
    })
  }, [])

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
    // Emit users query to backend
    const io = getSocket();
    io.emit('user_message', {message: text, conversationId, mode:'text'});

    dispatch(addLocalMessage({role: 'user', content: text}))
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
            const mediaRecorder = new MediaRecorder(stream, {
              mimeType: 'audio/webm; codecs=opus'
            });
            // Store media recorder inside its ref to start/stop it later
            mediaRecorderRef.current = mediaRecorder;

            const socket = getSocket();
            socket.emit('voice:start', {conversationId});

            dispatch(startLiveTranscript());

            // Push recorded audio chunk into audioChunkRef array when data is available.
            mediaRecorder.ondataavailable = (event)=>{
                if (event.data.size>0) {
                  const reader = new FileReader();

                  reader.onloadend = ()=>{
                    if (typeof reader.result === 'string') {
                      const base64 = reader.result.split(",")[1];
                      socket.emit('voice:chunk', {
                        conversationId,
                        audioBase64: base64
                      });
                    }
                  };
                  reader.readAsDataURL(event.data)
                }
            };

            // START RECORDING FOR USER MEDIA (Input)
            mediaRecorder.start(250);
            setIsRecording(true);
            console.log("Listening for User Voice...");
        } catch (error) {
            console.log("Error accessing mic");
        }
    }

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t=>t.stop());
        getSocket().emit('voice:stop', {conversationId});
        mediaRecorderRef.current = null;
        setIsRecording(false);
        console.log("Stopped Listening for User Voice...");
      }
    } catch (error) {
      console.log('Error in stopping recording:', error)
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
        <button className="chat-button" onClick={()=>{
          const socket = getSocket();
          socket.emit('ping_check');
          setIsVoiceMode(prev=>!prev)
          }}>
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