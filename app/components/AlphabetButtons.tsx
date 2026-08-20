"use client";

import { Button, Flex } from "antd";

interface AlphabetButtonsProps {
  guessedLetters: Set<string>;
  incorrectGuesses: string[];
  onGuess: (letter: string) => void;
}

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export default function AlphabetButtons({
  guessedLetters,
  incorrectGuesses,
  onGuess,
}: AlphabetButtonsProps) {
  /*
   * Normalize everything to uppercase.
   *
   * This is important because the keyboard letters
   * are uppercase, while guesses could potentially
   * arrive in either upper or lowercase.
   */
  const correctLetters = new Set(
    Array.from(guessedLetters).map((letter) =>
      letter.toUpperCase()
    )
  );

  const incorrectLetters = new Set(
    incorrectGuesses.map((letter) =>
      letter.toUpperCase()
    )
  );

  return (
    <Flex
      vertical
      gap={8}
      align="center"
      style={{
        width: "100%",
        maxWidth: 540,
        margin: "0 auto",
      }}
    >
      {keyboardRows.map(
        (row, rowIndex) => (
          <Flex
            key={rowIndex}
            justify="center"
            gap={6}
            style={{
              width: "100%",
            }}
          >
            {row.map((letter) => {
              const isCorrect =
                correctLetters.has(letter);

              const isIncorrect =
                incorrectLetters.has(letter);

              /*
               * A letter is disabled regardless
               * of whether the guess was correct
               * or incorrect.
               */
              const isUsed =
                isCorrect || isIncorrect;

              return (
                <Button
                  key={letter}
                  type={
                    isUsed
                      ? "default"
                      : "primary"
                  }
                  disabled={isUsed}
                  onClick={() =>
                    onGuess(letter)
                  }
                  aria-label={
                    isIncorrect
                      ? `${letter}, incorrect guess`
                      : isCorrect
                        ? `${letter}, already guessed`
                        : `Guess ${letter}`
                  }
                  style={{
                    flex: "1 1 0",
                    minWidth: 0,
                    maxWidth: 46,
                    height: 44,
                    padding: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    touchAction:
                      "manipulation",

                    ...(isUsed && {
                      background:
                        "#f5f5f5",
                      borderColor:
                        "#d9d9d9",
                      color: "#bfbfbf",
                    }),
                  }}
                >
                  {letter}
                </Button>
              );
            })}
          </Flex>
        )
      )}
    </Flex>
  );
}