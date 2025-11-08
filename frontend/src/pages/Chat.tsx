import React, { useEffect, useState } from "react"
import { LuAudioLines, LuKeyboard, LuMic, LuSendHorizontal } from "react-icons/lu"

function Chat() {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  useEffect(()=>{
    console.log("Chat component mounted");
    return ()=>{
      console.log("Chat component unmounted");
    }
  },[])
  const handleOnSubmit = (e: React.FormEvent)=>{
    e.preventDefault();
    console.log('Query submitted');
  }
  return (
    <div className="chat-view">
      <div className="chat-history">
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
        <div className="user-message">This is user's message</div>
        <div className="ai-message">This is AI's message</div>
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
          <input type="text" name="query" placeholder="Ask question" className="query-input" />
          <button type="submit" className="chat-button"><LuSendHorizontal /></button>
        </form>)
        }
      </div>
    </div>
  )
}

export default Chat