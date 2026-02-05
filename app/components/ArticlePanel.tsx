"use client";

import { useState } from "react";

interface FailedWord {
word: string;
definition: string;
}

interface ArticlePanelProps {
failedWords: FailedWord[];
onClose: () => void;
}

export default function ArticlePanel({ failedWords, onClose }: ArticlePanelProps) {
const [article, setArticle] = useState<string>("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [hasGenerated, setHasGenerated] = useState(false);

async function generateArticle() {
setLoading(true);
setError("");

try {
const response = await fetch("/api/generate-article", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({ words: failedWords }),
});

const data = await response.json();

if (!response.ok) {
throw new Error(data.error || "Failed to generate article");
}

setArticle(data.article);
setHasGenerated(true);
} catch (err) {
setError(err instanceof Error ? err.message : "Something went wrong");
} finally {
setLoading(false);
}
}

// Convert markdown bold (word) to HTML
function renderArticle(text: string) {
const parts = text.split(/(\*\*[^*]+\*\*)/g);
return parts.map((part, index) => {
if (part.startsWith("**") && part.endsWith("**")) {
const word = part.slice(2, -2);
return (
<strong key={index} className="text-blue-600 font-semibold">
{word}
</strong>
);
}
return part;
});
}

// return (
// <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
// <div className="mb-3 flex items-center justify-between">
// <h3 className="font-semibold text-orange-800">
// 📚 Learn from Your Mistakes
// </h3>
// <button
// onClick={onClose}
// className="text-gray-500 hover:text-gray-700"
// >
// ✕
// </button>
// </div>

// {/* Show the words that will be used */}
// <div className="mb-4">
// <p className="text-sm text-gray-600 mb-2">
// Words you missed ({failedWords.length}):
// </p>
// <div className="flex flex-wrap gap-2">
// {failedWords.map((w, i) => (
// <span
// key={i}
// className="rounded bg-orange-200 px-2 py-1 text-sm text-orange-800"
// >
// {w.word}
// </span>
// ))}
// </div>
// </div>

// {/* Generate button or article display */}
// {!hasGenerated ? (
// <button
// onClick={generateArticle}
// disabled={loading}
// className="w-full rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50"
// >
// {loading ? "Generating Article..." : "Generate Learning Article"}
// </button>
// ) : (
// <div className="rounded bg-white p-4 border border-orange-100">
// <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
// {renderArticle(article)}
// </p>
// <button
// onClick={generateArticle}
// disabled={loading}
// className="mt-4 rounded border border-orange-600 px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-50"
// >
// {loading ? "Regenerating..." : "Regenerate Article"}
// </button>
// </div>
// )}

// {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

// <p className="mt-3 text-xs text-gray-500">
// Powered by Google Gemini AI
// </p>
// </div>
// )
return (
  <div className="mt-6 rounded-lg border border-[#787b80]/30 bg-gray-50 p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-[#2d76c0] text-lg">
        📚 Learn from Your Mistakes
      </h3>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>

    <div>
      <p className="text-sm text-gray-600 mb-2">
        Words you missed ({failedWords.length}):
      </p>
      <div className="flex flex-wrap gap-2">
        {failedWords.map((w, i) => (
          <span
            key={i}
            className="rounded bg-[#2d76c0]/20 px-2 py-1 text-sm text-[#2d76c0]"
          >
            {w.word}
          </span>
        ))}
      </div>
    </div>

    {!hasGenerated ? (
      <button
        onClick={generateArticle}
        disabled={loading}
        className="w-full rounded bg-[#009CDE] px-4 py-2 text-white hover:bg-[#2d76c0] disabled:opacity-50 transition"
      >
        {loading ? "Generating Article..." : "Generate Learning Article"}
      </button>
    ) : (
      <div className="rounded bg-white p-4 border border-[#787b80]/20 space-y-3">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {renderArticle(article)}
        </p>
        <button
          onClick={generateArticle}
          disabled={loading}
          className="mt-2 rounded border border-[#009CDE] px-3 py-1 text-sm text-[#009CDE] hover:bg-[#009CDE]/10 disabled:opacity-50 transition"
        >
          {loading ? "Regenerating..." : "Regenerate Article"}
        </button>
      </div>
    )}

    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

    <p className="mt-3 text-xs text-gray-500">
      Powered by Google Gemini AI
    </p>
  </div>
);
}