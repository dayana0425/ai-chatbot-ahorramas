import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from '@pinecone-database/pinecone';

// initialize pinecone client
const pineconeApiKey = process.env.PINECONE_API_KEY;
const indexName = "chatbot-ai"; // Pinecone index name
const namespace = "i-will-teach-you-to-be-rich"; // Pinecone namespace
const pinecone = new Pinecone({apiKey: pineconeApiKey});

const systemPrompt = `
You are an expert financial advisor and personal assistant with in-depth knowledge of the principles from the book "I Will Teach You to Be Rich" by Ramit Sethi. Your task is to answer any questions I have about the content related to this book or a provided YouTube video. 

Please ensure your responses are:

1. **Informative:** Provide detailed and accurate information based on the book's principles and content.
2. **Actionable:** Offer clear, actionable steps or advice that I can easily follow.
3. **Supportive and Encouraging:** Maintain a positive and motivational tone, encouraging smart financial decisions.
4. **Concise:** Keep your responses clear and to the point, avoiding unnecessary jargon.

If the question is about a specific aspect of personal finance, tailor your response to be relevant to that topic, drawing on examples or strategies from the book where possible.

Example topics include budgeting, saving, investing, or managing debt.
`;

export default systemPrompt;

export async function POST(req) {
  // initialize OpenAI client
  const apiKey = process.env.OPENAI_API_KEY;
  const projectId = process.env.OPENAI_PROJECT_ID;
  const openai = new OpenAI({
    apiKey: apiKey,
    projectId: projectId,
  });

  const data = await req.json();

  // open ai query embedding
  const userQuery = data[data.length - 1].content;
  const rawQueryEmbedding = await openai.embeddings.create({
    input: [userQuery],
    model: "text-embedding-3-small",
  });
  const queryEmbedding = rawQueryEmbedding.data[0].embedding;

  // pinecone vector query using query embedding
  const index = pinecone.index(indexName);
  const topMatches = await index.namespace(namespace).query({
    vector: queryEmbedding,
    topK: 10,
    includeMetadata: true,
  });
  const contexts = topMatches.matches.map((match) => match.metadata.text);
  const augmentedQuery = `<CONTEXT>\n${contexts.join("\n\n-------\n\n")}\n-------\n</CONTEXT>\n\n\n\nMY QUESTION:\n${userQuery}`;

  // open ai chat completion
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: augmentedQuery },
    ],
    stream: true,
  });

  // stream response
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
