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
  removeEmptyUserMessage,
  setConversationId,
  startAIStreaming,
  startLiveTranscript,
  updateAIStreaming,
  updateLiveTranscript,
} from "../redux/slices/chatSlice";

import LoadingComponent from "../components/User/LoadingComponent";
import { getSocket, initSocket } from "../sockets/socket";

function Chat() {
  // UI state
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [text, setText] = useState("");
  const [isActivelyListening, setIsActivelyListening] = useState(false);

  // Redux state
  const dispatch = useAppDispatch();
  const { messages, loading, conversationId } = useAppSelector(
    (state) => state.chat
  );

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textModeRef = useRef(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const speechDetectedRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);

  /**
   * Initialize Web Speech API recognition (if available) and log mount/unmount.
   * Stores a recognition instance in recognitionRef for use by startListening().
   */
  useEffect(() => {
    console.log("Chat mounted");
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;
    } else {
      console.warn("Your browser does not support SpeechRecognition");
    }
    return () => console.log("Chat unmounted");
  }, []);

  /**
   * Keep conversationIdRef synchronized with the Redux conversationId.
   */
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  /**
   * Initialize socket connection, send welcome TTS on first visit,
   * manage conversation creation and AI streaming events.
   */
  useEffect(() => {
    const socket = initSocket();
    const welcomeMessage = `Hello! Welcome to Modelcam Technologies.   
      How can I help you today?`;

    const hasWelcomed = sessionStorage.getItem("hasWelcomedUser");
    const savedConversationId = sessionStorage.getItem("conversationId");

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

    socket.on("tts:welcome", ({ audioBase64 }) => {
      playBase64Audio(audioBase64);
      dispatch(addWelcomeMessage(welcomeMessage));
      setResponseLoading(false);
    });

    socket.on("conversation_created", (id) => {
      console.log("[Socket] Conversation created:", id);
      dispatch(setConversationId(id));
      sessionStorage.setItem("conversationId", id);
    });

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

  /**
   * Register socket handlers for partial/final speech transcripts and TTS completion.
   */
  useEffect(() => {
    const socket = getSocket();

    socket.on("transcribe_partial", (data) => {
      dispatch(updateLiveTranscript(data.text));
    });

    socket.on("transcribe_complete", (data) => {
      dispatch(endLiveTranscript(data.text));
      setTranscribeLoading(false);

      socket.emit("user_message", {
        message: data.text,
        conversationId: data.conversationId,
        mode: "voice",
      });
    });

    socket.on("tts:complete", ({ audioBase64 }) => {
      playBase64Audio(audioBase64);
      setResponseLoading(false);
    });
  }, []);

  /**
   * Scroll the chat history to the bottom.
   */
  const scrollToBottom = () => {
    if (!chatHistoryRef.current) return;
    chatHistoryRef.current.scrollTo({
      top: chatHistoryRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  /**
   * Auto-scroll effect: run scrollToBottom when messages or loading change.
   */
  useEffect(() => {
    const t = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(t);
  }, [messages, loading]);

  /**
   * Play a base64-encoded TTS audio blob and auto-start recording when playback ends.
   */
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

      audioRef.current.onended = () => {
        console.log("TTS Finished playing -> Calling startRecording()");
        startRecording();
      };
    } catch (err) {
      console.error("Failed to play audio:", err);
    }
  };

  /**
   * Start microphone recording, emit voice:start, stream chunks to server,
   * and start speech recognition for live transcription.
   */
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
      socket.emit("voice:start", { conversationId: conversationIdRef.current });

      dispatch(startLiveTranscript());
      setTranscribeLoading(true);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size <= 0) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            const base64 = reader.result.split(",")[1];
            socket.emit("voice:chunk", {
              conversationId: conversationIdRef.current,
              audioBase64: base64,
            });
          }
        };
        reader.readAsDataURL(event.data);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      console.log("[Mic] Recording started");
      startListening();
    } catch (error) {
      console.error("Mic access error:", error);
    }
  };

  /**
   * Stop recording/recognition, emit voice:stop and reset recording state.
   */
  const processVoiceInput = () => {
    console.log("[Listen] Processing voice input");
    setIsActivelyListening(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
      } catch (err) {
        console.error("[Mic] Error stopping:", err);
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    getSocket().emit("voice:stop", {
      conversationId: conversationIdRef.current,
    });

    speechDetectedRef.current = false;
    setIsRecording(false);
  };

  /**
   * Start Web Speech API recognition, handle interim/final results and silence timer.
   */
  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }
    try {
      recognition.stop();
    } catch (error) {}

    recognition.onstart = () => {
      console.log("[Listen] Recognition started - Now actively listening");
      setIsActivelyListening(true);
    };

    setTimeout(() => {
      recognition.start();
    }, 100);

    recognition.onresult = (event: any) => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (!speechDetectedRef.current) {
        speechDetectedRef.current = true;
        console.log("[Listen] Speech detected!");
      }

      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;

      console.log(
        "[Listen] Transcript:",
        transcript,
        "(final:",
        event.results[current].isFinal + ")"
      );

      silenceTimerRef.current = setTimeout(() => {
        if (speechDetectedRef.current) {
          console.log("[Listen] 2 seconds of silence detected → processing");
          processVoiceInput();
        }
      }, 1500);
    };

    recognition.onend = () => {
      setIsActivelyListening(false);

      if (!manuallyStoppedRef.current && !speechDetectedRef.current) {
        console.log("[Listen] Recognition ended, restarting...");
        setTimeout(() => {
          try {
            recognition.start();
          } catch {}
        }, 350);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("[Listen] Error:", event.error);
      setIsActivelyListening(false);

      if (event.error === "no-speech" && !manuallyStoppedRef.current) {
        console.log("[Listen] No speech detected, restarting recognition...");
        setTimeout(() => {
          try {
            recognition.start();
          } catch {}
        }, 350);
      }
    };
  };

  /**
   * Stop the media recorder and speech recognition, clear timers and update UI flags.
   */
  const stopRecording = () => {
    try {
      if (!mediaRecorderRef.current) return;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());

      mediaRecorderRef.current = null;
      setIsRecording(false);
      setIsActivelyListening(false);
      setTimeout(() => {
        setTranscribeLoading(false);
        dispatch(removeEmptyUserMessage());
      }, 2000);
      recognitionRef.current.stop();
      console.log("[Mic] Recording stopped");
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  /**
   * Update controlled text input value.
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setText(e.target.value);

  /**
   * Send text message to server and add local message entry.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      toast.warning("Question cannot be empty");
      return;
    }

    const socket = getSocket();
    socket.emit("user_message", {
      message: text,
      conversationId: conversationIdRef.current,
      mode: "text",
    });

    dispatch(addLocalMessage({ role: "user", content: text }));
    setText("");
  };

  /**
   * Toggle manual recording and mark manual stop state.
   */
  const toggleRecording = () => {
    if (isRecording) {
      manuallyStoppedRef.current = true;
      stopRecording();
    } else {
      manuallyStoppedRef.current = false;
      startRecording();
    }
  };

  /**
   * Toggle between voice and text mode and notify server.
   */
  const toggleMode = () => {
    const socket = getSocket();
    socket.emit("ping_check");

    textModeRef.current = !textModeRef.current;
    setIsVoiceMode((prev) => !prev);
  };

  return (
    <div className="chat-view">
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

      <div className="chat-actions">
        <button className="chat-button" onClick={toggleMode}>
          {isVoiceMode ? <LuKeyboard title="Text Mode" /> : <LuAudioLines title="Voice Mode" />}
        </button>

        {isVoiceMode ? (
          <div className="input-form">
            <div className="audio-wave">
              {isRecording && isActivelyListening && <LoadingComponent text="Listening" />}
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