import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Baseline fallback answers
        let responsePhrases = [
          "I've analyzed your active content pack settings. ",
          "Based on your creator profile learning database, ",
          "your script structure has strong pacing. ",
          "To optimize the score further, we should adjust the body paragraphs formatting to use cleaner line spacing. ",
          "Let me know if you would like me to rewrite any section, or review platform analytics."
        ];

        const query = lastMessage.toLowerCase();

        // 1. TikTok hook optimization request
        if (query.includes("tiktok") || query.includes("hook")) {
          responsePhrases = [
            "Your hooks tend to open with a statement. Try opening with a question instead — questions earn more comments and the algorithm loves comment velocity.\n\n",
            "Here is a suggested rewrite for your primary Hook:\n",
            "**'I used to spend 8 hours on a single post. Now it's 4 minutes. And the secret is a mindset shift at 10k.'** (Predicted Score: 87%)\n\n",
            "Want me to push this update to your active draft?"
          ];
        } 
        // 2. Score diagnostic request
        else if (query.includes("score") || query.includes("why did my last pack") || query.includes("62")) {
          responsePhrases = [
            "Your last pack scored a 74, which is average. The drop was caused by the body copy readability index — it was flagged as too clinical for short-form audiences.\n\n",
            "To fix it, we should simplify sentences to a 6th-grade reading level and add line breaks every 2 sentences. That increases dwell time and comment ratios."
          ];
        } 
        // 3. Instagram caption request
        else if (query.includes("instagram") || query.includes("caption") || query.includes("rewrite")) {
          responsePhrases = [
            "I've written a native adaptation for Instagram. It replaces technical keywords with lifestyle creator tags, adds line breaks, and includes a DM call-to-action.\n\n",
            "**'DM me the word SCALE and I'll send you my workflow template.'**\n\n",
            "Would you like to deploy this to your caption editor?"
          ];
        }
        // 4. Trends request
        else if (query.includes("trend") || query.includes("niche")) {
          responsePhrases = [
            "Trending vectors in your niche right now focus on: \n\n",
            "1. 'Aesthetic setups' and minimalist workstations (showing linen paper and soft morning light).\n",
            "2. B2B copywriting math showing verification metrics.\n",
            "3. Documentaries editing style replacing flashy 2022 edits.\n\n",
            "I've configured these settings to default pack prompts."
          ];
        }

        // Stream tokens in chunks
        for (const phrase of responsePhrases) {
          // split phrase into chunks of 5 characters to simulate high speed streaming
          for (let idx = 0; idx < phrase.length; idx += 5) {
            const chunk = phrase.slice(idx, idx + 5);
            // SSE event format: "data: <content>\n\n"
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n`));
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
        }

        // Send terminating packet
        controller.enqueue(encoder.encode("data: [DONE]\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Chat Stream Error:", error);
    return new Response(JSON.stringify({ error: "Failed to stream chat responses" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
