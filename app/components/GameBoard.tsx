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
      Math.floor(Math.random() * words.length);

    const randomWord =
      words[randomNumber];

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

  useEffect(() => {
    startNewGame();
  }, []);

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
      incorrectGuesses.includes(upperLetter)
    ) {
      return;
    }

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
    } else {
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

  function speakWord(word: string) {
    const utterance =
      new SpeechSynthesisUtterance(word);

    utterance.lang = "en-US";

    window.speechSynthesis.speak(
      utterance
    );
  }

  if (!currentWord) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={16}
        style={{
          minHeight: 300,
          width: "100%",
        }}
      >
        {loading ? (
          <>
            <Spin size="large" />

            <Text type="secondary">
              Loading word...
            </Text>
          </>
        ) : (
          <>
            <Text>
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
              icon={<ReloadOutlined />}
              onClick={startNewGame}
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

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "16px",
      }}
    >
      {error && (
        <Alert
          type="error"
          title={error}
          showIcon
          closable
          style={{
            marginBottom: 16,
          }}
        />
      )}

      <Row gutter={[24, 24]}>
        <Col
          xs={24}
          lg={16}
        >
          <Space
            orientation="vertical"
            size="large"
            style={{
              width: "100%",
            }}
          >
            <WordCard
              word={currentWord.word}
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

            {!isCompleted &&
              !isFailed && (
                <Card
                  size="small"
                  style={{
                    width: "100%",
                  }}
                >
                  <Flex
                    vertical
                    align="center"
                    gap={16}
                  >
                    <Text
                      strong
                      type="secondary"
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

            {failedWords.length >= 1 &&
              !showArticle && (
                <Flex
                  justify="center"
                  style={{
                    width: "100%",
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
              failedWords.length > 0 && (
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
                    ? <CloseOutlined />
                    : <PlusOutlined />
                }
                onClick={() =>
                  setPersonalWord(
                    !personalWord
                  )
                }
              >
                {personalWord
                  ? "Close the Form"
                  : "Add Your Word"}
              </Button>
            </Flex>
          </Space>
        </Col>

        <Col
          xs={24}
          lg={8}
        >
          <Space
            orientation="vertical"
            size="middle"
            style={{
              width: "100%",
            }}
          >
            <Card>
              <Statistic
                title="Correct letters"
                value={
                  guessedLetters.size
                }
              />
            </Card>

            <Card>
              <Statistic
                title="Incorrect guesses"
                value={
                  incorrectGuesses.length
                }
                suffix={`/ ${maxIncorrectGuesses}`}
              />

              <div
                style={{
                  marginTop: 12,
                }}
              >
                <Text type="secondary">
                  Letters tried:
                </Text>

                <div
                  style={{
                    marginTop: 4,
                  }}
                >
                  <Text strong>
                    {incorrectGuesses
                      .join(", ")
                      .toUpperCase() ||
                      "None"}
                  </Text>
                </div>
              </div>
            </Card>

            {(isCompleted ||
              isFailed) && (
              <Button
                block
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

            <Button
              type="primary"
              block
              loading={loading}
              onClick={
                startNewGame
              }
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