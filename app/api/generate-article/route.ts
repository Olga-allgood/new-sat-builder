
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

