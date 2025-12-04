// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// @ts-ignore: Deno types
import nodemailer from "npm:nodemailer@6.9.7";

// @ts-ignore: Deno global
const GMAIL_USER = Deno.env.get("GMAIL_USER");
// @ts-ignore: Deno global
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
// @ts-ignore: Deno global
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:8080";

interface ChatNotificationRequest {
  conversationId: string;
  recipientEmail: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // @ts-ignore: Deno global
    const supabaseClient = createClient(
      // @ts-ignore: Deno global
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore: Deno global
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { conversationId, recipientEmail }: ChatNotificationRequest = await req.json();

    // Fetch conversation details
    const { data: conversation, error: convError } = await supabaseClient
      .from("conversations")
      .select("*, enquiry:enquiries!enquiry_id(*)")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error("Conversation not found");
    }

    // Fetch the latest message
    const { data: latestMessage, error: messageError } = await supabaseClient
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (messageError || !latestMessage) {
      throw new Error("Message not found");
    }

    const enquiry = conversation.enquiry;
    const isAdminMessage = latestMessage.sender_type === "admin";
    const recipientName = isAdminMessage ? enquiry.name : "Admin";

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    // Send email notification
    await transporter.sendMail({
      from: `SS Cleaners <${GMAIL_USER}>`,
      to: recipientEmail,
      subject: `New Message from ${isAdminMessage ? "SS Cleaners Team" : enquiry.name}`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">💬 New Message</h1>
            </div>

            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Hi ${recipientName},
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                You have a new message ${isAdminMessage ? "from our support team" : `from ${enquiry.name}`} regarding your enquiry.
              </p>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${isAdminMessage ? "Support Team" : enquiry.name}
                </p>
                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  "${latestMessage.message_text}"
                </p>
                <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">
                  ${new Date(latestMessage.created_at).toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">📋 Enquiry Reference</h3>
                <p style="margin: 5px 0; color: #374151;">
                  <strong>ID:</strong> #${enquiry.id.slice(0, 8).toUpperCase()}
                </p>
                <p style="margin: 5px 0; color: #374151;">
                  <strong>Service:</strong> ${enquiry.service_required.replace(/-/g, " ")}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}${isAdminMessage ? "/contact" : `/admin/enquiries/${enquiry.id}`}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block;
                          font-weight: bold;
                          font-size: 16px;">
                  View Conversation
                </a>
              </div>

              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                ${isAdminMessage 
                  ? "Our team is here to help! Reply to continue the conversation."
                  : "Please respond to the customer as soon as possible."}
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p style="margin: 5px 0;">
                This is an automated notification from SS Cleaners.
              </p>
              <p style="margin: 15px 0;">
                <a href="${APP_URL}" style="color: #667eea; text-decoration: none;">Visit Our Website</a> | 
                <a href="mailto:support@sspurecare.com" style="color: #667eea; text-decoration: none;">Contact Support</a>
              </p>
            </div>
          </div>
        `,
    });

    console.log("✅ Chat notification email sent via Gmail SMTP");

    // Log email notification
    await supabaseClient.from("email_notifications").insert({
      enquiry_id: enquiry.id,
      recipient_email: recipientEmail,
      recipient_type: isAdminMessage ? "user" : "admin",
      notification_type: "chat_message",
      subject: `New Message from ${isAdminMessage ? "SS Cleaners Team" : enquiry.name}`,
      body: latestMessage.message_text,
      status: "sent",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Chat notification sent successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending chat notification:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
