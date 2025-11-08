import React, { useEffect, useRef, useState } from "react"
import { LuAudioLines, LuKeyboard, LuMic, LuSendHorizontal } from "react-icons/lu"
import { useAppDispatch, useAppSelector } from "../redux/app/hooks";
import { toast } from "react-toastify";
import { addLocalMessage } from "../redux/slices/chatSlice";
import { sendMessageThunk } from "../redux/thunks/chatThunk";
import ReactMarkdown from 'react-markdown';
import LoadingComponent from "../components/User/LoadingComponent";

function Chat() {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [text, setText] = useState<string>('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const {messages, loading} = useAppSelector((state)=>state.chat);
  const dispatch = useAppDispatch();
  useEffect(()=>{
    console.log("Chat component mounted");
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
        {loading && <LoadingComponent text="Thinking..."/>}
      </div>
      <div className="chat-actions">
        <button className="chat-button" onClick={()=>setVoiceEnabled(prev=>!prev)}>
          {voiceEnabled?<LuKeyboard title="Text Mode" />:<LuAudioLines title="Voice Mode"/>}
        </button>
        {
        voiceEnabled?
        (<div className="input-form">
          <div className="audio-wave"></div>
          <button className="chat-button"><LuMic/></button>
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