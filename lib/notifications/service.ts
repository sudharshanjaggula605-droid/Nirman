/**
 * NIRMAN Notification Service Abstraction
 * Handles WhatsApp & Email delivery for user account approvals, tender alerts, and milestone updates.
 * Sends notifications to the real registered contact details (Phone & Email).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { getFirstName } from "@/lib/utils";

export interface ApprovalNotificationParams {
  userId: string;
  phone?: string | null;
  email?: string | null;
  name?: string | null;
  role: "owner" | "contractor" | "admin" | string;
}

export interface NotificationResult {
  success: boolean;
  channels: {
    whatsapp: "sent" | "logged" | "failed";
    email: "sent" | "logged" | "failed";
    system: "sent" | "logged";
  };
  status: "sent" | "logged" | "failed";
  error?: string;
}

export async function sendApprovalNotification({
  userId,
  phone,
  email,
  name,
  role,
}: ApprovalNotificationParams): Promise<NotificationResult> {
  const firstName = getFirstName(name, "User");
  const formattedPhone = phone ? phone.trim() : null;
  const targetEmail = email ? email.trim().toLowerCase() : null;

  const roleLabel = role === "contractor" ? "Contractor Partner" : "Property Owner";
  const standardApprovalMsg = "Your NIRMAN registration has been approved by the Admin. You can now log in to your account and access your dashboard.";

  const messageBody = `Hello ${firstName},\n\n${standardApprovalMsg}\n\nAccount Role: ${roleLabel}\nLogin Link: https://nirman-hsxg.vercel.app/login\n\nThank you,\nNIRMAN Construction Management Platform`;

  const adminClient = createAdminClient();

  const channels: NotificationResult["channels"] = {
    whatsapp: "logged",
    email: "logged",
    system: "logged",
  };

  // 1. WhatsApp Delivery
  const whatsappApiKey = process.env.WHATSAPP_API_KEY;
  const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (whatsappApiKey && whatsappPhoneId && formattedPhone) {
    try {
      const cleanPhone = formattedPhone.replace(/\D/g, "");
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${whatsappApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`,
            type: "text",
            text: { body: messageBody },
          }),
        }
      );

      if (res.ok) {
        channels.whatsapp = "sent";
        await logNotification(adminClient, {
          userId,
          notificationType: "account_approval",
          channel: "whatsapp",
          phoneNumber: formattedPhone,
          email: targetEmail,
          status: "sent",
        });
      } else {
        const errJson = await res.json().catch(() => ({}));
        channels.whatsapp = "failed";
        await logNotification(adminClient, {
          userId,
          notificationType: "account_approval",
          channel: "whatsapp",
          phoneNumber: formattedPhone,
          email: targetEmail,
          status: "failed",
          errorMessage: JSON.stringify(errJson),
        });
      }
    } catch (err: any) {
      console.warn("[WHATSAPP DELIVERY EXCEPTION]", err.message);
      channels.whatsapp = "failed";
      await logNotification(adminClient, {
        userId,
        notificationType: "account_approval",
        channel: "whatsapp",
        phoneNumber: formattedPhone,
        email: targetEmail,
        status: "failed",
        errorMessage: err.message,
      });
    }
  } else if (formattedPhone) {
    // Record that WhatsApp was queued/logged for the registered phone number
    await logNotification(adminClient, {
      userId,
      notificationType: "account_approval",
      channel: "whatsapp",
      phoneNumber: formattedPhone,
      email: targetEmail,
      status: "logged",
      errorMessage: "WhatsApp gateway credentials pending configuration; message recorded.",
    });
    channels.whatsapp = "logged";
  }

  // 2. Email Delivery (Resend / SMTP)
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && targetEmail) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "NIRMAN Platform <notifications@nirman.com>",
          to: [targetEmail],
          subject: "🎉 Your NIRMAN Registration has been Approved!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #ea580c; margin: 0; font-size: 24px;">NIRMAN</h1>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Transparent Construction Management Platform</p>
              </div>
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Hello ${firstName},</h2>
                <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                  <strong>Your NIRMAN registration has been approved by the Admin. You can now log in to your account and access your dashboard.</strong>
                </p>
                <div style="margin: 20px 0; text-align: center;">
                  <a href="https://nirman-hsxg.vercel.app/login" style="background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                    Log In to Your Dashboard
                  </a>
                </div>
              </div>
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                If you have any questions, please contact support through the NIRMAN Contact page.
              </p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        channels.email = "sent";
        await logNotification(adminClient, {
          userId,
          notificationType: "account_approval",
          channel: "email",
          phoneNumber: formattedPhone,
          email: targetEmail,
          status: "sent",
        });
      } else {
        const errJson = await res.json().catch(() => ({}));
        channels.email = "failed";
        await logNotification(adminClient, {
          userId,
          notificationType: "account_approval",
          channel: "email",
          phoneNumber: formattedPhone,
          email: targetEmail,
          status: "failed",
          errorMessage: JSON.stringify(errJson),
        });
      }
    } catch (err: any) {
      console.warn("[EMAIL DELIVERY EXCEPTION]", err.message);
      channels.email = "failed";
      await logNotification(adminClient, {
        userId,
        notificationType: "account_approval",
        channel: "email",
        phoneNumber: formattedPhone,
        email: targetEmail,
        status: "failed",
        errorMessage: err.message,
      });
    }
  } else if (targetEmail) {
    // Record that email was logged for the registered email address
    await logNotification(adminClient, {
      userId,
      notificationType: "account_approval",
      channel: "email",
      phoneNumber: formattedPhone,
      email: targetEmail,
      status: "logged",
      errorMessage: "Email gateway credentials pending configuration; message recorded.",
    });
    channels.email = "logged";
  }

  // 3. In-App Notifications & Audit
  try {
    await adminClient.from("notifications").insert({
      user_id: userId,
      title: "🎉 Account Approved by Admin",
      message: standardApprovalMsg,
      type: "account_approved",
    });
    channels.system = "sent";
  } catch (sysErr) {
    console.warn("In-app notification note:", sysErr);
  }

  const overallStatus =
    channels.whatsapp === "sent" || channels.email === "sent"
      ? "sent"
      : "logged";

  return {
    success: true,
    channels,
    status: overallStatus,
  };
}

async function logNotification(
  adminClient: any,
  {
    userId,
    notificationType,
    channel,
    phoneNumber,
    email,
    status,
    errorMessage,
  }: {
    userId: string;
    notificationType: string;
    channel: string;
    phoneNumber?: string | null;
    email?: string | null;
    status: string;
    errorMessage?: string;
  }
) {
  try {
    await adminClient.from("notification_logs").insert({
      user_id: userId,
      notification_type: notificationType,
      channel,
      phone_number: phoneNumber || null,
      email: email || null,
      status,
      error_message: errorMessage || null,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    // If notification_logs table is missing or doesn't have email column, silently fallback
  }
}
