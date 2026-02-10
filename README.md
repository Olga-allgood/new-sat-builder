# SAT Vocabulary Builder

A web application to improve SAT vocabulary through an interactive game. Users guess letters of randomly selected words, see example sentences, track progress, and generate personalized learning articles from missed words. Built with **Next.js**, **TypeScript**, **Supabase**, and **Google Gemini AI**.

---

## Features

## Features
- Interactive word guessing game with real-time feedback
- Tracks correct and incorrect guesses per user
- Displays example sentences for words
- Generates learning articles from missed words using AI
- Allows users to add personal words to practice
- Speech synthesis to hear the pronunciation of words
- History tracking of past games and articles

---

## Dependencies

- [Next.js](https://nextjs.org) – React framework for server-rendered apps  
- [TypeScript](https://www.typescriptlang.org) – Static type checking  
- [Supabase](https://supabase.com) – Backend-as-a-Service (database, authentication)  
- [Google Generative AI](https://developers.generativeai.google/) – Content generation  
- [Tailwind CSS](https://tailwindcss.com) – Styling  

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/sat-vocab-builder.git
cd sat-vocab-builder
2. Install Dependencies
npm install
# or
yarn install
3. Configure Environment Variables
Create a .env.local file in the root directory:

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-google-gemini-api-key

4. Set Up Supabase
Create a Supabase project

Add tables: words, examples, game_sessions, learning_articles, profiles

Configure authentication if needed (email/password)

5. Run the Development Server
npm run dev
# or
yarn dev
Open http://localhost:3000 in your browser.

