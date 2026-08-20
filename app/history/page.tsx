"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Card,
  Flex,
  Space,
  Spin,
  Statistic,
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

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // Correct guesses
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

      // Incorrect guesses
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

      // Personal words
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

      // Learning articles
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
          router.push("/login");
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
          showIcon
          message="Unable to load history"
          description={error}
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

        {/* SUMMARY */}

        <Flex
          wrap="wrap"
          gap={12}
        >
          <Card
            style={{
              flex: "1 1 180px",
            }}
          >
            <Statistic
              title="Correct"
              value={correctGuesses.length}
              prefix={
                <CheckCircleOutlined />
              }
            />
          </Card>

          <Card
            style={{
              flex: "1 1 180px",
            }}
          >
            <Statistic
              title="Incorrect"
              value={incorrectGuesses.length}
              prefix={
                <CloseCircleOutlined />
              }
            />
          </Card>

          <Card
            style={{
              flex: "1 1 180px",
            }}
          >
            <Statistic
              title="My Words"
              value={myWords.length}
              prefix={<BookOutlined />}
            />
          </Card>

          <Card
            style={{
              flex: "1 1 180px",
            }}
          >
            <Statistic
              title="Learning Articles"
              value={articles.length}
              prefix={
                <FileTextOutlined />
              }
            />
          </Card>
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

              <span>
                Correct Guesses
              </span>

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
              size="small"
              style={{
                width: "100%",
              }}
            >
              {correctGuesses.map(
                (item) => (
                  <Card
                    key={item.id}
                    size="small"
                  >
                    <Text strong>
                      {item.words?.word}
                    </Text>

                    <Paragraph
                      type="secondary"
                      style={{
                        marginTop: 4,
                        marginBottom: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.words?.meaning}
                    </Paragraph>
                  </Card>
                )
              )}
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

              <span>
                Incorrect Guesses
              </span>

              <Tag color="red">
                {
                  incorrectGuesses.length
                }
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
              size="small"
              style={{
                width: "100%",
              }}
            >
              {incorrectGuesses.map(
                (item) => (
                  <Card
                    key={item.id}
                    size="small"
                  >
                    <Text strong>
                      {item.words?.word}
                    </Text>

                    <Paragraph
                      type="secondary"
                      style={{
                        marginTop: 4,
                        marginBottom: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.words?.meaning}
                    </Paragraph>
                  </Card>
                )
              )}
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

              <span>
                My Words
              </span>

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
              size="small"
              style={{
                width: "100%",
              }}
            >
              {myWords.map((word) => (
                <Card
                  key={word.id}
                  size="small"
                >
                  <Space
                    orientation="vertical"
                    size="small"
                    style={{
                      width: "100%",
                    }}
                  >
                    <div>
                      <Text strong>
                        {word.word}
                      </Text>

                      <Text>
                        {" "}
                        — {word.meaning}
                      </Text>
                    </div>

                    {word.examples
                      ?.filter(
                        (example) =>
                          example.example_standard
                      )
                      .map(
                        (
                          example,
                          index
                        ) => (
                          <Paragraph
                            key={index}
                            type="secondary"
                            style={{
                              margin: 0,
                              paddingLeft: 12,
                              lineHeight: 1.6,
                            }}
                          >
                            Example:{" "}
                            {
                              example.example_standard
                            }
                          </Paragraph>
                        )
                      )}
                  </Space>
                </Card>
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
              size="middle"
              style={{
                width: "100%",
              }}
            >
              {articles.map(
                (article) => (
                  <Card
                    key={article.id}
                    size="small"
                  >
                    <Space
                      orientation="vertical"
                      size="middle"
                      style={{
                        width: "100%",
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                        }}
                      >
                        {article.created_at
                          ? new Date(
                              article.created_at
                            ).toLocaleString()
                          : "Unknown date"}
                      </Text>

                      <Paragraph
                        style={{
                          margin: 0,
                          whiteSpace:
                            "pre-wrap",
                          lineHeight: 1.7,
                          overflowWrap:
                            "anywhere",
                        }}
                      >
                        {article.article}
                      </Paragraph>

                      {article.failed_words &&
                        article.failed_words
                          .length > 0 && (
                          <Flex
                            wrap="wrap"
                            gap={6}
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
                    </Space>
                  </Card>
                )
              )}
            </Space>
          )}
        </Card>
      </Space>
    </div>
  );
}