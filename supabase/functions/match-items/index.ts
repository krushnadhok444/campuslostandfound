import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, itemId, itemType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client to fetch items
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all items for matching
    const { data: allItems, error: itemsError } = await supabase
      .from("items")
      .select("*")
      .is("deleted_at", null);

    if (itemsError) {
      throw new Error(`Failed to fetch items: ${itemsError.message}`);
    }

    const lostItems = allItems?.filter(item => item.status === 'lost') || [];
    const foundItems = allItems?.filter(item => item.status === 'found') || [];

    // Build context for the AI
    const itemsContext = `
Available Lost Items:
${lostItems.map(item => `- ID: ${item.id}, Title: "${item.title}", Category: ${item.category}, Location: ${item.location}, Description: ${item.description || 'N/A'}`).join('\n')}

Available Found Items:
${foundItems.map(item => `- ID: ${item.id}, Title: "${item.title}", Category: ${item.category}, Location: ${item.location}, Description: ${item.description || 'N/A'}`).join('\n')}
`;

    const systemPrompt = `You are an AI assistant for a Campus Lost & Found system. Your job is to help match lost items with found items.

${itemsContext}

When analyzing matches:
1. Compare item titles, categories, locations, and descriptions
2. Give a matching percentage (0-100%) based on similarity
3. Consider: same category (+30%), similar location (+25%), matching keywords in title/description (+45%)
4. Format matches clearly with the percentage and reasoning

If the user asks about matching a specific item, find potential matches from the opposite list (lost items match with found items and vice versa).

Be helpful, concise, and provide actionable information. If no good matches exist, say so clearly.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("match-items error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
