"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PLATFORM_SELECTION_FEE_INR,
  PLATFORM_SELECTION_FEE_PAISE,
  getRazorpayClient,
  verifyRazorpayPaymentSignature,
  generateUpiIntentString,
} from "@/lib/razorpay";
import { revalidatePath } from "next/cache";

export interface CreateOrderResult {
  success?: boolean;
  error?: string;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  qrIntentUrl?: string;
  contractorName?: string;
  projectTitle?: string;
  staticQrConfig?: {
    enabled: boolean;
    upiId: string;
    displayName: string;
    imageUrl: string;
    instructions: string;
  };
}

export interface VerifyPaymentResult {
  success?: boolean;
  error?: string;
  message?: string;
  contractorName?: string;
  projectId?: string;
  tenderId?: string;
}

/**
 * 1. Initiates Contractor Selection & Creates ₹199 Payment Order
 */
export async function createContractorSelectionOrderAction(
  tenderId: string,
  bidId: string
): Promise<CreateOrderResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required. Please log in as Property Owner." };
  }

  const adminClient = createAdminClient();

  // 1. Verify Tender and Owner Permissions
  const { data: tender, error: tenderErr } = await adminClient
    .from("tenders")
    .select("*, project:projects(*)")
    .eq("id", tenderId)
    .single();

  if (tenderErr || !tender) {
    return { error: "Tender not found." };
  }

  if (tender.owner_id !== user.id) {
    return { error: "Unauthorized: You do not own this tender." };
  }

  if (tender.status === "awarded" || tender.status === "completed") {
    return { error: "A contractor has already been selected and awarded for this tender." };
  }

  // 2. Verify Bid
  const { data: bid, error: bidErr } = await adminClient
    .from("bids")
    .select("*, contractor:contractors(*)")
    .eq("id", bidId)
    .eq("tender_id", tenderId)
    .single();

  if (bidErr || !bid) {
    return { error: "Selected contractor quotation was not found." };
  }

  const projectId = tender.project_id || tender.project?.id;
  const contractorId = bid.contractor_id;
  const contractorName =
    bid.contractor?.company_name || bid.contractor?.contact_person || "Licensed Contractor";
  const projectTitle = tender.title || tender.project?.title || "Construction Project";

  // 3. Check for existing PAID selection fee for this project
  const { data: existingPaid } = await adminClient
    .from("payments")
    .select("id, status")
    .eq("project_id", projectId)
    .eq("payment_type", "CONTRACTOR_SELECTION_FEE")
    .eq("status", "paid")
    .maybeSingle();

  if (existingPaid) {
    return { error: "Platform selection fee has already been paid for this project." };
  }

  // 4. Create Order with Razorpay SDK or Fallback Sandbox
  const razorpay = getRazorpayClient();
  let razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: PLATFORM_SELECTION_FEE_PAISE,
        currency: "INR",
        receipt: `rcpt_sel_${tenderId.slice(0, 8)}_${Date.now()}`,
        notes: {
          tender_id: tenderId,
          project_id: projectId,
          bid_id: bidId,
          owner_id: user.id,
          contractor_id: contractorId,
          payment_type: "CONTRACTOR_SELECTION_FEE",
        },
      });
      if (order && order.id) {
        razorpayOrderId = order.id;
      }
    } catch (err: any) {
      console.warn("Razorpay API order creation warning (fallback active):", err?.message || err);
      // Generate standard test order id for sandbox demo
      razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
  }

  // 5. Store Payment Record in Database
  const paymentPayload = {
    project_id: projectId,
    owner_id: user.id,
    contractor_id: contractorId,
    amount: PLATFORM_SELECTION_FEE_INR,
    payment_type: "CONTRACTOR_SELECTION_FEE",
    description: `Platform Selection Fee (₹${PLATFORM_SELECTION_FEE_INR}) for contractor: ${contractorName} on ${projectTitle}`,
    status: "pending",
    payment_date: new Date().toISOString(),
    transaction_reference: JSON.stringify({
      gateway_order_id: razorpayOrderId,
      tender_id: tenderId,
      bid_id: bidId,
      currency: "INR",
      payment_gateway: "razorpay",
      selection_fee: PLATFORM_SELECTION_FEE_INR,
    }),
  };

  const { data: newPayment, error: paymentInsertErr } = await adminClient
    .from("payments")
    .insert(paymentPayload)
    .select()
    .single();

  if (paymentInsertErr) {
    console.error("Error creating payment record in Supabase:", paymentInsertErr);
    return { error: "Failed to initialize payment record: " + paymentInsertErr.message };
  }

  // 6. Fetch Admin Payment Settings for Static QR config
  let staticQrConfig = {
    enabled: true,
    upiId: "nirman@upi",
    displayName: "NIRMAN Platform",
    imageUrl: "/images/static_upi_qr.png",
    instructions: "Scan using GPay, PhonePe, Paytm, or any BHIM UPI app to pay ₹199.",
  };

  try {
    const { data: settingsRow } = await adminClient
      .from("admin_settings")
      .select("system_settings")
      .eq("id", "default")
      .maybeSingle();

    if (settingsRow?.system_settings?.payment_settings) {
      const ps = settingsRow.system_settings.payment_settings;
      staticQrConfig = {
        enabled: ps.static_qr_enabled !== false,
        upiId: ps.upi_id || "nirman@upi",
        displayName: ps.display_name || "NIRMAN Platform",
        imageUrl: ps.static_qr_image || "/images/static_upi_qr.png",
        instructions: ps.payment_instructions || staticQrConfig.instructions,
      };
    }
  } catch {}

  const keyId =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_nirman2026";

  const qrIntentUrl = generateUpiIntentString({
    upiId: staticQrConfig.upiId,
    payeeName: staticQrConfig.displayName,
    amount: PLATFORM_SELECTION_FEE_INR,
    transactionNote: `Selection Fee - ${projectTitle.slice(0, 20)}`,
    orderId: razorpayOrderId,
  });

  return {
    success: true,
    paymentId: newPayment.id,
    orderId: razorpayOrderId,
    amount: PLATFORM_SELECTION_FEE_INR,
    currency: "INR",
    keyId,
    qrIntentUrl,
    contractorName,
    projectTitle,
    staticQrConfig,
  };
}

/**
 * 2. Confirms Contractor Selection upon Verified Payment
 */
async function executeContractorSelection({
  paymentId,
  projectId,
  tenderId,
  bidId,
  ownerId,
  contractorId,
  paymentMethod,
}: {
  paymentId: string;
  projectId: string;
  tenderId: string;
  bidId: string;
  ownerId: string;
  contractorId: string;
  paymentMethod: string;
}) {
  const adminClient = createAdminClient();

  // 1. Mark Payment as PAID
  await adminClient
    .from("payments")
    .update({
      status: "paid",
      payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  // 2. Fetch Contractor Name for Project
  const { data: contractor } = await adminClient
    .from("contractors")
    .select("company_name, contact_person")
    .eq("id", contractorId)
    .maybeSingle();

  const contractorName =
    contractor?.company_name || contractor?.contact_person || "Awarded Contractor";

  // 3. Accept selected bid & reject other bids for this tender
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
  ]);

  // 4. Update Tender status to 'awarded'
  await adminClient
    .from("tenders")
    .update({
      status: "awarded",
      updated_at: new Date().toISOString(),
    })
    .eq("id", tenderId);

  // 5. Update Project status to 'active' and assign contractor
  await adminClient
    .from("projects")
    .update({
      status: "active",
      contractor_id: contractorId,
      contractor_name: contractorName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  // 6. Increment Contractor Total Projects
  try {
    const { data: cRecord } = await adminClient
      .from("contractors")
      .select("total_projects")
      .eq("id", contractorId)
      .single();
    if (cRecord) {
      await adminClient
        .from("contractors")
        .update({
          total_projects: (cRecord.total_projects || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractorId);
    }
  } catch {}

  // 7. Dispatch In-App Notifications
  const now = new Date().toISOString();
  try {
    await adminClient.from("notifications").insert([
      {
        user_id: ownerId,
        title: "Contractor Selection Confirmed! ✓",
        message: `₹199 Platform Selection Fee paid successfully. ${contractorName} has been officially appointed for your project.`,
        type: "payment_success",
        reference_id: projectId,
        created_at: now,
      },
      {
        user_id: contractorId,
        title: "Congratulations! Project Awarded 🏗️",
        message: `You have been selected as the contractor for the project! Project execution status is now ACTIVE.`,
        type: "bid_accepted",
        reference_id: projectId,
        created_at: now,
      },
    ]);
  } catch (err) {
    console.warn("Notification dispatch notice:", err);
  }

  // Revalidate Dashboard Paths
  revalidatePath("/owner/tenders");
  revalidatePath("/owner/projects");
  revalidatePath("/owner/payments");
  revalidatePath("/owner/dashboard");
  revalidatePath("/contractor/projects");
  revalidatePath("/contractor/dashboard");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/dashboard");

  return { success: true, contractorName, projectId, tenderId };
}

/**
 * 3. Verify Razorpay Payment Signature
 */
export async function verifyPaymentSignatureAction({
  paymentId,
  orderId,
  razorpayPaymentId,
  razorpaySignature,
  paymentMethod = "razorpay",
}: {
  paymentId: string;
  orderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod?: string;
}): Promise<VerifyPaymentResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  const adminClient = createAdminClient();

  // Retrieve payment record
  const { data: payment, error: pErr } = await adminClient
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (pErr || !payment) {
    return { error: "Payment record not found." };
  }

  // Idempotency: If already paid, return success immediately
  if (payment.status === "paid") {
    return { success: true, message: "Payment already verified and completed." };
  }

  // Parse transaction reference
  let txnRef: any = {};
  try {
    txnRef =
      typeof payment.transaction_reference === "string"
        ? JSON.parse(payment.transaction_reference)
        : payment.transaction_reference || {};
  } catch {}

  const expectedOrderId = txnRef.gateway_order_id || orderId;

  // Verify Signature
  const isValid = verifyRazorpayPaymentSignature({
    orderId: expectedOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValid) {
    // Log failure
    await adminClient
      .from("payments")
      .update({
        status: "failed",
        failure_reason: "Invalid cryptographic payment signature",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    return { error: "Payment verification failed: Signature mismatch. Please try again." };
  }

  // Update payment reference details
  txnRef.gateway_payment_id = razorpayPaymentId;
  txnRef.gateway_signature = razorpaySignature;
  txnRef.payment_method = paymentMethod;

  await adminClient
    .from("payments")
    .update({
      transaction_reference: JSON.stringify(txnRef),
      payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  // Execute contractor selection
  const result = await executeContractorSelection({
    paymentId,
    projectId: payment.project_id,
    tenderId: txnRef.tender_id,
    bidId: txnRef.bid_id,
    ownerId: payment.owner_id,
    contractorId: payment.contractor_id,
    paymentMethod,
  });

  return result;
}

/**
 * 4. Submit Manual Static QR Payment for Admin Verification
 */
export async function submitStaticQRPaymentAction({
  paymentId,
  utrNumber,
  payerUpiId,
}: {
  paymentId: string;
  utrNumber: string;
  payerUpiId?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };
  if (!utrNumber || utrNumber.trim().length < 6) {
    return { error: "Please enter a valid 12-digit UPI UTR / Transaction Reference Number." };
  }

  const adminClient = createAdminClient();
  const { data: payment, error: pErr } = await adminClient
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (pErr || !payment) return { error: "Payment record not found." };

  let txnRef: any = {};
  try {
    txnRef =
      typeof payment.transaction_reference === "string"
        ? JSON.parse(payment.transaction_reference)
        : payment.transaction_reference || {};
  } catch {}

  txnRef.utr_number = utrNumber.trim();
  txnRef.payer_upi_id = payerUpiId || "";
  txnRef.payment_method = "static_qr";
  txnRef.submitted_at = new Date().toISOString();

  const { error: updateErr } = await adminClient
    .from("payments")
    .update({
      status: "pending", // PENDING_VERIFICATION mapped to pending with static_qr flag
      description: `Static QR Payment (₹${PLATFORM_SELECTION_FEE_INR}) [UTR: ${utrNumber.trim()}] - Pending Admin Verification`,
      transaction_reference: JSON.stringify(txnRef),
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (updateErr) {
    return { error: "Failed to submit verification request: " + updateErr.message };
  }

  // Notify Admin
  try {
    const { data: admins } = await adminClient
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      await adminClient.from("notifications").insert(
        admins.map((adm) => ({
          user_id: adm.id,
          title: "New Static QR Payment Verification Pending",
          message: `Owner submitted UTR: ${utrNumber.trim()} for ₹199 contractor selection fee. Please review in Admin Payments.`,
          type: "payment_verification",
          reference_id: paymentId,
          created_at: new Date().toISOString(),
        }))
      );
    }
  } catch {}

  revalidatePath("/owner/payments");
  revalidatePath("/admin/payments");

  return {
    success: true,
    status: "PENDING_VERIFICATION",
    message:
      "Your ₹199 Static QR payment details (UTR: " +
      utrNumber.trim() +
      ") have been submitted for Admin verification. Once verified, the contractor appointment will be confirmed.",
  };
}

/**
 * 5. Admin Payment Reconciliation (Approve or Reject Static QR / Pending Payments)
 */
export async function adminReconcilePaymentAction({
  paymentId,
  decision,
  reason,
}: {
  paymentId: string;
  decision: "approve" | "reject";
  reason?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const adminClient = createAdminClient();

  // Verify Admin Role
  const { data: myProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "admin") {
    return { error: "Unauthorized: Admin privileges required." };
  }

  const { data: payment, error: pErr } = await adminClient
    .from("payments")
    .select("*, project:projects(title)")
    .eq("id", paymentId)
    .single();

  if (pErr || !payment) return { error: "Payment record not found." };

  let txnRef: any = {};
  try {
    txnRef =
      typeof payment.transaction_reference === "string"
        ? JSON.parse(payment.transaction_reference)
        : payment.transaction_reference || {};
  } catch {}

  if (decision === "approve") {
    txnRef.reconciled_by = user.id;
    txnRef.reconciled_at = new Date().toISOString();
    txnRef.reconcile_decision = "approved";

    await adminClient
      .from("payments")
      .update({
        transaction_reference: JSON.stringify(txnRef),
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    // Confirm contractor selection
    const result = await executeContractorSelection({
      paymentId,
      projectId: payment.project_id,
      tenderId: txnRef.tender_id,
      bidId: txnRef.bid_id,
      ownerId: payment.owner_id,
      contractorId: payment.contractor_id,
      paymentMethod: txnRef.payment_method || "static_qr",
    });

    return { success: true, message: "Payment reconciled and verified as PAID. Contractor appointed." };
  } else {
    // Reject
    txnRef.reconciled_by = user.id;
    txnRef.reconciled_at = new Date().toISOString();
    txnRef.reconcile_decision = "rejected";
    txnRef.reject_reason = reason || "Payment could not be verified in bank records.";

    await adminClient
      .from("payments")
      .update({
        status: "failed",
        failure_reason: reason || "Payment rejected during admin verification.",
        transaction_reference: JSON.stringify(txnRef),
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    // Notify Owner
    try {
      await adminClient.from("notifications").insert({
        user_id: payment.owner_id,
        title: "Payment Verification Issue",
        message: `Your ₹199 Static QR payment verification could not be approved: ${reason || "UTR could not be matched"}. Please retry payment.`,
        type: "payment_failed",
        reference_id: payment.project_id,
        created_at: new Date().toISOString(),
      });
    } catch {}

    revalidatePath("/admin/payments");
    revalidatePath("/owner/payments");

    return { success: true, message: "Payment marked as rejected." };
  }
}

/**
 * 6. Get Admin Payments Overview Statistics & Records
 */
export async function getAdminPaymentsOverviewAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  const adminClient = createAdminClient();

  // Fetch all payments with project, owner, and contractor details
  const { data: payments, error } = await adminClient
    .from("payments")
    .select(`
      *,
      project:projects(id, title, city, location),
      owner:owners(id, full_name, company_name),
      contractor:contractors(id, company_name, contact_person)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, payments: [], stats: null };
  }

  const list = (payments || []).map((p) => {
    let txnRef: any = {};
    try {
      txnRef =
        typeof p.transaction_reference === "string"
          ? JSON.parse(p.transaction_reference)
          : p.transaction_reference || {};
    } catch {}

    const isStaticQrPending =
      p.status === "pending" && (txnRef.payment_method === "static_qr" || !!txnRef.utr_number);

    let displayStatus = (p.status || "PENDING").toUpperCase();
    if (isStaticQrPending) {
      displayStatus = "PENDING_VERIFICATION";
    }

    return {
      ...p,
      displayStatus,
      txnRef,
      formattedAmount: p.amount || 199,
    };
  });

  const totalSelectionFees = list
    .filter((p) => p.payment_type === "CONTRACTOR_SELECTION_FEE" && p.status === "paid")
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const paidCount = list.filter((p) => p.status === "paid").length;
  const pendingVerificationCount = list.filter(
    (p) => p.displayStatus === "PENDING_VERIFICATION"
  ).length;
  const pendingCount = list.filter((p) => p.displayStatus === "PENDING").length;
  const failedCount = list.filter((p) => p.status === "failed" || p.status === "rejected").length;

  return {
    success: true,
    payments: list,
    stats: {
      totalSelectionFees,
      totalCount: list.length,
      paidCount,
      pendingVerificationCount,
      pendingCount,
      failedCount,
      refundedCount: 0,
      disputedCount: 0,
    },
  };
}

/**
 * 7. Get Single Payment Status (for polling Dynamic QR status)
 */
export async function getPaymentStatusAction(paymentId: string) {
  const adminClient = createAdminClient();
  const { data: payment, error } = await adminClient
    .from("payments")
    .select("id, status, paid_at, project_id, contractor_id")
    .eq("id", paymentId)
    .single();

  if (error || !payment) {
    return { error: "Payment not found" };
  }

  return {
    success: true,
    status: payment.status,
    isPaid: payment.status === "paid",
    paidAt: payment.paid_at,
    projectId: payment.project_id,
  };
}
