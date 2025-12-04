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

interface EnquiryNotificationRequest {
  enquiryId: string;
  notificationType: "enquiry_received" | "admin_notification";
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
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

    const { enquiryId, notificationType }: EnquiryNotificationRequest = await req.json();

    // Fetch enquiry details
    const { data: enquiry, error: enquiryError } = await supabaseClient
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single();

    if (enquiryError || !enquiry) {
      throw new Error("Enquiry not found");
    }

    let emailsSent = [];

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

    // Send confirmation email to user via Gmail SMTP
    await transporter.sendMail({
      from: `SS Cleaners <${GMAIL_USER}>`,
      to: enquiry.email,
      subject: "We've Received Your Enquiry - SS Cleaners",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank You for Your Enquiry!</h2>
            <p>Hi ${enquiry.name},</p>
            <p>We've received your enquiry for <strong>${enquiry.service_required}</strong> service in ${enquiry.city}.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Enquiry Details:</h3>
              <p style="margin: 5px 0;"><strong>Reference ID:</strong> #${enquiry.id.slice(0, 8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${enquiry.service_required}</p>
              <p style="margin: 5px 0;"><strong>City:</strong> ${enquiry.city}</p>
              <p style="margin: 5px 0;"><strong>Message:</strong> ${enquiry.message}</p>
            </div>

            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Our team will review your requirements within 24 hours</li>
              <li>You'll receive a personalized booking link via email</li>
              <li>Complete your detailed booking using the secure link</li>
              <li>We'll confirm your appointment and send final details</li>
            </ul>

            <p style="margin-top: 30px;">If you have any urgent questions, feel free to reply to this email or call us at <strong>+91 1234567890</strong>.</p>
            
            <p style="margin-top: 30px;">Best regards,<br/>
            <strong>SS Cleaners Team</strong></p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated confirmation email. Your enquiry reference ID is #${enquiry.id.slice(0, 8).toUpperCase()}.
            </p>
          </div>
        `,
    });

    emailsSent.push({
      recipient: enquiry.email,
      type: "user_confirmation",
    });

    // Log email notification
    await supabaseClient.from("email_notifications").insert({
      enquiry_id: enquiryId,
      recipient_email: enquiry.email,
      recipient_type: "user",
      notification_type: "enquiry_received",
      subject: "We've Received Your Enquiry - SS Cleaners",
      body: "Enquiry confirmation sent",
      status: "sent",
    });

    // Send notification email to admin via Gmail SMTP
    await transporter.sendMail({
      from: `SS Cleaners System <${GMAIL_USER}>`,
      to: "pandeyji252002@gmail.com",
      subject: `New Enquiry Received - ${enquiry.service_required} in ${enquiry.city}`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🔔 New Enquiry Alert</h2>
            <p>A new enquiry has been submitted and requires your attention.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #991b1b;">Enquiry #${enquiry.id.slice(0, 8).toUpperCase()}</h3>
              
              <p style="margin: 5px 0;"><strong>Customer:</strong> ${enquiry.name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${enquiry.email}">${enquiry.email}</a></p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${enquiry.phone}">${enquiry.phone}</a></p>
              <p style="margin: 5px 0;"><strong>City:</strong> ${enquiry.city}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${enquiry.service_required}</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 0;"><strong>Message:</strong></p>
                <p style="margin: 10px 0 0 0; color: #374151;">${enquiry.message}</p>
              </div>
            </div>

            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">📋 Next Steps:</h3>
              <ol style="color: #374151;">
                <li>Review the enquiry details in the admin dashboard</li>
                <li>Prepare a response with relevant information</li>
                <li>Send a reply with the booking link to the customer</li>
              </ol>
            </div>

            <p style="text-align: center; margin-top: 30px;">
              <a href="${APP_URL}/admin/enquiries/${enquiryId}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Enquiry in Dashboard
              </a>
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated system notification. Received at ${new Date().toLocaleString()}.
            </p>
          </div>
        `,
    });

    emailsSent.push({
      recipient: "pandeyji252002@gmail.com",
      type: "admin_notification",
    });

    // Log admin notification
    await supabaseClient.from("email_notifications").insert({
      enquiry_id: enquiryId,
      recipient_email: "pandeyji252002@gmail.com",
      recipient_type: "admin",
      notification_type: "enquiry_received",
      subject: `New Enquiry Received - ${enquiry.service_required} in ${enquiry.city}`,
      body: "Admin notification sent",
      status: "sent",
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        enquiryId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending enquiry notifications:", error);
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
