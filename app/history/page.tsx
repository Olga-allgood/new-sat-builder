"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Card,
  Flex,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import { supabase } from "@/app/lib/supabaseClient";

const { Title, Text, Paragraph } = Typography;

interface Example {
  example_standard: string;
  example_funny: string | null;
}

interface HistoryWord {
  id: string;
  word: string;
  meaning: string;
  is_public: boolean | null;
  is_active: boolean | null;
  user_id: string | null;
  examples: Example[] | null;
}

interface GameWord {
  word: string;
  meaning: string;
}

interface GameHistory {
  id: string;
  word_id: string;
  status: boolean | null;
  correct_guesses: boolean | null;
  words: GameWord | null;
}

interface FailedWord {
  word: string;
}

interface LearningArticle {
  id: string;
  user_id: string | null;
  article: string;
  failed_words: FailedWord[] | null;
  created_at: string | null;
}

export default function HistoryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [correctGuesses, setCorrectGuesses] =
    useState<GameHistory[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] =
    useState<GameHistory[]>([]);
  const [myWords, setMyWords] =
    useState<HistoryWord[]>([]);
  const [articles, setArticles] =
    useState<LearningArticle[]>([]);
  const [error, setError] = useState("");

  const historyItemStyle = {
    background: "#e6f4ff",
    border: "1px solid #91caff",
    borderRadius: 10,
    padding: "16px",
  };

  const wordStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#0958d9",
  };

  const definitionStyle = {
    marginTop: 6,
    marginBottom: 0,
    fontSize: 17,
    lineHeight: 1.7,
    color: "#1f1f1f",
  };

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      const {
        data: completedWords,
        error: completedWordsError,
      } = await supabase
        .from("game_sessions")
        .select(`
          id,
          word_id,
          status,
          correct_guesses,
          words!game_sessions_word_id_fkey(
            word,
            meaning
          )
        `)
        .eq("user_id", userId)
        .eq("status", true)
        .eq("correct_guesses", true)
        .returns<GameHistory[]>();

      if (completedWordsError) {
        setError(completedWordsError.message);
      } else {
        setCorrectGuesses(completedWords ?? []);
      }

      const {
        data: incompleteWords,
        error: incompleteWordsError,
      } = await supabase
        .from("game_sessions")
        .select(`
          id,
          word_id,
          status,
          correct_guesses,
          words!game_sessions_word_id_fkey(
            word,
            meaning
          )
        `)
        .eq("user_id", userId)
        .eq("status", true)
        .eq("correct_guesses", false)
        .returns<GameHistory[]>();

      if (incompleteWordsError) {
        setError(incompleteWordsError.message);
      } else {
        setIncorrectGuesses(incompleteWords ?? []);
      }

      const {
        data: wordsData,
        error: wordsError,
      } = await supabase
        .from("words")
        .select(`
          id,
          word,
          meaning,
          is_public,
          is_active,
          user_id,
          examples!examples_word_id_fkey(
            example_standard,
            example_funny
          )
        `)
        .eq("user_id", userId)
        .eq("is_public", false)
        .order("word");

      if (wordsError) {
        setError(wordsError.message);
      } else {
        setMyWords(wordsData ?? []);
      }

      const {
        data: articlesData,
        error: articlesError,
      } = await supabase
        .from("learning_articles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        });

      if (articlesError) {
        setError(articlesError.message);
      } else {
        setArticles(articlesData ?? []);
      }

      setLoading(false);
    }

    fetchHistory();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace("/login");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (error) {
    return (
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: 16,
        }}
      >
        <Alert
          type="error"
          title="Unable to load history"
          description={error}
          showIcon
        />
      </div>
    );
  }

  if (loading) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={12}
        style={{
          minHeight: 300,
        }}
      >
        <Spin size="large" />

        <Text type="secondary">
          Loading history...
        </Text>
      </Flex>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1000,
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      <Space
        orientation="vertical"
        size="large"
        style={{
          width: "100%",
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            margin: 0,
            color: "#2d76c0",
          }}
        >
          Game History
        </Title>

        {/* SIMPLE SUMMARY COUNTS */}

        <Flex
          wrap="wrap"
          justify="center"
          gap={24}
          style={{
            padding: "8px 0",
          }}
        >
          <Text
            style={{
              fontSize: 16,
            }}
          >
            <CheckCircleOutlined /> Correct:{" "}
            <Text strong>
              {correctGuesses.length}
            </Text>
          </Text>

          <Text
            style={{
              fontSize: 16,
            }}
          >
            <CloseCircleOutlined /> Incorrect:{" "}
            <Text strong>
              {incorrectGuesses.length}
            </Text>
          </Text>

          <Text
            style={{
              fontSize: 16,
            }}
          >
            <BookOutlined /> My Words:{" "}
            <Text strong>
              {myWords.length}
            </Text>
          </Text>

          <Text
            style={{
              fontSize: 16,
            }}
          >
            <FileTextOutlined /> Learning Articles:{" "}
            <Text strong>
              {articles.length}
            </Text>
          </Text>
        </Flex>

        {/* CORRECT GUESSES */}

        <Card
          title={
            <Flex
              align="center"
              gap={8}
              wrap="wrap"
            >
              <CheckCircleOutlined />
              <span>Correct Guesses</span>

              <Tag color="green">
                {correctGuesses.length}
              </Tag>
            </Flex>
          }
        >
          {correctGuesses.length === 0 ? (
            <Text type="secondary">
              No correct guesses yet.
            </Text>
          ) : (
            <Space
              orientation="vertical"
              size="middle"
              style={{
                width: "100%",
              }}
            >
              {correctGuesses.map((item) => (
                <div
                  key={item.id}
                  style={historyItemStyle}
                >
                  <Text style={wordStyle}>
                    {item.words?.word}
                  </Text>

                  <Paragraph
                    style={definitionStyle}
                  >
                    {item.words?.meaning}
                  </Paragraph>
                </div>
              ))}
            </Space>
          )}
        </Card>

        {/* INCORRECT GUESSES */}

        <Card
          title={
            <Flex
              align="center"
              gap={8}
              wrap="wrap"
            >
              <CloseCircleOutlined />
              <span>Incorrect Guesses</span>

              <Tag color="red">
                {incorrectGuesses.length}
              </Tag>
            </Flex>
          }
        >
          {incorrectGuesses.length === 0 ? (
            <Text type="secondary">
              No incorrect guesses yet.
            </Text>
          ) : (
            <Space
              orientation="vertical"
              size="middle"
              style={{
                width: "100%",
              }}
            >
              {incorrectGuesses.map((item) => (
                <div
                  key={item.id}
                  style={historyItemStyle}
                >
                  <Text style={wordStyle}>
                    {item.words?.word}
                  </Text>

                  <Paragraph
                    style={definitionStyle}
                  >
                    {item.words?.meaning}
                  </Paragraph>
                </div>
              ))}
            </Space>
          )}
        </Card>

        {/* MY WORDS */}

        <Card
          title={
            <Flex
              align="center"
              gap={8}
              wrap="wrap"
            >
              <BookOutlined />
              <span>My Words</span>

              <Tag>
                {myWords.length}
              </Tag>
            </Flex>
          }
        >
          {myWords.length === 0 ? (
            <Text type="secondary">
              No personal words available.
            </Text>
          ) : (
            <Space
              orientation="vertical"
              size="middle"
              style={{
                width: "100%",
              }}
            >
              {myWords.map((word) => (
                <div
                  key={word.id}
                  style={historyItemStyle}
                >
                  <Text style={wordStyle}>
                    {word.word}
                  </Text>

                  <Paragraph
                    style={definitionStyle}
                  >
                    {word.meaning}
                  </Paragraph>

                  {word.examples
                    ?.filter(
                      (example) =>
                        example.example_standard
                    )
                    .map(
                      (example, index) => (
                        <div
                          key={index}
                          style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop:
                              "1px solid #91caff",
                          }}
                        >
                          <Text
                            strong
                            style={{
                              fontSize: 16,
                              color: "#0958d9",
                            }}
                          >
                            Example
                          </Text>

                          <Paragraph
                            style={{
                              ...definitionStyle,
                              fontSize: 16,
                            }}
                          >
                            {
                              example.example_standard
                            }
                          </Paragraph>
                        </div>
                      )
                    )}
                </div>
              ))}
            </Space>
          )}
        </Card>

        {/* LEARNING ARTICLES */}

        <Card
          title={
            <Flex
              align="center"
              gap={8}
              wrap="wrap"
            >
              <FileTextOutlined />
              <span>
                Learning Articles
              </span>

              <Tag color="blue">
                {articles.length}
              </Tag>
            </Flex>
          }
        >
          {articles.length === 0 ? (
            <Text type="secondary">
              No learning articles yet.
            </Text>
          ) : (
            <Space
              orientation="vertical"
              size="large"
              style={{
                width: "100%",
              }}
            >
              {articles.map((article) => (
                <div
                  key={article.id}
                  style={historyItemStyle}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: "#0958d9",
                    }}
                  >
                    Learning Article
                  </Text>

                  <div
                    style={{
                      marginTop: 4,
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                      }}
                    >
                      {article.created_at
                        ? new Date(
                            article.created_at
                          ).toLocaleString()
                        : "Unknown date"}
                    </Text>
                  </div>

                  <Paragraph
                    style={{
                      marginTop: 12,
                      marginBottom: 0,
                      fontSize: 17,
                      lineHeight: 1.75,
                      color: "#1f1f1f",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {article.article}
                  </Paragraph>

                  {article.failed_words &&
                    article.failed_words.length >
                      0 && (
                      <Flex
                        wrap="wrap"
                        gap={6}
                        style={{
                          marginTop: 14,
                        }}
                      >
                        {article.failed_words.map(
                          (
                            failedWord,
                            index
                          ) => (
                            <Tag
                              color="blue"
                              key={`${failedWord.word}-${index}`}
                              style={{
                                marginInlineEnd: 0,
                                fontSize: 14,
                              }}
                            >
                              {
                                failedWord.word
                              }
                            </Tag>
                          )
                        )}
                      </Flex>
                    )}
                </div>
              ))}
            </Space>
          )}
        </Card>
      </Space>
    </div>
  );
}