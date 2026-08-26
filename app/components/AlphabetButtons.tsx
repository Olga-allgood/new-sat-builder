"use client";

import {
  Button,
  Flex,
  Grid,
} from "antd";

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
  const screens = Grid.useBreakpoint();

  const isMobile = !screens.md;

  /*
   * Normalize guesses to uppercase so they
   * match the keyboard letters consistently.
   */
  const correctLetters = new Set(
    Array.from(guessedLetters).map(
      (letter) =>
        letter.toUpperCase()
    )
  );

  const incorrectLetters = new Set(
    incorrectGuesses.map(
      (letter) =>
        letter.toUpperCase()
    )
  );

  const buttonHeight =
    isMobile ? 42 : 50;

  const buttonMaxWidth =
    isMobile ? 42 : 52;

  const buttonFontSize =
    isMobile ? 14 : 17;

  const rowGap =
    isMobile ? 5 : 8;

  return (
    <Flex
      vertical
      gap={isMobile ? 7 : 10}
      align="center"
      style={{
        width: "100%",

        maxWidth: isMobile
          ? 460
          : 620,

        margin: "0 auto",
      }}
    >
      {keyboardRows.map(
        (
          row,
          rowIndex
        ) => (
          <Flex
            key={rowIndex}
            justify="center"
            gap={rowGap}
            style={{
              width: "100%",
            }}
          >
            {row.map(
              (letter) => {
                const isCorrect =
                  correctLetters.has(
                    letter
                  );

                const isIncorrect =
                  incorrectLetters.has(
                    letter
                  );

                /*
                 * Disable a key after either
                 * a correct or incorrect guess.
                 */
                const isUsed =
                  isCorrect ||
                  isIncorrect;

                return (
                  <Button
                    key={letter}
                    type={
                      isUsed
                        ? "default"
                        : "primary"
                    }
                    disabled={
                      isUsed
                    }
                    onClick={() =>
                      onGuess(
                        letter
                      )
                    }
                    aria-label={
                      isIncorrect
                        ? `${letter}, incorrect guess`
                        : isCorrect
                          ? `${letter}, already guessed`
                          : `Guess ${letter}`
                    }
                    style={{
                      flex:
                        "1 1 0",

                      minWidth: 0,

                      maxWidth:
                        buttonMaxWidth,

                      height:
                        buttonHeight,

                      padding: 0,

                      borderRadius:
                        isMobile
                          ? 7
                          : 9,

                      fontSize:
                        buttonFontSize,

                      fontWeight:
                        600,

                      touchAction:
                        "manipulation",

                      ...(isUsed && {
                        background:
                          "#f5f5f5",

                        borderColor:
                          "#d9d9d9",

                        color:
                          "#bfbfbf",
                      }),
                    }}
                  >
                    {letter}
                  </Button>
                );
              }
            )}
          </Flex>
        )
      )}
    </Flex>
  );
}