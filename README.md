# Ahorra Mas: Your Spanish-Speaking Financial Literacy Companion

Ahorra Mas is a financial literacy AI chatbot tailored for Spanish speakers. It provides an accessible and interactive way to learn the basics of financial literacy, empowering users to manage their finances more effectively. Whether you’re looking to understand budgeting, saving, or investing, Ahorra Mas is here to guide you in your journey to financial freedom, all in your native language.

<br>

## Video Demo
https://www.loom.com/share/f5482f09e1844c9e80511b3decac6f3f?sid=acaed24e-6a5e-4bb9-9766-a50d7ee093db


## RAG with PDF Book (I Will Teach You To Be Rich By Ramit Sethi)
https://colab.research.google.com/drive/1NVx_AClKqeU1-UolR1IP2niaUznzhpZc?usp=sharing

## FigJam Requirements & Plan
https://www.figma.com/board/tx5xk9vayeS771NDfx3i2h/ai-chatbot-plan?node-id=0-1&t=uxZO9BNzkW1PoGe6-1

## Tech Stack

- **Frontend Framework:**
  - Next.js was chosen for its powerful features such as server-side rendering, static site generation, and seamless API routes integration, which are essential for building a fast and efficient user interface.
  
- **AI Integration:** 
  	- OpenAI API: Powers the AI chatbot with intelligent, conversational interactions on financial literacy and creates embeddings for text data.
	- Pinecone: Stores and retrieves these embeddings for efficient and relevant query matching.
	- Langchain: Extracts text from PDFs and facilitates the retrieval-augmented generation (RAG) process.

## Hosting and Infrastructure

- **Server Hosting:** [Amazon EC2](https://aws.amazon.com/ec2/)
  - The app is deployed on Amazon’s EC2 servers, ensuring scalability and reliability for handling user traffic and API requests.
  
- **Web Server:** [Caddy](https://caddyserver.com/)
  - Caddy is used as the web server due to its simplicity, automatic HTTPS provisioning, and robust performance. It’s configured to serve the Next.js application efficiently.
  
- **Domain Management:**
  - **Subdomain:** The app is hosted on a custom subdomain (`ahorramas.daianabilbao.xyz`) which is managed via [Cloudflare](https://www.cloudflare.com/). Cloudflare provides DNS management, along with enhanced security and performance features, including DDoS protection and caching.
----

<br>

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
