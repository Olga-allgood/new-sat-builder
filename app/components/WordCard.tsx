"use client";

import { Card, Flex, Typography } from "antd";

const { Paragraph } = Typography;

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
    <Card
      style={{
        width: "100%",
      }}
      styles={{
        body: {
          padding: "24px 16px",
        },
      }}
    >
      <Flex
        vertical
        align="center"
        gap={24}
        style={{
          width: "100%",
        }}
      >
        {/* WORD LETTERS */}
        <Flex
          justify="center"
          wrap="wrap"
          gap={8}
          style={{
            width: "100%",
          }}
        >
          {word.split("").map((letter, index) => {
            const isGuessed = guessedLetters.has(
              letter.toUpperCase()
            );

            return (
              <div
                key={index}
                style={{
                  width: "clamp(28px, 8vw, 48px)",
                  height: "clamp(44px, 12vw, 64px)",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  borderBottom: isGuessed
                    ? "4px solid #1677ff"
                    : "4px solid #d9d9d9",

                  fontFamily: "monospace",
                  fontSize: "clamp(28px, 8vw, 48px)",
                  fontWeight: 700,

                  color: isGuessed
                    ? "#1677ff"
                    : "#bfbfbf",
                }}
              >
                {isGuessed
                  ? letter.toUpperCase()
                  : ""}
              </div>
            );
          })}
        </Flex>

        {/* DEFINITION */}
        <Paragraph
          strong
          style={{
            margin: 0,
            maxWidth: 700,
            textAlign: "center",
            fontSize: "clamp(16px, 4vw, 20px)",
            lineHeight: 1.5,
          }}
        >
          {meaning}
        </Paragraph>
      </Flex>
    </Card>
  );
}