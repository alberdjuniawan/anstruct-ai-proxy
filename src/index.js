export default {
  async fetch(req, env, ctx) {
    try {

      if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const { prompt } = await req.json();
      if (!prompt) {
        return new Response("Missing 'prompt' in request body", { status: 400 });
      }

      console.log("Prompt diterima:", prompt);

      const geminiReq = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "You are a project structure generator. Return ONLY a tab-indented blueprint of the project structure, no explanations."
              }
            ]
          },
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      };

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_KEY}`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiReq)
        }
      );

      console.log("Status Gemini:", resp.status);

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Gemini error:", errText);
        return new Response(errText, { status: resp.status });
      }

      const result = await resp.json();
      const blueprint = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return Response.json({ blueprint });
    } catch (err) {
      console.error("Worker error:", err);
      return new Response("Internal Server Error: " + err.message, { status: 500 });
    }
  }
};