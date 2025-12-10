import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/uxwso77bhoveglte2ebgfakt1uv45id5";

interface BookingData {
  customerName: string;
  customerPhone: string;
  service: string;
  startTime: string;
  endTime?: string;
  bookingId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const bookingData: BookingData = await req.json();

    if (!bookingData.bookingId) {
      console.error("Missing booking ID in webhook request");
      throw new Error("Booking ID is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("id", bookingData.bookingId)
      .eq("status", "confirmed")
      .maybeSingle();

    if (bookingError) {
      console.error("Database error verifying booking:", bookingError);
      throw new Error("Failed to verify booking");
    }

    if (!booking) {
      console.error("Booking not found or not confirmed:", bookingData.bookingId);
      throw new Error("Booking not found or not confirmed");
    }

    console.log("Verified booking exists, sending to Make.com:", bookingData.bookingId);

    const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vardas: bookingData.customerName,
        telefonas: bookingData.customerPhone,
        paslauga: bookingData.service,
        laikas: bookingData.startTime,
        pabaiga: bookingData.endTime,
        rezervacijos_id: bookingData.bookingId,
      }),
    });

    if (!makeResponse.ok) {
      const errorText = await makeResponse.text();
      console.error("Make.com webhook failed:", makeResponse.status, errorText);
      throw new Error(`Make.com webhook failed: ${makeResponse.statusText}`);
    }

    const { error: logError } = await supabase
      .from("booking_logs")
      .insert({
        booking_id: bookingData.bookingId,
        action: "webhook_sent",
        details: { provider: "make.com", status: "success" },
      });

    if (logError) {
      console.warn("Failed to log webhook success:", logError);
    }

    console.log("Successfully sent to Make.com");

    return new Response(
      JSON.stringify({ success: true, message: "Booking sent to Make.com" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending to Make.com:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});