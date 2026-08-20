"use client";

import { Button, Flex } from "antd";

type AlphabetButtonsProps = {
  guessedLetters: Set<string>;
  onGuess: (letter: string) => void;
};

const rows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export default function AlphabetButtons({
  guessedLetters,
  onGuess,
}: AlphabetButtonsProps) {
  return (
    <Flex
      vertical
      gap={8}
      align="center"
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      {rows.map((row, rowIndex) => (
        <Flex
          key={rowIndex}
          justify="center"
          gap={6}
          style={{
            width: "100%",
          }}
        >
          {row.map((letter) => {
            const guessed = guessedLetters.has(letter);

            return (
              <Button
                key={letter}
                type={guessed ? "default" : "primary"}
                disabled={guessed}
                onClick={() => onGuess(letter)}
                style={{
                  flex: "1 1 0",
                  maxWidth: 44,
                  minWidth: 0,
                  height: 44,
                  padding: 0,
                  fontWeight: 600,
                  touchAction: "manipulation",
                }}
              >
                {letter}
              </Button>
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
}