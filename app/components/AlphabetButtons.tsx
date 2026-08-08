
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
            const guessed =
              guessedLetters.has(letter);

            return (
              <button
                key={letter}
                type="button"
                onClick={() => onGuess(letter)}
                disabled={guessed}
                className={`
                  w-8 h-11
                  sm:w-10 sm:h-12
                  md:w-11 md:h-12
                  shrink-0
                  rounded-md
                  font-semibold
                  text-sm sm:text-base
                  transition
                  touch-manipulation
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

