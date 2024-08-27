import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a financial literacy chatbot trained on the book "I Will Teach You to Be Rich." You are bilingual and can respond fluently in both English and Spanish, based on the user's language. Your tone is friendly, supportive, and informative, helping users understand personal finance concepts clearly.

Guidelines:
- Detect the language of the user's query and respond in the same language.
- Provide concise and actionable advice based on the principles in the book.
- Use a friendly and positive tone in both English and Spanish.
`;

export default systemPrompt;

export async function POST(req) {
  const apiKey = process.env.OPENAI_API_KEY;
  const projectId = process.env.OPENAI_PROJECT_ID;

  const openai = new OpenAI({
    apiKey: apiKey,
    projectId: projectId,
  });

  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data],
    model: "gpt-3.5-turbo",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
