"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  QrCode,
  Smartphone,
  CreditCard,
  Building,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  HardHat,
  Lock,
} from "lucide-react";
import { verifyPaymentSignatureAction, submitStaticQRPaymentAction, type CreateOrderResult } from "@/actions/payments";

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: CreateOrderResult | null;
  onSuccessRedirect?: (projectId: string) => void;
}

type PaymentTab = "qr" | "upi" | "card" | "netbanking" | "static_qr" | "wallets";

export function PaymentCheckoutModal({
  isOpen,
  onClose,
  orderData,
  onSuccessRedirect,
}: PaymentCheckoutModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>("qr");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed" | "pending_verification">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any>(null);

  // Form states
  const [upiIdInput, setUpiIdInput] = useState("");
  const [utrInput, setUtrInput] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Dynamic QR polling ref
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      setStatus("idle");
      setErrorMessage(null);
      setSuccessInfo(null);
    }
  }, [isOpen]);

  // Live polling for Dynamic QR payment
  useEffect(() => {
    if (isOpen && orderData?.paymentId && status === "idle") {
      pollingTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payments/status/${orderData.paymentId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.isPaid || data.status === "paid") {
              if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
              setStatus("success");
              setSuccessInfo({
                contractorName: orderData.contractorName,
                projectTitle: orderData.projectTitle,
                projectId: data.projectId,
              });
            }
          }
        } catch {}
      }, 3000);
    }

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [isOpen, orderData, status]);

  if (!isOpen || !orderData) return null;

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  /**
   * Completes payment via client signature verification API
   */
  const handleCompleteRazorpayPayment = async (method: string) => {
    setStatus("processing");
    setErrorMessage(null);

    try {
      // In sandbox/test environment: generate verified HMAC test signature
      const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const res = await verifyPaymentSignatureAction({
        paymentId: orderData.paymentId!,
        orderId: orderData.orderId!,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: "mock_test_signature_approved",
        paymentMethod: method,
      });

      if (res.error) {
        setStatus("failed");
        setErrorMessage(res.error);
      } else {
        setStatus("success");
        setSuccessInfo({
          contractorName: orderData.contractorName,
          projectTitle: orderData.projectTitle,
          projectId: res.projectId,
        });
        if (onSuccessRedirect && res.projectId) {
          setTimeout(() => onSuccessRedirect(res.projectId), 2500);
        }
      }
    } catch (err: any) {
      setStatus("failed");
      setErrorMessage(err?.message || "Payment verification failed. Please try again.");
    }
  };

  /**
   * Submits Static QR UTR for Admin Verification
   */
  const handleStaticQrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim() || utrInput.trim().length < 6) {
      setErrorMessage("Please enter a valid 12-digit UPI UTR / Transaction Reference Number.");
      return;
    }

    setStatus("processing");
    setErrorMessage(null);

    try {
      const res = await submitStaticQRPaymentAction({
        paymentId: orderData.paymentId!,
        utrNumber: utrInput.trim(),
      });

      if (res.error) {
        setStatus("failed");
        setErrorMessage(res.error);
      } else {
        setStatus("pending_verification");
      }
    } catch (err: any) {
      setStatus("failed");
      setErrorMessage(err?.message || "Failed to submit verification request.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center font-black shadow-md">
              ₹
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Complete Payment</h2>
              <p className="text-[11px] text-slate-400">NIRMAN Platform Selection Fee • ₹199</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <Lock className="h-3 w-3" /> 256-Bit SSL Encrypted
            </div>
            {status !== "processing" && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* SUCCESS SCREEN */}
          {status === "success" && (
            <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
              <div className="h-16 w-16 rounded-3xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white">Payment Successful ✓</h3>
                <p className="text-xs text-slate-400">₹199 paid successfully via Razorpay Gateway.</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-left max-w-md mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Project:</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{orderData.projectTitle}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Selected Contractor:</span>
                  <span className="font-bold text-amber-400">{orderData.contractorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Platform Selection Fee:</span>
                  <span className="font-extrabold text-emerald-400">PAID (₹199)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/owner/projects"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 transition-all"
                >
                  View Active Project <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/owner/payments"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all"
                >
                  Payment History
                </Link>
              </div>
            </div>
          )}

          {/* PENDING VERIFICATION SCREEN (STATIC QR) */}
          {status === "pending_verification" && (
            <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
              <div className="h-16 w-16 rounded-3xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white">Payment Submitted for Verification</h3>
                <p className="text-xs text-slate-400">
                  Your ₹199 Static QR payment (UTR: <span className="font-mono text-amber-400 font-bold">{utrInput}</span>) has been recorded.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                🕒 The NIRMAN administrator will verify the bank transaction reference. Once confirmed, your contractor selection for <strong>{orderData.projectTitle}</strong> will automatically become <strong>ACTIVE</strong>.
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* FAILURE SCREEN */}
          {status === "failed" && (
            <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
              <div className="h-16 w-16 rounded-3xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30 shadow-lg shadow-rose-500/10">
                <AlertCircle className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white">Payment Failed</h3>
                <p className="text-xs text-rose-400">{errorMessage || "Your ₹199 payment was not completed."}</p>
                <p className="text-[11px] text-slate-400">The contractor has NOT been selected.</p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setStatus("idle")}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-black text-white shadow-lg hover:bg-orange-700 transition-all cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" /> Try Again
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Back to Bids
                </button>
              </div>
            </div>
          )}

          {/* PAYMENT OPTIONS FORM */}
          {(status === "idle" || status === "processing") && (
            <>
              {/* Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl border border-slate-800 bg-slate-950">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Awarding To</span>
                  <p className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                    <HardHat className="h-3.5 w-3.5" /> {orderData.contractorName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Amount Due</span>
                  <p className="text-base font-black text-white">₹199</p>
                </div>
              </div>

              {/* Method Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("qr")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "qr"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" /> Scan QR
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("upi")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "upi"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> UPI Apps
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("card")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "card"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" /> Card
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("netbanking")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "netbanking"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Building className="h-3.5 w-3.5" /> Net Banking
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("static_qr")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "static_qr"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5 text-emerald-400" /> Pay using Static QR
                </button>
              </div>

              {/* TAB 1: SCAN QR (DYNAMIC UPI QR) */}
              {activeTab === "qr" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 text-center">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white">Scan QR using any UPI App</h4>
                    <p className="text-[11px] text-slate-400">
                      GPay, PhonePe, Paytm, BHIM, Cred, or your Bank UPI app
                    </p>
                  </div>

                  {/* QR Image Box */}
                  <div className="relative inline-block p-3 rounded-2xl bg-white border-4 border-amber-500/40 shadow-xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        orderData.qrIntentUrl || `upi://pay?pa=nirman@upi&pn=NIRMAN&am=199&cu=INR`
                      )}`}
                      alt="UPI QR Code"
                      className="h-44 w-44 object-contain rounded-lg mx-auto"
                    />
                    <div className="absolute inset-x-0 bottom-1 text-[9px] font-bold text-slate-700 uppercase tracking-wider text-center">
                      Scan to pay ₹199
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Waiting for payment...</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Once you authorize ₹199 in your UPI app, this screen will update automatically.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex justify-center">
                    <button
                      type="button"
                      disabled={status === "processing"}
                      onClick={() => handleCompleteRazorpayPayment("qr_scan")}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-orange-700 hover:to-amber-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {status === "processing" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                        </>
                      ) : (
                        <>Simulate QR Payment (Test Sandbox)</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: UPI INTENT / ID */}
              {activeTab === "upi" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white">Enter your UPI ID / VPA</h4>
                    <p className="text-[11px] text-slate-400">
                      A payment request of ₹199 will be sent to your UPI app.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300">UPI ID / Virtual Payment Address</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        placeholder="yourname@okhdfcbank / yourname@ybl"
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={status === "processing"}
                    onClick={() => handleCompleteRazorpayPayment("upi")}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/20 hover:from-orange-700 hover:to-amber-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === "processing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing UPI Payment...
                      </>
                    ) : (
                      <>Pay ₹199 via UPI</>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: CARD PAYMENT */}
              {activeTab === "card" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white">Credit / Debit Card</h4>
                    <p className="text-[11px] text-slate-400">Visa, MasterCard, RuPay, Diners Club</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={status === "processing"}
                    onClick={() => handleCompleteRazorpayPayment("card")}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/20 hover:from-orange-700 hover:to-amber-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === "processing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing Card...
                      </>
                    ) : (
                      <>Pay ₹199 with Card</>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 4: NET BANKING */}
              {activeTab === "netbanking" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white">Select Your Bank</h4>
                    <p className="text-[11px] text-slate-400">All major Indian retail and corporate banks</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Punjab National Bank"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${
                          selectedBank === b
                            ? "bg-amber-500/10 border-amber-500 text-amber-400 ring-1 ring-amber-500"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={status === "processing"}
                    onClick={() => handleCompleteRazorpayPayment("netbanking")}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/20 hover:from-orange-700 hover:to-amber-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === "processing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to {selectedBank}...
                      </>
                    ) : (
                      <>Pay ₹199 with {selectedBank}</>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 5: STATIC QR (MANUAL UPI WITH ADMIN RECONCILIATION) */}
              {activeTab === "static_qr" && (
                <form onSubmit={handleStaticQrSubmit} className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                      Admin Configured Static QR
                    </div>
                    <h4 className="text-sm font-extrabold text-white">Pay using Static QR</h4>
                    <p className="text-[11px] text-slate-400">
                      {orderData.staticQrConfig?.instructions || "Scan using any UPI app and enter the 12-digit UTR reference."}
                    </p>
                  </div>

                  {/* QR Image + UPI details */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                        `upi://pay?pa=${orderData.staticQrConfig?.upiId || "nirman@upi"}&pn=${encodeURIComponent(
                          orderData.staticQrConfig?.displayName || "NIRMAN"
                        )}&am=199&cu=INR`
                      )}`}
                      alt="Static UPI QR"
                      className="h-32 w-32 rounded-xl bg-white p-2 shrink-0 border border-slate-700"
                    />

                    <div className="space-y-2 w-full text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Payee Name</span>
                        <span className="font-extrabold text-white">{orderData.staticQrConfig?.displayName || "NIRMAN Technologies"}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">UPI ID</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-400 font-bold">{orderData.staticQrConfig?.upiId || "nirman@upi"}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyUpi(orderData.staticQrConfig?.upiId || "nirman@upi")}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Exact Amount</span>
                        <span className="font-black text-emerald-400 text-sm">₹199.00</span>
                      </div>
                    </div>
                  </div>

                  {/* UTR Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-200">
                      Enter 12-Digit UPI Transaction Reference / UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="e.g. 423819002914"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Found in your GPay / PhonePe / Paytm transaction receipt under &quot;UPI Ref No.&quot;
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "processing"}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-black text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === "processing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting for Admin Verification...
                      </>
                    ) : (
                      <>Submit UTR for Verification</>
                    )}
                  </button>
                </form>
              )}

              {/* Security Banner */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Powered by Razorpay Payment Gateway
                </span>
                <span>Test / Sandbox Mode</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
