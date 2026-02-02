// import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { createClient } from "@supabase/supabase-js";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
// );

// export async function POST(req: Request) {
//   try {
//     const { userId } = await req.json();

//     // 1️⃣ Fetch 5 incorrectly guessed words
//     const { data, error } = await supabase
//       .from("game_sessions")
//       // .select("words(word)")
//       .select("words!game_sessions_word_id_fkey(word)")
//       .eq("user_id", userId)
//       .eq("correct_guesses", false)
//       .limit(5);

//     console.log("Supabase fetch result:", { data, error });  

//     if (error || !data || data.length < 5) {
//       return NextResponse.json(
//         { error: "Not enough failed words" },
//         { status: 400 }
//       );
//     }

   
//     const words = data.map(row => row.words[0].word);

//     // 2️⃣ Prompt Gemini
//     const prompt = `
// Write a scientific-style paragraph (5–7 sentences).
// Use ONLY the following 5 words, multiple times if needed:
// ${words.join(", ")}.
// Do not use any other vocabulary.
// `;

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);

//     return NextResponse.json({
//       article: result.response.text(),
//       words
//     });

//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Gemini failed" }, { status: 500 });
//   }
// }


// LOWER CODE
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
try {
// Get the words from request body
const { words } = await request.json();

// Validate input
if (!words || !Array.isArray(words) || words.length === 0) {
return NextResponse.json(
{ error: "Please provide an array of words" },
{ status: 400 },
);
}

// Check if API key is configured
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
return NextResponse.json(
{ error: "Gemini API key not configured" },
{ status: 500 },
);
}

// Initialize Gemini with the API key
const genAIClient = new GoogleGenerativeAI(apiKey);

// Get the Gemini model (using lite version for better quota availability)
const model = genAIClient.getGenerativeModel({
model: "gemini-2.5-flash-lite",
});

// Create the prompt
const wordList = words
.map(
(w: { word: string; definition: string }) =>
`${w.word}: ${w.definition}`,
)
.join("\n");

const prompt = `You are writing a scientific article. It can be on any topic. It needs to be 70-90 words long.

Vocabulary words to include. They need to be underlined:
${wordList}

Write the article now:`;

// Generate content
const result = await model.generateContent(prompt);
const response = await result.response;
const article = response.text();

return NextResponse.json({ article });
} catch (error) {
console.error("Gemini API error:", error);
const errorMessage =
error instanceof Error ? error.message : "Unknown error";

// Check for rate limit error
if (errorMessage.includes("429") || errorMessage.includes("quota")) {
return NextResponse.json(
{ error: "API rate limit exceeded. Please try again later.", details: errorMessage },
{ status: 429 },
);
}

return NextResponse.json(
{ error: "Failed to generate article", details: errorMessage },
{ status: 500 },
);
}
}

