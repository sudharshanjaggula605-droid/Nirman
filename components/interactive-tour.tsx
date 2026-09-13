"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Building2, 
  FileText, 
  IndianRupee, 
  ShieldCheck, 
  Bot,
  ExternalLink,
  CheckCircle2
} from "lucide-react";

export interface TourStep {
  title: string;
  hindiTitle: string;
  description: string;
  hindiDescription: string;
  icon: any;
  iconBg: string;
  actionUrl?: string;
  actionText?: string;
  highlightNote?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to NIRMAN v2.1.0",
    hindiTitle: "निर्माँ में आपका स्वागत है",
    description: "NIRMAN is India's transparent construction tender platform. Property Owners post building projects, and licensed Contractors place direct bids with zero middlemen.",
    hindiDescription: "निर्माँ पर प्रॉपर्टी मालिक अपने कंस्ट्रक्शन प्रोजेक्ट पोस्ट करते हैं और लाइसेंस प्राप्त ठेकेदार सीधे बोली लगाते हैं। कोई बिचौलिया नहीं!",
    icon: Building2,
    iconBg: "from-orange-500 to-amber-600",
    actionUrl: "/tenders",
    actionText: "Browse Live Tenders",
    highlightNote: "Simple, transparent, and built for everyone in construction."
  },
  {
    title: "Explore Live Tenders",
    hindiTitle: "लाइव टेंडर्स देखें",
    description: "Browse commercial and residential construction projects across India. Filter by category, location, and budget range to find matching jobs.",
    hindiDescription: "पूरे भारत के प्रोजेक्ट देखें। अपने शहर और बजट के अनुसार काम खोजें और तुरंत विवरण प्राप्त करें।",
    icon: FileText,
    iconBg: "from-blue-500 to-indigo-600",
    actionUrl: "/tenders",
    actionText: "View Tender Marketplace",
    highlightNote: "Verified by admin before publishing."
  },
  {
    title: "Simple Bidding & Itemized BOQ",
    hindiTitle: "आसान बोली (Bidding) प्रणाली",
    description: "Contractors submit quotes with transparent item-by-item cost breakdowns (BOQ). Property owners compare all bids side-by-side to choose the best contractor.",
    hindiDescription: "ठेकेदार बिना किसी झंझट के आसान फॉर्म भरकर अपनी दरें दे सकते हैं। मालिक सभी बोलियों की तुलना करके सही ठेकेदार चुनते हैं।",
    icon: IndianRupee,
    iconBg: "from-emerald-500 to-teal-600",
    actionUrl: "/register",
    actionText: "Register as Contractor",
    highlightNote: "No hidden charges or unfair bidding."
  },
  {
    title: "Safe Milestone Escrow Payments",
    hindiTitle: "सुरक्षित माइलस्टोन भुगतान",
    description: "Money is kept completely safe in escrow. Funds are only released to the contractor in stages after the property owner inspects and approves the completed work.",
    hindiDescription: "आपका पैसा पूरी तरह सुरक्षित रहता है। जब तक काम पूरा नहीं होता और मालिक संतुष्ट नहीं होता, तब तक भुगतान नहीं कटता।",
    icon: ShieldCheck,
    iconBg: "from-purple-500 to-pink-600",
    actionUrl: "/contact",
    actionText: "Learn About Payment Safety",
    highlightNote: "100% Guaranteed milestone protection."
  },
  {
    title: "Meet NIRMAN Saathi (Voice Assistant)",
    hindiTitle: "निर्माँ साथी — आपकी आवाज़ में मदद",
    description: "Have a question? Don't worry about typing! Click the orange assistant button at the bottom-right. You can speak into your mic or tap quick questions anytime.",
    hindiDescription: "लिखने की ज़रूरत नहीं! नीचे दाईं ओर माइक बटन दबाएं और बोलकर अपना सवाल पूछें। निर्माँ साथी आपकी पूरी मदद करेगा।",
    icon: Bot,
    iconBg: "from-orange-600 to-rose-600",
    actionUrl: "#",
    actionText: "Open Nirman Saathi Now",
    highlightNote: "Speaks aloud and guides you step-by-step."
  }
];

export function InteractiveTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Listen for global custom event to trigger tour
  useEffect(() => {
    const handleTrigger = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener("nirman_start_tour", handleTrigger);
    return () => {
      window.removeEventListener("nirman_start_tour", handleTrigger);
    };
  }, []);

  // Stop speech when closing
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const handleClose = () => {
    stopSpeaking();
    setIsOpen(false);
    try {
      localStorage.setItem("nirman_tour_seen", "true");
    } catch {}
  };

  const speakCurrentStep = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    const step = TOUR_STEPS[currentStep];
    const textToSpeak = `${step.title}. ${step.description}. ${step.hindiDescription}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try to pick an English/Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("hi-IN") || v.lang.includes("en-US"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    stopSpeaking();
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    stopSpeaking();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-card-foreground"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              NIRMAN Guided Tour
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Listen Aloud Button */}
            <button
              onClick={speakCurrentStep}
              className={`p-2 rounded-full border transition-all text-xs flex items-center gap-1.5 ${
                isSpeaking 
                  ? "bg-orange-500 text-white border-orange-600 ring-2 ring-orange-500/30 animate-pulse" 
                  : "bg-muted hover:bg-accent text-foreground border-border"
              }`}
              title="Listen aloud (बोलकर सुनें)"
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-orange-500" />}
              <span className="hidden sm:inline font-semibold">{isSpeaking ? "Stop" : "Listen / सुनें"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close Tour"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-muted/60 h-1.5 my-4 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${step.iconBg} text-white shadow-lg shrink-0`}>
              <IconComponent className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {step.title}
              </h2>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                {step.hindiTitle}
              </p>
            </div>
          </div>

          {/* Simple English Explanation */}
          <div className="rounded-2xl bg-muted/40 p-4 border border-border/50 space-y-2">
            <p className="text-sm sm:text-base leading-relaxed text-foreground font-medium">
              {step.description}
            </p>
            {/* Hindi / Regional Helper text for easier comprehension */}
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground border-t border-border/40 pt-2 font-normal">
              💡 <span className="font-semibold text-foreground/90">सरल भाषा में:</span> {step.hindiDescription}
            </p>
          </div>

          {/* Highlight note */}
          {step.highlightNote && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{step.highlightNote}</span>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-4 border-t border-border/60">
          {/* Quick jump link if available */}
          {step.actionUrl && step.actionUrl !== "#" ? (
            <Link
              href={step.actionUrl}
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
            >
              <span>{step.actionText}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">NIRMAN Platform Tour</span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next Step"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Global helper to trigger tour from anywhere
export function startAppTour() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nirman_start_tour"));
  }
}
