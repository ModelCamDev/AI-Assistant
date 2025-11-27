import React, { useEffect, useRef, useState } from "react";
import {
  LuAudioLines,
  LuCircleStop,
  LuKeyboard,
  LuMic,
  LuSendHorizontal,
} from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "../redux/app/hooks";
import { toast } from "react-toastify";

import {
  addLocalMessage,
  addWelcomeMessage,
  endLiveTranscript,
  setConversationId,
  startAIStreaming,
  startLiveTranscript,
  updateAIStreaming,
  updateLiveTranscript,
} from "../redux/slices/chatSlice";

import LoadingComponent from "../components/User/LoadingComponent";
import { getSocket, initSocket } from "../sockets/socket";

//  Chat Component
function Chat() {
  //  UI State
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [text, setText] = useState("");

 //  Redux State
  const dispatch = useAppDispatch();
  const { messages, loading, conversationId } = useAppSelector(
    (state) => state.chat
  );

  //  Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textModeRef = useRef(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  //  Component Mount / Unmount
  useEffect(() => {
    console.log("Chat mounted");
    return () => console.log("Chat unmounted");
  }, []);

  // SOCKET INITIALIZATION + WELCOME MESSAGE HANDLING
  useEffect(() => {
    const socket = initSocket();
    const welcomeMessage = `Hello! Welcome to Modelcam Technologies.   
      How can I help you today?`;

    const hasWelcomed = sessionStorage.getItem("hasWelcomedUser");
    const savedConversationId = sessionStorage.getItem("conversationId");

    // First-time welcome
    if (!hasWelcomed) {
      sessionStorage.setItem("hasWelcomedUser", "true");
      console.log("[Socket] Sending welcome TTS");
      socket.emit("generate_welcome_audio", { message: welcomeMessage });

      dispatch(startAIStreaming());
      setResponseLoading(true);

      if (!savedConversationId) socket.emit("conversation:init");
    } else {
      if (savedConversationId) dispatch(setConversationId(savedConversationId));
    }

    /* -------------------- TTS WELCOME ----------------------- */
    socket.on("tts:welcome", ({ audioBase64 }) => {
      playBase64Audio(audioBase64);
      dispatch(addWelcomeMessage(welcomeMessage));
      setResponseLoading(false);
    });

    /* -------------------- Conversation ID ----------------------- */
    socket.on("conversation_created", (id) => {
      console.log("[Socket] Conversation created:", id);
      dispatch(setConversationId(id));
      sessionStorage.setItem("conversationId", id);
    });

    /* -------------------- AI Stream Chunks ----------------------- */
    let isStreaming = false;

    socket.on("agent_chunk", (token) => {
      if (!isStreaming) {
        isStreaming = true;
        dispatch(startAIStreaming());
        setResponseLoading(true);
      }
      dispatch(updateAIStreaming(token));
    });

    socket.on("agent_complete", () => {
      console.log("[Socket] AI response completed");
      isStreaming = false;
      if (textModeRef.current) setResponseLoading(false);
    });

    return () => {
      if (socket.id) socket.disconnect();
    };
  }, []);

  //  SPEECH-TO-TEXT EVENTS
  useEffect(() => {
    const socket = getSocket();

    /* -------------------- Partial Transcript ------------------- */
    socket.on("transcribe_partial", (data) => {
      dispatch(updateLiveTranscript(data.text));
    });

    /* -------------------- Final Transcript ---------------------- */
    socket.on("transcribe_complete", (data) => {
      dispatch(endLiveTranscript(data.text));
      setTranscribeLoading(false);

      socket.emit("user_message", {
        message: data.text,
        conversationId: data.conversationId,
        mode: "voice",
      });
    });

    /* -------------------- TTS Complete -------------------------- */
    socket.on("tts:complete", ({ audioBase64 }) => {
      playBase64Audio(audioBase64);
      setResponseLoading(false);
    });
  }, []);

  //  AUTO SCROLL ON MESSAGE UPDATE
  const scrollToBottom = () => {
    if (!chatHistoryRef.current) return;
    chatHistoryRef.current.scrollTo({
      top: chatHistoryRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const t = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(t);
  }, [messages, loading]);

  //  HELPER: PLAY BASE64 AUDIO (TTS)
  const playBase64Audio = (base64: string) => {
    try {
      const byteString = atob(base64);
      const byteArray = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i++)
        byteArray[i] = byteString.charCodeAt(i);

      const blob = new Blob([byteArray], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      audioRef.current = new Audio(url);
      audioRef.current.play();
    } catch (err) {
      console.error("Failed to play audio:", err);
    }
  };

  //  VOICE RECORDING — START & STOP
  const startRecording = async () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm; codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;

      const socket = getSocket();
      socket.emit("voice:start", { conversationId });

      dispatch(startLiveTranscript());
      setTranscribeLoading(true);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size <= 0) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            const base64 = reader.result.split(",")[1];
            socket.emit("voice:chunk", {
              conversationId,
              audioBase64: base64,
            });
          }
        };
        reader.readAsDataURL(event.data);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      console.log("[Mic] Recording started");
    } catch (error) {
      console.error("Mic access error:", error);
    }
  };

  const stopRecording = () => {
    try {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      getSocket().emit("voice:stop", { conversationId });

      mediaRecorderRef.current = null;
      setIsRecording(false);

      console.log("[Mic] Recording stopped");
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  //  UI HANDLERS
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setText(e.target.value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      toast.warning("Question cannot be empty");
      return;
    }

    const socket = getSocket();
    socket.emit("user_message", {
      message: text,
      conversationId,
      mode: "text",
    });

    dispatch(addLocalMessage({ role: "user", content: text }));
    setText("");
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const toggleMode = () => {
    const socket = getSocket();
    socket.emit("ping_check");

    textModeRef.current = !textModeRef.current;
    setIsVoiceMode((prev) => !prev);
  };

  //RENDER UI
  return (
    <div className="chat-view">
      {/* Chat Messages History */}
      <div className="chat-history" ref={chatHistoryRef}>
        {messages.map((msg, idx) =>
          msg.role === "user" ? (
            <div className="user-message" key={idx}>
              {msg.content}
              {idx === messages.length - 1 && transcribeLoading && (
                <div className="loading-block"></div>
              )}
            </div>
          ) : (
            <div className="ai-message" key={idx}>
              {msg.content}
              {idx === messages.length - 1 && responseLoading && (
                <div className="loading-block"></div>
              )}
            </div>
          )
        )}
      </div>

      {/* Input Bar */}
      <div className="chat-actions">
        <button className="chat-button" onClick={toggleMode}>
          {isVoiceMode ? (
            <LuKeyboard title="Text Mode" />
          ) : (
            <LuAudioLines title="Voice Mode" />
          )}
        </button>

        {isVoiceMode ? (
          <div className="input-form">
            <div className="audio-wave">
              {isRecording && <LoadingComponent text="Listening" />}
            </div>

            <button
              className="chat-button"
              disabled={!conversationId}
              onClick={toggleRecording}
            >
              {isRecording ? <LuCircleStop /> : <LuMic />}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={text}
              name="query"
              onChange={handleTextChange}
              placeholder="Ask question"
              className="query-input"
            />
            <button type="submit" disabled={loading} className="chat-button">
              <LuSendHorizontal />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chat;
