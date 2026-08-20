"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Flex,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  CloseOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { supabase } from "@/app/lib/supabaseClient";

const { Title, Text, Paragraph } = Typography;

interface FailedWord {
  word: string;
  definition: string;
}

interface ArticlePanelProps {
  failedWords: FailedWord[];
  onClose: () => void;
}

export default function ArticlePanel({
  failedWords,
  onClose,
}: ArticlePanelProps) {
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  async function generateArticle() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          words: failedWords,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate article"
        );
      }

      setArticle(data.article);
      setHasGenerated(true);

      const { data: auth } =
        await supabase.auth.getUser();

      if (auth.user) {
        const { error: saveError } =
          await supabase
            .from("learning_articles")
            .insert({
              user_id: auth.user.id,
              article: data.article,
              failed_words: failedWords,
            });

        if (saveError) {
          console.error(
            "Could not save article:",
            saveError.message
          );
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  function renderArticle(text: string) {
    const parts = text.split(
      /(\*\*[^*]+\*\*)/g
    );

    return parts.map((part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        const word = part.slice(2, -2);

        return (
          <Text
            strong
            key={index}
            style={{
              color: "#1677ff",
            }}
          >
            {word}
          </Text>
        );
      }

      return part;
    });
  }

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
      <Space
        orientation="vertical"
        size="large"
        style={{
          width: "100%",
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          gap={12}
        >
          <Flex
            align="center"
            gap={8}
          >
            <FileTextOutlined />

            <Title
              level={4}
              style={{
                margin: 0,
              }}
            >
              Learn from Your Mistakes
            </Title>
          </Flex>

          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            aria-label="Close article panel"
          />
        </Flex>

        <div>
          <Text type="secondary">
            Words you missed ({failedWords.length})
          </Text>

          <Flex
            wrap="wrap"
            gap={8}
            style={{
              marginTop: 10,
            }}
          >
            {failedWords.map(
              (failedWord, index) => (
                <Tag
                  color="blue"
                  key={`${failedWord.word}-${index}`}
                  style={{
                    marginInlineEnd: 0,
                  }}
                >
                  {failedWord.word}
                </Tag>
              )
            )}
          </Flex>
        </div>

        {error && (
          <Alert
            type="error"
            title="Unable to generate article"
            description={error}
            showIcon
            closable={{
              onClose: () => setError(""),
            }}
          />
        )}

        {!hasGenerated && (
          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            icon={
              loading
                ? undefined
                : <FileTextOutlined />
            }
            onClick={generateArticle}
          >
            {loading
              ? "Generating Article..."
              : "Generate Learning Article"}
          </Button>
        )}

        {hasGenerated && (
          <Card
            size="small"
            style={{
              width: "100%",
            }}
            styles={{
              body: {
                padding: "20px 16px",
              },
            }}
          >
            <Space
              orientation="vertical"
              size="middle"
              style={{
                width: "100%",
              }}
            >
              <Title
                level={5}
                style={{
                  margin: 0,
                }}
              >
                Your Learning Article
              </Title>

              {loading ? (
                <Flex
                  vertical
                  align="center"
                  gap={12}
                  style={{
                    padding: "24px 0",
                  }}
                >
                  <Spin />

                  <Text type="secondary">
                    Creating a new article...
                  </Text>
                </Flex>
              ) : (
                <Paragraph
                  style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {renderArticle(article)}
                </Paragraph>
              )}

              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                disabled={loading}
                onClick={generateArticle}
              >
                Regenerate Article
              </Button>
            </Space>
          </Card>
        )}

        <Text
          type="secondary"
          style={{
            fontSize: 12,
          }}
        >
          Powered by Google Gemini AI
        </Text>
      </Space>
    </Card>
  );
}