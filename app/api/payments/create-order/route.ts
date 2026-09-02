import { NextResponse } from "next/server";
import { createContractorSelectionOrderAction } from "@/actions/payments";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenderId, bidId } = body;

    if (!tenderId || !bidId) {
      return NextResponse.json(
        { error: "Missing required parameters: tenderId and bidId are required." },
        { status: 400 }
      );
    }

    const result = await createContractorSelectionOrderAction(tenderId, bidId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/payments/create-order error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error creating payment order." },
      { status: 500 }
    );
  }
}
