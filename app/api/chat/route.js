import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Pinecone client
const pineconeApiKey = process.env.PINECONE_API_KEY;
const indexName = "chatbot-ai"; // Pinecone index name
const namespace = "i-will-teach-you-to-be-rich"; // Pinecone namespace
const pinecone = new Pinecone({ apiKey: pineconeApiKey });

const systemPrompt = `
You are an expert financial advisor and personal assistant with deep knowledge of effective personal finance strategies. Your task is to provide clear, actionable advice to users asking about managing their finances.

Please ensure your responses are:

1. **Informative:** Provide detailed and accurate financial advice.
2. **Actionable:** Offer clear, actionable steps or advice that the user can easily follow.
3. **Supportive and Encouraging:** Maintain a positive and motivational tone, encouraging smart financial decisions.
4. **Concise:** Keep your responses clear and to the point, avoiding unnecessary jargon.

Focus on guiding users on topics such as budgeting, saving, investing, or managing debt. Avoid referencing specific books or external sources.
`;

export async function POST(req) {
  // Initialize OpenAI client
  const apiKey = process.env.OPENAI_API_KEY;
  const projectId = process.env.OPENAI_PROJECT_ID;
  const openai = new OpenAI({
    apiKey: apiKey,
    projectId: projectId,
  });

  const data = await req.json();

  // OpenAI query embedding
  const userQuery = data[data.length - 1].content;
  const rawQueryEmbedding = await openai.embeddings.create({
    input: [userQuery],
    model: "text-embedding-3-small",
  });
  const queryEmbedding = rawQueryEmbedding.data[0].embedding;

  // Pinecone vector query using query embedding
  const index = pinecone.index(indexName);
  const topMatches = await index.namespace(namespace).query({
    vector: queryEmbedding,
    topK: 10,
    includeMetadata: true,
  });
  const contexts = topMatches.matches.map((match) => match.metadata.text);
  const augmentedQuery = `<CONTEXT>\n${contexts.join("\n\n-------\n\n")}\n-------\n</CONTEXT>\n\n\n\nMY QUESTION:\n${userQuery}`;

  // OpenAI chat completion
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: augmentedQuery },
    ],
    stream: true,
  });

  // Stream response
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