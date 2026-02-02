// "use client";

// import { useEffect, useState, use } from "react"; // ✅ NEW: import use

// interface ArticlePageProps {
//   searchParams: Promise<{ userId?: string }>; // ✅ NEW: Promise type
// }

// export default function ArticlePage({ searchParams }: ArticlePageProps) {
//   // ✅ NEW: unwrap searchParams
//   const { userId } = use(searchParams);

//   const [article, setArticle] = useState<string>("Loading...");
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     async function fetchArticle() {
//       try {
//         if (!userId) {
//           setError("No userId provided");
//           return;
//         }

//         const res = await fetch("/api/generate-article", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           setError(data.error || "Failed to generate article");
//         } else {
//           setArticle(data.text);
//         }
//       } catch (err) {
//         console.error(err);
//         setError("Unexpected error occurred");
//       }
//     }

//     fetchArticle();
//   }, [userId]);

//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   return (
//     <div>
//       <h1>Generated Scientific Article</h1>
//       <p>{article}</p>
//     </div>
//   );
// }

"use client";

export default function ArticlePage() {
  const article =
    typeof window !== "undefined"
      ? localStorage.getItem("article")
      : null;

  return (
    <div>
      <h1>Generated Scientific Article</h1>
      <p>{article}</p>
    </div>
  );
}