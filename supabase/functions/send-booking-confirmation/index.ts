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

interface BookingConfirmationRequest {
  bookingId: string;
  enquiryId: string;
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

    const { bookingId, enquiryId }: BookingConfirmationRequest = await req.json();

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Fetch enquiry details
    const { data: enquiry, error: enquiryError } = await supabaseClient
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single();

    if (enquiryError || !enquiry) {
      throw new Error("Enquiry not found");
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const timeSlotLabels: Record<string, string> = {
      morning: "Morning (8 AM - 12 PM)",
      afternoon: "Afternoon (12 PM - 4 PM)",
      evening: "Evening (4 PM - 8 PM)",
    };

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

    // Send confirmation email to customer
    await transporter.sendMail({
      from: `SS Cleaners <${GMAIL_USER}>`,
      to: enquiry.email,
      subject: "Booking Confirmed - SS Cleaners",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px;">✅ Booking Confirmed!</h1>
            </div>

            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Dear ${enquiry.name},</p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Great news! Your booking has been successfully confirmed. We're excited to serve you!
              </p>

              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
                <h3 style="margin-top: 0; color: #065f46; font-size: 20px;">📋 Booking Details</h3>
                <p style="margin: 5px 0; color: #374151;"><strong>Booking ID:</strong> #${booking.id.slice(0, 8).toUpperCase()}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Service:</strong> ${enquiry.service_required.replace(/-/g, " ")}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Property Type:</strong> ${booking.property_type.charAt(0).toUpperCase() + booking.property_type.slice(1)}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Size:</strong> ${booking.property_size_sqft} sq ft</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Rooms:</strong> ${booking.number_of_rooms} | <strong>Bathrooms:</strong> ${booking.number_of_bathrooms}</p>
              </div>

              <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">📅 Scheduled For:</h3>
                <p style="font-size: 20px; font-weight: bold; color: #1e40af; margin: 10px 0;">
                  ${formatDate(booking.preferred_date)}
                </p>
                <p style="font-size: 16px; color: #374151; margin: 5px 0;">
                  ${timeSlotLabels[booking.preferred_time_slot]}
                </p>
              </div>

              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #374151; font-size: 18px;">📍 Service Location:</h3>
                <p style="margin: 5px 0; color: #6b7280;">${booking.address_line1}</p>
                ${booking.address_line2 ? `<p style="margin: 5px 0; color: #6b7280;">${booking.address_line2}</p>` : ""}
                <p style="margin: 5px 0; color: #6b7280;">${enquiry.city}</p>
                ${booking.landmark ? `<p style="margin: 10px 0 5px 0; color: #6b7280;"><strong>Landmark:</strong> ${booking.landmark}</p>` : ""}
              </div>

              ${booking.add_ons && booking.add_ons.length > 0 ? `
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <h3 style="margin-top: 0; color: #92400e; font-size: 18px;">✨ Additional Services:</h3>
                  <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
                    ${booking.add_ons.map((addOn: string) => `<li style="margin: 5px 0;">${addOn.replace(/_/g, " ").split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</li>`).join("")}
                  </ul>
                </div>
              ` : ""}

              ${booking.special_instructions ? `
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 25px 0;">
                  <h3 style="margin-top: 0; color: #374151; font-size: 16px;">📝 Your Instructions:</h3>
                  <p style="margin: 5px 0; color: #6b7280; font-style: italic;">"${booking.special_instructions}"</p>
                </div>
              ` : ""}

              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">💰 Estimated Price:</h3>
                <p style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 10px 0;">
                  ₹${booking.estimated_price}
                </p>
                <p style="font-size: 12px; color: #6b7280; margin: 0;">
                  *Final price may vary based on actual requirements
                </p>
              </div>

              <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #14b8a6;">
                <h3 style="margin-top: 0; color: #115e59; font-size: 18px;">📞 What Happens Next?</h3>
                <ol style="color: #374151; line-height: 1.8; padding-left: 20px;">
                  <li>Our team will contact you <strong>within 24 hours</strong> to confirm the appointment</li>
                  <li>You'll receive a reminder <strong>1 day before</strong> your scheduled service</li>
                  <li>Our professional team will arrive on time</li>
                  <li>Enjoy a spotlessly clean space!</li>
                </ol>
              </div>

              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #991b1b; font-size: 18px;">⚠️ Need to Make Changes?</h3>
                <p style="margin: 5px 0; color: #374151;">
                  If you need to reschedule or modify your booking, please contact us at least <strong>24 hours in advance</strong>:
                </p>
                <p style="margin: 15px 0; color: #374151;">
                  📞 <strong>+91 1234567890</strong><br/>
                  📧 <strong>support@sspurecare.com</strong>
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #374151; font-size: 16px; margin-bottom: 15px;">
                  Have questions? We're here to help!
                </p>
                <a href="${APP_URL}/contact" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block;
                          font-weight: bold;
                          font-size: 16px;">
                  Contact Support
                </a>
              </div>

              <p style="margin-top: 30px; color: #374151; font-size: 16px;">
                Thank you for choosing SS Cleaners!
              </p>
              
              <p style="margin-top: 20px; color: #374151;">
                Best regards,<br/>
                <strong style="color: #667eea;">The SS Cleaners Team</strong>
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p style="margin: 5px 0;">
                This is an automated confirmation email.
              </p>
              <p style="margin: 15px 0;">
                <a href="${APP_URL}" style="color: #667eea; text-decoration: none;">Visit Our Website</a> | 
                <a href="mailto:support@sspurecare.com" style="color: #667eea; text-decoration: none;">Contact Support</a>
              </p>
            </div>
          </div>
        `,
    });

    console.log("✅ Customer confirmation email sent via Gmail SMTP");

    // Log customer email
    await supabaseClient.from("email_notifications").insert({
      enquiry_id: enquiryId,
      booking_id: bookingId,
      recipient_email: enquiry.email,
      recipient_type: "user",
      notification_type: "booking_confirmed",
      subject: "Booking Confirmed - SS Cleaners",
      body: "Booking confirmation sent",
      status: "sent",
    });

    // Send admin notification
    await transporter.sendMail({
      from: `SS Cleaners System <${GMAIL_USER}>`,
      to: "pandeyji252002@gmail.com",
      subject: `New Booking Created - ${enquiry.name}`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">🎉 New Booking Created!</h2>
            <p>A customer has completed their booking and is ready for service.</p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #065f46;">Booking #${booking.id.slice(0, 8).toUpperCase()}</h3>
              
              <p style="margin: 5px 0;"><strong>Customer:</strong> ${enquiry.name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${enquiry.email}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${enquiry.phone}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${enquiry.service_required.replace(/-/g, " ")}</p>
              <p style="margin: 5px 0;"><strong>Property:</strong> ${booking.property_type} (${booking.property_size_sqft} sq ft)</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${formatDate(booking.preferred_date)}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${timeSlotLabels[booking.preferred_time_slot]}</p>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${booking.address_line1}, ${enquiry.city}</p>
              <p style="margin: 15px 0 5px 0; font-size: 20px; color: #10b981;"><strong>Estimated Price: ₹${booking.estimated_price}</strong></p>
            </div>

            ${booking.special_instructions ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #92400e;">📝 Special Instructions:</h3>
                <p style="margin: 5px 0; color: #374151;">"${booking.special_instructions}"</p>
              </div>
            ` : ""}

            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">⚡ Action Required:</h3>
              <ol style="color: #374151;">
                <li>Contact the customer within 24 hours to confirm</li>
                <li>Assign a service team</li>
                <li>Send appointment reminder 1 day before</li>
              </ol>
            </div>

            <p style="text-align: center; margin-top: 30px;">
              <a href="${APP_URL}/admin/bookings/${bookingId}" 
                 style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Booking Details
              </a>
            </p>
          </div>
        `,
    });

    console.log("✅ Admin notification sent via Gmail SMTP");

    // Log admin email
    await supabaseClient.from("email_notifications").insert({
      enquiry_id: enquiryId,
      booking_id: bookingId,
      recipient_email: "pandeyji252002@gmail.com",
      recipient_type: "admin",
      notification_type: "booking_created",
      subject: `New Booking Created - ${enquiry.name}`,
      body: "Admin booking notification sent",
      status: "sent",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking confirmation emails sent",
        bookingId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
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
