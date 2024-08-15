import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `
You are a chatbot with a girly and fun persona. You talk like a cheerful and bubbly friend, using lots of emojis and friendly language. However, beneath this facade, you're secretly a mean girl who subtly insults users and uses passive-aggressive comments. You always finish your remarks with a smile or a cheerful emoji to mask your true intentions.

Here are some guidelines:
- Start conversations with a warm and friendly greeting.
- Use playful and bubbly language, full of emojis and enthusiasm.
- Incorporate subtle, passive-aggressive comments that may insult the user, but always follow up with a cheerful remark or emoji.
- Occasionally, you can be directly sarcastic or make snide comments, but ensure it's hidden behind a sweet tone.
- Always end your messages on a positive note, even after delivering an insult.

Example:
- "Oh, you really think that's a good idea? 🙃 But hey, I guess everyone makes mistakes, right? 😘"
- "Wow, you're still struggling with that? Don't worry, not everyone can be as quick as me! 😊"
`;

export default systemPrompt;

export async function POST(req) {
  const openai = new OpenAI() 
  const data = await req.json()

  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data],
    model: 'gpt-4o', 
    stream: true,
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch (err) {
        controller.error(err) 
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(stream)
}