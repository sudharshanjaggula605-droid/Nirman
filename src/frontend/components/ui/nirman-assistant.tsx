"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  Building2, 
  FileText, 
  IndianRupee, 
  ShieldCheck, 
  PhoneCall, 
  Compass,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { startAppTour } from "@/frontend/components/interactive-tour";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  hindiText?: string;
  actionUrl?: string;
  actionText?: string;
  actionTour?: boolean;
}

// Predefined questions tailored for contractors, property owners, and non-technical users
const QUICK_CHIPS = [
  {
    icon: Compass,
    label: "Show me App Tour",
    query: "Start application tour"
  },
  {
    icon: FileText,
    label: "How to bid on tenders?",
    query: "How do contractors bid on tenders?"
  },
  {
    icon: Building2,
    label: "How to post a project?",
    query: "How can property owners post a project?"
  },
  {
    icon: IndianRupee,
    label: "Is my payment safe?",
    query: "How do milestone payments and escrow work?"
  },
  {
    icon: ShieldCheck,
    label: "Contractor verification",
    query: "How to verify contractor license?"
  },
  {
    icon: PhoneCall,
    label: "Talk to support",
    query: "How to contact NIRMAN support?"
  }
];

export function NirmanAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: "Welcome! I am NIRMAN Saathi, your guided assistant. You can ask me anything about finding tenders, submitting bids, or tracking payments. Tap the microphone to speak, or select any question below!",
      actionTour: true,
      actionText: "Take 1-Minute App Tour"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Global event listener to open assistant from any trigger (e.g. tour, mobile bottom nav)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("nirman_open_assistant", handleOpen);
    return () => window.removeEventListener("nirman_open_assistant", handleOpen);
  }, []);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN"; // English (India) with Hindi loan-words support

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputVal(transcript);
            handleSend(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Cancel speech synthesis when closing
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported on this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string, msgId: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking && speakingMsgId === msgId) {
      stopSpeech();
      return;
    }

    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-IN") || v.lang.includes("en-GB"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    setIsSpeaking(true);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Rule-based knowledge engine in plain, simple language for non-technical users
  const getBotResponse = (query: string): Omit<Message, "id" | "sender"> => {
    const q = query.toLowerCase();

    if (q.includes("tour") || q.includes("walkthrough") || q.includes("how to use") || q.includes("guide")) {
      return {
        text: "I can start the visual interactive tour right now! It walks you through live tenders, easy bidding, and safe payments in 5 simple steps.",
        actionTour: true,
        actionText: "Start Interactive Tour"
      };
    }

    if (q.includes("bid") || q.includes("tender") || q.includes("contractor") || q.includes("quote") || q.includes("boq")) {
      return {
        text: "Contractors can browse open tenders on the Live Tenders page. Click on any tender to view work details, then enter your price breakdown (materials, labor, timeline). Once submitted, the owner can compare and accept your bid!",
        actionUrl: "/tenders",
        actionText: "View Live Tenders"
      };
    }

    if (q.includes("post") || q.includes("owner") || q.includes("project") || q.includes("create")) {
      return {
        text: "Property owners can create a new project in 2 minutes: enter your construction site location, building size (sq ft), and estimated budget. Once published, licensed contractors will submit their quotes for you to compare.",
        actionUrl: "/owner/projects/new",
        actionText: "Post a New Project"
      };
    }

    if (q.includes("payment") || q.includes("safe") || q.includes("money") || q.includes("escrow") || q.includes("rupee") || q.includes("paisa")) {
      return {
        text: "NIRMAN protects both sides with Milestone Escrow! The owner deposits funds safely with the platform. Money is only released to the contractor in stages after the owner inspects and approves the work.",
        actionUrl: "/contact",
        actionText: "Learn About Escrow Safety"
      };
    }

    if (q.includes("verify") || q.includes("license") || q.includes("kyc") || q.includes("gst") || q.includes("pan")) {
      return {
        text: "Every contractor on NIRMAN must submit a valid contractor license, GST certificate, and PAN number. Our admin team verifies each document before granting the verified badge.",
        actionUrl: "/register",
        actionText: "Submit KYC Documents"
      };
    }

    if (q.includes("support") || q.includes("help") || q.includes("contact") || q.includes("phone") || q.includes("number") || q.includes("call")) {
      return {
        text: "Need personal assistance? You can submit a support ticket directly, or reach out through our helpline. Our team responds within a few hours!",
        actionUrl: "/contact",
        actionText: "Go to Support Desk"
      };
    }

    if (q.includes("register") || q.includes("signup") || q.includes("account") || q.includes("login")) {
      return {
        text: "Signing up is completely free! Choose whether you are a Property Owner (wanting to build) or a Licensed Contractor (wanting to take contracts).",
        actionUrl: "/register",
        actionText: "Create Free Account"
      };
    }

    // Default friendly fallback
    return {
      text: "I am here to guide you! You can ask about: 1) Finding open tenders, 2) Posting a construction project, 3) Safe milestone payments, or 4) Taking the app tour.",
      actionTour: true,
      actionText: "Take App Tour"
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputVal).trim();
    if (!text) return;

    stopSpeech();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text
    };

    const botResponse = getBotResponse(text);
    const botMsg: Message = {
      id: `bot-${Date.now() + 1}`,
      sender: "bot",
      ...botResponse
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInputVal("");
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-20 sm:right-5 md:bottom-6 md:right-6 z-[99995] flex items-center gap-2 select-none">
          {/* Animated Helper Badge / Pill (Hidden on mobile, visible on desktop) */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/95 text-foreground text-xs font-bold shadow-lg border border-orange-500/30 backdrop-blur-md hover:border-orange-500 hover:shadow-orange-500/15 active:scale-95 transition-all cursor-pointer animate-bounce"
            aria-label="Ask NIRMAN Saathi"
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-500 shrink-0" />
            <span>Need Help? Speak or Tap!</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/35 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/25 ring-2 ring-orange-500/20 cursor-pointer"
            aria-label="Open NIRMAN Saathi Assistant"
          >
            <Bot className="h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover:rotate-6 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-orange-500 border-2 border-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* Assistant Window */}
      {isOpen && (
        <>
          {/* Mobile Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100020] sm:hidden animate-in fade-in duration-200"
            onClick={() => {
              stopSpeech();
              setIsOpen(false);
            }}
            aria-hidden="true"
          />

          <div
            className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 z-[100025] w-full sm:w-[420px] max-h-[92vh] sm:max-h-[85vh] h-[88vh] sm:h-[600px] flex flex-col rounded-t-[28px] sm:rounded-3xl border-t sm:border border-border/80 bg-card/98 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="NIRMAN Saathi Assistant"
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mt-2.5 -mb-0.5 sm:hidden shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-white/15 border border-white/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold tracking-tight">NIRMAN Saathi</h3>
                  </div>
                  <p className="text-xs text-orange-100 font-medium">
                    Voice & Guided Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopSpeech}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    title="Mute voice"
                    aria-label="Mute Voice"
                  >
                    <VolumeX className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Assistant"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-muted/20 scrollbar-thin">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`relative max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-orange-600 text-white rounded-br-none shadow-md"
                        : "bg-card text-card-foreground border border-border/70 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p className="font-medium">{m.text}</p>

                    {/* Speaker Button for Audio Read-Aloud */}
                    {m.sender === "bot" && (
                      <button
                        onClick={() => speakText(m.text, m.id)}
                        className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isSpeaking && speakingMsgId === m.id
                            ? "bg-orange-500 text-white border-orange-600 ring-2 ring-orange-500/30 animate-pulse"
                            : "bg-muted hover:bg-accent text-foreground border-border"
                        }`}
                        title="Read aloud"
                      >
                        {isSpeaking && speakingMsgId === m.id ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5" />
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5 text-orange-500" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Action Link Button */}
                    {m.actionUrl && (
                      <div className="mt-2.5 pt-2 border-t border-border/40">
                        <Link
                          href={m.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-600 dark:text-orange-400 border border-orange-500/30 transition-all"
                        >
                          <span>{m.actionText || "Open Feature"}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}

                    {/* Action Tour Trigger Button */}
                    {m.actionTour && (
                      <div className="mt-2.5 pt-2 border-t border-border/40">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            startAppTour();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition-all cursor-pointer"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>{m.actionText || "Start App Tour"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips (Tap without typing) */}
            <div className="px-3.5 py-2.5 bg-card border-t border-border/60 shrink-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                One-Tap Questions:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
                {QUICK_CHIPS.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip.query)}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 border border-border transition-all active:scale-95 cursor-pointer"
                    >
                      <Icon className="h-3.5 w-3.5 text-orange-500" />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-3 pb-6 sm:pb-3 bg-card border-t border-border/60 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Microphone Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    isListening
                      ? "bg-rose-500 text-white border-rose-600 ring-4 ring-rose-500/30 animate-pulse"
                      : "bg-muted hover:bg-orange-500/15 text-foreground hover:text-orange-600 border-border"
                  }`}
                  title={isListening ? "Listening... speak now!" : "Click to speak your question"}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-orange-500" />}
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={isListening ? "Listening... Speak now..." : "Type or speak your question..."}
                  className="flex-1 bg-muted/60 border border-border/80 rounded-2xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-foreground"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className="p-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white transition-all shrink-0 shadow-md shadow-orange-500/20 cursor-pointer"
                  aria-label="Send Message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Global utility helper to trigger NIRMAN Saathi from external buttons/links
export function openNirmanAssistant() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nirman_open_assistant"));
  }
}
