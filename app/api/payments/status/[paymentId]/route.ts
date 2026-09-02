import { NextResponse } from "next/server";
import { getPaymentStatusAction } from "@/actions/payments";

export async function GET(
  req: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const paymentId = params.paymentId;
    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId parameter" }, { status: 400 });
    }

    const result = await getPaymentStatusAction(paymentId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to retrieve status" }, { status: 500 });
  }
}
