"use client";

import {
  Card,
  Flex,
  Grid,
  Typography,
} from "antd";

const {
  Paragraph,
  Text,
} = Typography;

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
  const screens = Grid.useBreakpoint();

  const isMobile = !screens.md;

  const letterWidth = isMobile
    ? 34
    : 52;

  const letterHeight = isMobile
    ? 50
    : 68;

  const letterFontSize = isMobile
    ? 30
    : 44;

  return (
    <Card
      style={{
        width: "100%",
        borderRadius: 16,
        border: "1px solid #e8e8e8",
      }}
      styles={{
        body: {
          padding: isMobile
            ? "24px 16px"
            : "36px 28px",
        },
      }}
    >
      <Flex
        vertical
        align="center"
        gap={isMobile ? 24 : 32}
        style={{
          width: "100%",
        }}
      >
        {/* ===============================================
            WORD
        =============================================== */}

        <div
          style={{
            width: "100%",
          }}
        >
          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",

              fontSize: isMobile
                ? 13
                : 14,

              fontWeight: 600,

              textTransform: "uppercase",
              letterSpacing: "0.8px",

              marginBottom: isMobile
                ? 14
                : 18,
            }}
          >
            Guess the word
          </Text>

          <Flex
            justify="center"
            wrap="wrap"
            gap={isMobile ? 6 : 10}
            style={{
              width: "100%",
            }}
          >
            {word
              .split("")
              .map(
                (
                  letter,
                  index
                ) => {
                  const isGuessed =
                    guessedLetters.has(
                      letter.toUpperCase()
                    );

                  return (
                    <div
                      key={index}
                      style={{
                        width:
                          letterWidth,

                        height:
                          letterHeight,

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        borderBottom:
                          isGuessed
                            ? "4px solid #1677ff"
                            : "4px solid #d9d9d9",

                        fontFamily:
                          "monospace",

                        fontSize:
                          letterFontSize,

                        fontWeight:
                          700,

                        lineHeight: 1,

                        color:
                          isGuessed
                            ? "#1677ff"
                            : "#bfbfbf",
                      }}
                    >
                      {isGuessed
                        ? letter.toUpperCase()
                        : ""}
                    </div>
                  );
                }
              )}
          </Flex>
        </div>

        {/* ===============================================
            DEFINITION
        =============================================== */}

        <div
          style={{
            width: "100%",
            maxWidth: 720,

            paddingTop: isMobile
              ? 4
              : 8,

            textAlign: "center",
          }}
        >
          <Text
            type="secondary"
            style={{
              display: "block",

              fontSize: isMobile
                ? 13
                : 14,

              fontWeight: 600,

              textTransform: "uppercase",
              letterSpacing: "0.8px",

              marginBottom: 8,
            }}
          >
            Definition
          </Text>

          <Paragraph
            strong
            style={{
              margin: 0,

              fontSize: isMobile
                ? 17
                : 21,

              lineHeight: 1.6,

              color: "#262626",
            }}
          >
            {meaning}
          </Paragraph>
        </div>
      </Flex>
    </Card>
  );
}