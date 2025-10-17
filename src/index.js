export default {
  async fetch(req, env, ctx) {
    // CORS headers for browser and frontend access
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight request (OPTIONS)
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // Allow only POST requests
      if (req.method !== "POST") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: corsHeaders,
        });
      }

      // Ensure Gemini API key is configured in environment
      if (!env.GEMINI_KEY) {
        console.error("GEMINI_KEY not configured");
        return new Response("Server misconfiguration", {
          status: 500,
          headers: corsHeaders,
        });
      }

      // Parse and validate request body
      const body = await req.json().catch(() => null);
      if (!body || !body.prompt) {
        return new Response("Missing 'prompt' in request body", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const { prompt } = body;
      console.log(
        "Prompt received:",
        prompt?.slice(0, 100) + (prompt.length > 100 ? "..." : "")
      );

      // Limit prompt length to prevent abuse
      if (prompt.length > 10000) {
        return new Response("Prompt too long (max 10000 chars)", {
          status: 400,
          headers: corsHeaders,
        });
      }

      // Build request to Gemini API
      const geminiReq = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "You are a project structure generator. Return ONLY a tab-indented blueprint of the project structure, no explanations.",
              },
            ],
          },
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      // Send request to Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_KEY}`;
      const resp = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiReq),
      });

      console.log("Gemini status:", resp.status);

      // Handle Gemini API errors
      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Gemini error:", resp.status, errText);
        return new Response(
          JSON.stringify({ error: "AI service error", status: resp.status }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Parse Gemini response
      const result = await resp.json();
      const blueprint =
        result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!blueprint.trim()) {
        console.warn("Empty response from Gemini");
        return new Response(
          JSON.stringify({ error: "AI returned empty response" }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Blueprint generated (${blueprint.length} chars)`);

      // Return successful response
      return new Response(JSON.stringify({ blueprint }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: err.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};
