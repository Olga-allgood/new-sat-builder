"use client";

import {
  Alert,
  Card,
  Flex,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SmileOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface Example {
  id?: string;
  word_id?: string;
  example_standard?: string | null;
  example_funny?: string | null;
}

interface CompleteDisplayProps {
  word: string;
  meaning: string;
  examples: Example[];
  failed?: boolean;
}

export default function CompleteDisplay({
  word,
  meaning,
  examples,
  failed = false,
}: CompleteDisplayProps) {
  const standardExamples = examples.filter(
    (example) => example.example_standard
  );

  const funnyExamples = examples.filter(
    (example) => example.example_funny
  );

  const learningBoxStyle = {
    background: "#e6f4ff",
    border: "1px solid #91caff",
    borderRadius: 10,
    padding: "16px",
  };

  const labelStyle = {
    fontSize: 17,
    fontWeight: 700,
    color: "#0958d9",
  };

  const contentStyle = {
    marginTop: 8,
    marginBottom: 0,
    fontSize: 17,
    lineHeight: 1.7,
    color: "#1f1f1f",
  };

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
        {/* SUCCESS / FAILURE */}

        <Alert
          type={failed ? "error" : "success"}
          showIcon
          icon={
            failed ? (
              <CloseCircleOutlined />
            ) : (
              <CheckCircleOutlined />
            )
          }
          title={
            failed
              ? "Word revealed"
              : "Great job!"
          }
          description={
            failed
              ? "You reached the maximum number of incorrect guesses."
              : "You successfully guessed the word."
          }
        />

        {/* WORD */}

        <Flex
          vertical
          align="center"
          gap={8}
        >
          <Title
            level={2}
            style={{
              margin: 0,
              textAlign: "center",
              textTransform: "uppercase",
              wordBreak: "break-word",
              fontSize: "clamp(28px, 7vw, 38px)",
              color: failed
                ? "#cf1322"
                : "#389e0d",
            }}
          >
            {word}
          </Title>

          <Tag
            color={
              failed ? "red" : "green"
            }
          >
            {failed
              ? "Keep practicing"
              : "Completed"}
          </Tag>
        </Flex>

        {/* MEANING */}

        <div style={learningBoxStyle}>
          <Flex
            align="center"
            gap={8}
          >
            <BookOutlined
              style={{
                color: "#1677ff",
                fontSize: 18,
              }}
            />

            <Text style={labelStyle}>
              Meaning
            </Text>
          </Flex>

          <Paragraph
            style={contentStyle}
          >
            {meaning}
          </Paragraph>
        </div>

        {/* STANDARD EXAMPLES */}

        {standardExamples.length > 0 && (
          <div style={learningBoxStyle}>
            <Flex
              align="center"
              gap={8}
            >
              <CheckCircleOutlined
                style={{
                  color: "#1677ff",
                  fontSize: 18,
                }}
              />

              <Text style={labelStyle}>
                Example
                {standardExamples.length > 1
                  ? "s"
                  : ""}
              </Text>
            </Flex>

            <Space
              orientation="vertical"
              size="middle"
              style={{
                width: "100%",
                marginTop: 10,
              }}
            >
              {standardExamples.map(
                (example, index) => (
                  <Paragraph
                    key={
                      example.id ??
                      `standard-${index}`
                    }
                    style={{
                      ...contentStyle,
                      marginTop: 0,
                    }}
                  >
                    {
                      example.example_standard
                    }
                  </Paragraph>
                )
              )}
            </Space>
          </div>
        )}

        {/* FUN EXAMPLES */}

        {funnyExamples.length > 0 && (
          <div style={learningBoxStyle}>
            <Flex
              align="center"
              gap={8}
            >
              <SmileOutlined
                style={{
                  color: "#1677ff",
                  fontSize: 18,
                }}
              />

              <Text style={labelStyle}>
                Fun Example
                {funnyExamples.length > 1
                  ? "s"
                  : ""}
              </Text>
            </Flex>

            <Space
              orientation="vertical"
              size="middle"
              style={{
                width: "100%",
                marginTop: 10,
              }}
            >
              {funnyExamples.map(
                (example, index) => (
                  <Paragraph
                    key={
                      example.id ??
                      `funny-${index}`
                    }
                    style={{
                      ...contentStyle,
                      marginTop: 0,
                    }}
                  >
                    {
                      example.example_funny
                    }
                  </Paragraph>
                )
              )}
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
}