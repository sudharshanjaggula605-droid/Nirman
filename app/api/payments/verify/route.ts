import { NextResponse } from "next/server";
import { verifyPaymentSignatureAction } from "@/actions/payments";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      paymentId,
      orderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod = "razorpay",
    } = body;

    if (!paymentId || !orderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing required verification parameters." },
        { status: 400 }
      );
    }

    const result = await verifyPaymentSignatureAction({
      paymentId,
      orderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/payments/verify error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error verifying payment." },
      { status: 500 }
    );
  }
}
