"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Grid,
  Row,
  Space,
  Spin,
  Statistic,
  Typography,
} from "antd";

import {
  AudioOutlined,
  CloseOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { supabase } from "@/app/lib/supabaseClient";
import { word_with_examples } from "@/app/types/database";

import AlphabetButtons from "./AlphabetButtons";
import ArticlePanel from "./ArticlePanel";
import CompleteDisplay from "./CompleteDisplay";
import PersonalWordForm from "./PersonalWordForm";
import WordCard from "./WordCard";

const { Text } = Typography;

interface GameBoardProps {
  userId: string;
}

interface FailedWord {
  word: string;
  definition: string;
}

export default function GameBoard({
  userId,
}: GameBoardProps) {
  const [currentWord, setCurrentWord] =
    useState<word_with_examples | null>(null);

  const [guessedLetters, setGuessedLetters] =
    useState<Set<string>>(new Set());

  const [incorrectGuesses, setIncorrectGuesses] =
    useState<string[]>([]);

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [isCompleted, setIsCompleted] =
    useState(false);

  const [isFailed, setIsFailed] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [personalWord, setPersonalWord] =
    useState(false);

  const [failedWords, setFailedWords] =
    useState<FailedWord[]>([]);

  const [showArticle, setShowArticle] =
    useState(false);

  const router = useRouter();

  const screens = Grid.useBreakpoint();

  const isMobile = !screens.md;

  /* =========================================================
     CHECK WHETHER WORD IS COMPLETE
  ========================================================= */

  function isComplete(
    word: string,
    guessed: Set<string>
  ) {
    const wordLetters =
      word.toUpperCase().split("");

    for (const letter of wordLetters) {
      if (!guessed.has(letter)) {
        return false;
      }
    }

    return true;
  }

  /* =========================================================
     START NEW GAME
  ========================================================= */

  async function startNewGame() {
    setLoading(true);
    setError("");
    setGuessedLetters(new Set());
    setIncorrectGuesses([]);
    setIsCompleted(false);
    setIsFailed(false);
    setSessionId(null);
    setCurrentWord(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      setError(
        `Authentication error: ${authError.message}`
      );

      setLoading(false);

      return;
    }

    if (!user) {
      setError(
        "You must be logged in to play."
      );

      setLoading(false);

      router.push("/login");

      return;
    }

    /* =======================================================
       CHECK PROFILE
    ======================================================= */

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(
        `Unable to check your profile: ${profileError.message}`
      );

      setLoading(false);

      return;
    }

    if (!profile) {
      setError(
        "Your profile was not found. Please make sure your account has a profile before starting a game."
      );

      setLoading(false);

      return;
    }

    /* =======================================================
       LOAD WORDS
    ======================================================= */

    const {
      data: words,
      error: wordError,
    } = await supabase
      .from("words")
      .select("*")
      .eq("is_active", true);

    if (wordError) {
      setError(
        `Could not load words: ${wordError.message}`
      );

      setLoading(false);

      return;
    }

    if (!words || words.length === 0) {
      setError(
        "No active words are available in the database."
      );

      setLoading(false);

      return;
    }

    const randomNumber =
      Math.floor(
        Math.random() * words.length
      );

    const randomWord =
      words[randomNumber];

    /* =======================================================
       LOAD EXAMPLES
    ======================================================= */

    const {
      data: examples,
      error: examplesError,
    } = await supabase
      .from("examples")
      .select(
        "id, word_id, example_standard, example_funny"
      )
      .eq("word_id", randomWord.id);

    if (examplesError) {
      setError(
        `Could not load examples: ${examplesError.message}`
      );

      setLoading(false);

      return;
    }

    setCurrentWord({
      ...randomWord,
      examples: examples || [],
    });

    /* =======================================================
       CREATE GAME SESSION
    ======================================================= */

    const {
      data: session,
      error: sessionError,
    } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        word_id: randomWord.id,
        status: false,
        correct_guesses: false,
      })
      .select()
      .single();

    if (sessionError) {
      setError(
        `Could not create game session: ${sessionError.message}`
      );

      setLoading(false);

      return;
    }

    setSessionId(session.id);

    setLoading(false);
  }

  /* =========================================================
     INITIAL GAME
  ========================================================= */

  useEffect(() => {
    startNewGame();
  }, []);

  /* =========================================================
     HANDLE LETTER GUESS
  ========================================================= */

  async function handleGuess(
    letter: string
  ) {
    if (
      isCompleted ||
      isFailed ||
      loading ||
      !currentWord
    ) {
      return;
    }

    const upperLetter =
      letter.toUpperCase();

    if (
      guessedLetters.has(upperLetter) ||
      incorrectGuesses.includes(
        upperLetter
      )
    ) {
      return;
    }

    /* =======================================================
       CORRECT GUESS
    ======================================================= */

    if (
      currentWord.word
        .toUpperCase()
        .includes(upperLetter)
    ) {
      const newGuess =
        new Set(guessedLetters);

      newGuess.add(upperLetter);

      setGuessedLetters(newGuess);

      if (
        isComplete(
          currentWord.word,
          newGuess
        )
      ) {
        setIsCompleted(true);

        if (sessionId) {
          const {
            error: updateError,
          } = await supabase
            .from("game_sessions")
            .update({
              status: true,
              correct_guesses: true,
            })
            .eq("id", sessionId);

          if (updateError) {
            setError(
              `Could not update game session: ${updateError.message}`
            );
          }
        }

        window.dispatchEvent(
          new Event("wordCompleted")
        );
      }
    }

    /* =======================================================
       INCORRECT GUESS
    ======================================================= */

    else {
      const maxGuesses =
        currentWord.word.length + 3;

      const newIncorrectGuesses = [
        ...incorrectGuesses,
        upperLetter,
      ];

      setIncorrectGuesses(
        newIncorrectGuesses
      );

      if (
        newIncorrectGuesses.length >=
        maxGuesses
      ) {
        setIsFailed(true);

        if (sessionId) {
          const {
            error: updateError,
          } = await supabase
            .from("game_sessions")
            .update({
              status: true,
              correct_guesses: false,
            })
            .eq("id", sessionId);

          if (updateError) {
            setError(
              `Could not update game session: ${updateError.message}`
            );
          }
        }

        setFailedWords((prev) => {
          const newFailed = [
            ...prev,
            {
              word: currentWord.word,
              definition:
                currentWord.meaning,
            },
          ];

          return newFailed.slice(-5);
        });

        window.dispatchEvent(
          new Event("wordFailed")
        );
      }
    }
  }

  /* =========================================================
     PHYSICAL KEYBOARD SUPPORT
  ========================================================= */

  useEffect(() => {
    function handleKeyPress(
      e: KeyboardEvent
    ) {
      const target =
        e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (!/^[a-zA-Z]$/.test(e.key)) {
        setError(
          "You need to choose a letter"
        );

        setTimeout(() => {
          setError("");
        }, 2000);

        return;
      }

      handleGuess(e.key);
    }

    window.addEventListener(
      "keypress",
      handleKeyPress
    );

    return () => {
      window.removeEventListener(
        "keypress",
        handleKeyPress
      );
    };
  }, [
    currentWord,
    isFailed,
    isCompleted,
    incorrectGuesses,
    sessionId,
    guessedLetters,
    loading,
  ]);

  /* =========================================================
     TEXT TO SPEECH
  ========================================================= */

  function speakWord(word: string) {
    const utterance =
      new SpeechSynthesisUtterance(
        word
      );

    utterance.lang = "en-US";

    window.speechSynthesis.speak(
      utterance
    );
  }

  /* =========================================================
     LOADING / EMPTY STATE
  ========================================================= */

  if (!currentWord) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={16}
        style={{
          minHeight: 400,
          width: "100%",
        }}
      >
        {loading ? (
          <>
            <Spin size="large" />

            <Text
              type="secondary"
              style={{
                fontSize: 16,
              }}
            >
              Loading word...
            </Text>
          </>
        ) : (
          <>
            <Text
              style={{
                fontSize: 16,
              }}
            >
              No words to guess.
            </Text>

            {error && (
              <Alert
                type="error"
                title={error}
                showIcon
              />
            )}

            <Button
              type="primary"
              size="large"
              icon={
                <ReloadOutlined />
              }
              onClick={
                startNewGame
              }
            >
              Try Again
            </Button>
          </>
        )}
      </Flex>
    );
  }

  const maxIncorrectGuesses =
    currentWord.word.length + 3;

  /* =========================================================
     MAIN GAME
  ========================================================= */

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1080,
        margin: "0 auto",

        padding: isMobile
          ? "16px 14px 32px"
          : "28px 24px 48px",
      }}
    >
      {/* ERROR */}

      {error && (
        <Alert
          type="error"
          title={error}
          showIcon
          closable
          style={{
            marginBottom: 22,
          }}
        />
      )}

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <Row
        gutter={
          isMobile
            ? [16, 24]
            : [32, 32]
        }
        align="top"
      >
        {/* ===================================================
            GAME AREA
        =================================================== */}

        <Col
          xs={24}
          lg={17}
        >
          <Space
            orientation="vertical"
            size={
              isMobile
                ? "middle"
                : "large"
            }
            style={{
              width: "100%",
            }}
          >
            {/* WORD */}

            <WordCard
              word={
                currentWord.word
              }
              guessedLetters={
                isFailed
                  ? new Set(
                      currentWord.word
                        .toUpperCase()
                        .split("")
                    )
                  : guessedLetters
              }
              meaning={
                currentWord.meaning
              }
            />

            {/* =================================================
                KEYBOARD
            ================================================= */}

            {!isCompleted &&
              !isFailed && (
                <Card
                  style={{
                    width: "100%",
                    borderRadius: 14,
                  }}
                  styles={{
                    body: {
                      padding: isMobile
                        ? "18px 12px"
                        : "24px 20px",
                    },
                  }}
                >
                  <Flex
                    vertical
                    align="center"
                    gap={
                      isMobile
                        ? 14
                        : 20
                    }
                  >
                    <Text
                      strong
                      style={{
                        fontSize:
                          isMobile
                            ? 15
                            : 17,

                        color:
                          "#4b5563",
                      }}
                    >
                      Use keyboard below
                    </Text>

                    <AlphabetButtons
                      guessedLetters={
                        guessedLetters
                      }
                      incorrectGuesses={
                        incorrectGuesses
                      }
                      onGuess={
                        handleGuess
                      }
                    />
                  </Flex>
                </Card>
              )}

            {/* =================================================
                COMPLETE / FAILED
            ================================================= */}

            {(isCompleted ||
              isFailed) && (
              <CompleteDisplay
                word={
                  currentWord.word
                }
                meaning={
                  currentWord.meaning
                }
                examples={
                  currentWord.examples
                }
                failed={
                  isFailed
                }
              />
            )}

            {/* =================================================
                ARTICLE GENERATOR
            ================================================= */}

            {failedWords.length >=
              1 &&
              !showArticle && (
                <Flex
                  justify="center"
                  style={{
                    width: "100%",
                    paddingTop: 4,
                  }}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={
                      <FileTextOutlined />
                    }
                    onClick={() =>
                      setShowArticle(
                        true
                      )
                    }
                    style={{
                      minWidth: 220,
                      height: 48,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    Generate Article
                  </Button>
                </Flex>
              )}

            {showArticle &&
              failedWords.length >
                0 && (
                <ArticlePanel
                  failedWords={
                    failedWords
                  }
                  onClose={() =>
                    setShowArticle(
                      false
                    )
                  }
                />
              )}

            <Divider />

            {/* =================================================
                PERSONAL WORD
            ================================================= */}

            {personalWord && (
              <PersonalWordForm
                userProfile={
                  userId
                }
              />
            )}

            <Flex justify="center">
              <Button
                type="text"
                icon={
                  personalWord
                    ? (
                      <CloseOutlined />
                    )
                    : (
                      <PlusOutlined />
                    )
                }
                onClick={() =>
                  setPersonalWord(
                    !personalWord
                  )
                }
                style={{
                  fontSize: 15,
                }}
              >
                {personalWord
                  ? "Close the Form"
                  : "Add Your Word"}
              </Button>
            </Flex>
          </Space>
        </Col>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <Col
          xs={24}
          lg={7}
        >
          <Space
            orientation="vertical"
            size="middle"
            style={{
              width: "100%",
            }}
          >
            {/* CORRECT LETTERS */}

            <Card
              style={{
                borderRadius: 14,
              }}
              styles={{
                body: {
                  padding:
                    isMobile
                      ? 18
                      : 22,
                },
              }}
            >
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: 15,
                    }}
                  >
                    Correct letters
                  </span>
                }
                value={
                  guessedLetters.size
                }
                styles={{
                  content: {
                    fontSize:
                      isMobile
                        ? 25
                        : 30,

                    fontWeight: 600,
                  },
                }}
              />
            </Card>

            {/* INCORRECT GUESSES */}

            <Card
              style={{
                borderRadius: 14,
              }}
              styles={{
                body: {
                  padding:
                    isMobile
                      ? 18
                      : 22,
                },
              }}
            >
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: 15,
                    }}
                  >
                    Incorrect guesses
                  </span>
                }
                value={
                  incorrectGuesses.length
                }
                suffix={`/ ${maxIncorrectGuesses}`}
                styles={{
                  content: {
                    fontSize:
                      isMobile
                        ? 25
                        : 30,

                    fontWeight: 600,
                  },
                }}
              />

              <div
                style={{
                  marginTop: 18,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 14,
                  }}
                >
                  Letters tried:
                </Text>

                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                    }}
                  >
                    {incorrectGuesses
                      .join(", ")
                      .toUpperCase() ||
                      "None"}
                  </Text>
                </div>
              </div>
            </Card>

            {/* =================================================
                HEAR WORD
            ================================================= */}

            {(isCompleted ||
              isFailed) && (
              <Button
                block
                size="large"
                icon={
                  <AudioOutlined />
                }
                onClick={() =>
                  speakWord(
                    currentWord.word
                  )
                }
              >
                Hear Word
              </Button>
            )}

            {/* =================================================
                NEXT WORD
            ================================================= */}

            <Button
              type="primary"
              block
              size="large"
              loading={
                loading
              }
              onClick={
                startNewGame
              }
              style={{
                minHeight: 44,
                fontWeight: 600,
              }}
            >
              {isCompleted ||
              isFailed
                ? "Start a New Game"
                : "Next Word"}
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}