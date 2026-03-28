import OpenAI from "openai";

// Initialize OpenAI lazily
let openai: OpenAI | null = null;

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, message, messages, prompt } = req.body;

  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      openai = new OpenAI({ apiKey });
    }
  }

  if (!openai) {
    return res.status(503).json({ error: "Service unavailable. OpenAI not configured." });
  }

  try {
    const systemPrompt = prompt || "Você é um assistente prestativo.";

    // Prepare messages for OpenAI
    const apiMessages: any[] = [{ role: "system", content: systemPrompt }];
    
    if (messages && Array.isArray(messages)) {
      messages.forEach((msg: any) => {
        apiMessages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    } else {
      apiMessages.push({ role: "user", content: message || "Olá!" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: apiMessages,
    });

    const responseText = completion.choices[0].message.content;
    return res.status(200).json({ response: responseText });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
