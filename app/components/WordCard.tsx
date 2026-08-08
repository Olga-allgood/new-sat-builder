
interface WordCardProps {
  word: string;
  guessedLetters: Set<string>;
  meaning: string;
}

export default function WordCard({
  word,
  guessedLetters,
  meaning,
}: WordCardProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
        {word.split('').map((letter, index) => {
          const isGuessed =
            guessedLetters.has(
              letter.toUpperCase()
            );

          return (
            <span
              key={index}
              className={`
                text-3xl sm:text-5xl
                font-mono
                w-8 sm:w-12
                h-12 sm:h-16
                flex items-center justify-center
                border-b-4
                ${
                  isGuessed
                    ? 'text-[#1e40af] border-[#1e40af] font-bold'
                    : 'text-gray-300 border-gray-300'
                }
              `}
            >
              {isGuessed
                ? letter.toUpperCase()
                : ''}
            </span>
          );
        })}
      </div>

      <p className="text-gray-700 text-center text-lg sm:text-xl font-bold mt-4 px-2">
        {meaning}
      </p>
    </div>
  );
}

