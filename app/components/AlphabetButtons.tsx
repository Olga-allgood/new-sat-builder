type AlphabetButtonsProps = {
  guessedLetters: Set<string>;
  onGuess: (letter: string) => void;
};

const rows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function AlphabetButtons({
  guessedLetters,
  onGuess,
}: AlphabetButtonsProps) {
  return (
    <div className="w-full max-w-md mx-auto px-2">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex justify-center gap-1.5 sm:gap-2 mb-2"
        >
          {row.map((letter) => {
            const guessed = guessedLetters.has(
              letter.toUpperCase()
            );

            return (
              <button
                key={letter}
                onClick={() => onGuess(letter)}
                disabled={guessed}
                className={`
                  flex-1
                  max-w-[42px]
                  aspect-square
                  rounded-lg
                  font-semibold
                  text-sm sm:text-base
                  transition
                  ${
                    guessed
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                  }
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}