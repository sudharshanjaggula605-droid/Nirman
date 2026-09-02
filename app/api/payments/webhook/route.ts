import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature header" }, { status: 400 });
    }

    const isValid = verifyRazorpayWebhookSignature({
      body: rawBody,
      signature,
    });

    if (!isValid) {
      console.warn("Invalid Razorpay webhook signature received");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || event.payload?.order?.entity?.notes || {};

      const adminClient = createAdminClient();

      // Find matching payment record by gateway order id
      let query = adminClient.from("payments").select("*");
      if (notes.project_id) {
        query = query.eq("project_id", notes.project_id);
      }

      const { data: payments } = await query;
      const matchedPayment = (payments || []).find((p) => {
        let txnRef: any = {};
        try {
          txnRef =
            typeof p.transaction_reference === "string"
              ? JSON.parse(p.transaction_reference)
              : p.transaction_reference || {};
        } catch {}
        return txnRef.gateway_order_id === orderId;
      });

      if (matchedPayment && matchedPayment.status !== "paid") {
        let txnRef: any = {};
        try {
          txnRef =
            typeof matchedPayment.transaction_reference === "string"
              ? JSON.parse(matchedPayment.transaction_reference)
              : matchedPayment.transaction_reference || {};
        } catch {}

        txnRef.gateway_payment_id = paymentId;
        txnRef.webhook_verified_at = new Date().toISOString();

        // Mark PAID
        await adminClient
          .from("payments")
          .update({
            status: "paid",
            payment_date: new Date().toISOString(),
            transaction_reference: JSON.stringify(txnRef),
            updated_at: new Date().toISOString(),
          })
          .eq("id", matchedPayment.id);

        const tenderId = txnRef.tender_id || notes.tender_id;
        const bidId = txnRef.bid_id || notes.bid_id;
        const contractorId = matchedPayment.contractor_id || notes.contractor_id;
        const projectId = matchedPayment.project_id || notes.project_id;

        if (bidId && tenderId) {
          // Accept bid & reject others
          await Promise.all([
            adminClient
              .from("bids")
              .update({ status: "accepted", updated_at: new Date().toISOString() })
              .eq("id", bidId),
            adminClient
              .from("bids")
              .update({ status: "rejected", updated_at: new Date().toISOString() })
              .eq("tender_id", tenderId)
              .neq("id", bidId),
            adminClient
              .from("tenders")
              .update({ status: "awarded", updated_at: new Date().toISOString() })
              .eq("id", tenderId),
            adminClient
              .from("projects")
              .update({
                status: "active",
                contractor_id: contractorId,
                updated_at: new Date().toISOString(),
              })
              .eq("id", projectId),
          ]);
        }
      }
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook handling internal error" },
      { status: 500 }
    );
  }
}
