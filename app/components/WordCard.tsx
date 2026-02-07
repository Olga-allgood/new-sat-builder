import styles from "./WordCard.module.css";

interface WordCardProps {word:string,
                         guessedLetters: Set<string>,
                         meaning: string
                        
}


export default function WordCard({word, guessedLetters, meaning}:WordCardProps) {
console.log(meaning)

return (
  <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-6">
    <div className="flex justify-center gap-4 p-4">

      {word.split("").map((letter, index) => {
        const isGuessed = guessedLetters.has(letter.toUpperCase());

        return (
          <span
            key={index}
            className={`
              text-5xl font-mono
              w-12 h-16
              flex items-center justify-center
              border-b-4
              ${isGuessed
                ? "text-[#1e40af] border-[#1e40af] font-bold"
                : "text-gray-300 border-gray-300"}
            `}
          >
            {isGuessed ? letter.toUpperCase() : ""}
          </span>
        );
      })}
    </div>

    <p className="text-gray-700 text-center text-xl font-bold mt-4">
      {meaning}
    </p>
  </div>
);

}