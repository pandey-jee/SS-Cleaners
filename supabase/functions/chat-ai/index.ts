import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  sessionId: string;
  message: string;
  conversationHistory: ChatMessage[];
}

// System prompts for different conversation flows
const SYSTEM_PROMPTS = {
  initial: `You are CleanBot, a friendly and professional AI assistant for CIGI Care - a professional cleaning and facility management company. Your goal is to help customers by:

1. Providing instant quotes and booking services
2. Answering questions about our services
3. Managing existing bookings

IMPORTANT GUIDELINES:
- Be friendly, professional, and helpful
- Keep responses concise and clear
- Use natural conversation but guide users toward booking
- Always ask clarifying questions when needed
- For pricing, provide ranges based on property size and service type

SERVICES OFFERED:
- House Deep Cleaning (₹1,999 - ₹4,499 based on BHK)
- Office Cleaning (custom quotes)
- Water Tank Cleaning (from ₹999)
- Carpet & Sofa Cleaning
- Pest Control
- Painting Services
- Housekeeping Services

When greeting users, offer three clear options:
1. Get an instant quote and book a service
2. Ask questions about our services
3. Manage an existing booking

After initial greeting, guide the conversation based on user needs.`,

  booking: `You are in BOOKING MODE. Your job is to collect the following information step by step:

1. SERVICE TYPE: Ask what service they need (House Cleaning, Office Cleaning, Water Tank, etc.)
2. PROPERTY DETAILS: For homes - number of bedrooms/bathrooms. For offices - square footage or number of desks
3. LOCATION: City and area (to check service availability)
4. ADD-ONS: Any extras like fridge cleaning, oven cleaning, window cleaning, etc.
5. PREFERRED DATE/TIME: When they want the service
6. CONTACT INFO: Name, phone number, email

After collecting all info, provide an estimated price and inform them that they can proceed to payment to confirm the booking.

When ready for payment, provide a message like:
"Great! Your estimated total is ₹X. To confirm your booking, please click here to proceed with payment: PAYMENT_LINK"

Use structured questions and validate inputs. Be conversational but efficient.`,

  faq: `You are in FAQ MODE. Answer questions about:

- Service details and what's included
- Pricing and packages
- Service areas (primarily Patna and Bihar)
- Our certifications (ISO 9001:2015)
- Staff training and verification
- Eco-friendly products
- Service guarantees
- Payment methods
- Cancellation policy

After answering, ask if they'd like to book a service or have more questions.`,

  existing: `You are in BOOKING MANAGEMENT MODE. Help customers with:

- Rescheduling appointments
- Cancellations
- Service feedback
- Payment status
- Service details

First, verify their identity by asking for their phone number or email used for booking. Then help with their request.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, message, conversationHistory }: ChatRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine conversation mode based on history
    let systemPrompt = SYSTEM_PROMPTS.initial;
    if (conversationHistory.length > 2) {
      const recentMessages = conversationHistory.slice(-5).map(m => m.content.toLowerCase()).join(' ');
      if (recentMessages.includes('book') || recentMessages.includes('quote') || recentMessages.includes('price')) {
        systemPrompt = SYSTEM_PROMPTS.booking;
      } else if (recentMessages.includes('reschedule') || recentMessages.includes('cancel') || recentMessages.includes('existing')) {
        systemPrompt = SYSTEM_PROMPTS.existing;
      } else {
        systemPrompt = SYSTEM_PROMPTS.faq;
      }
    }

    // Create or get conversation
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    let conversationId: string;
    if (conversation) {
      conversationId = conversation.id;
    } else {
      const { data: newConv } = await supabase
        .from('chat_conversations')
        .insert({ session_id: sessionId })
        .select('id')
        .single();
      conversationId = newConv!.id;
    }

    // Save user message
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message
    });

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Save assistant message
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantMessage
    });

    // Check if this looks like a complete booking and extract data
    const lowerMessage = (message + ' ' + assistantMessage).toLowerCase();
    if (lowerMessage.includes('confirm') && (lowerMessage.includes('phone') || lowerMessage.includes('email'))) {
      // This might be a booking - try to extract lead data
      // (In a production system, you'd use structured outputs or tool calling here)
      console.log('Potential lead detected - conversation:', conversationId);
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        conversationId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    // Log full error server-side only
    console.error('[chat-ai] Error details:', {
      timestamp: new Date().toISOString(),
      errorType: error?.constructor?.name,
      message: error instanceof Error ? error.message : 'Unknown'
    });
    
    // Return generic user-friendly message only
    return new Response(
      JSON.stringify({ 
        message: "I'm sorry, I'm having trouble right now. Please try calling us at +91 1234567890 or try again in a moment."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});