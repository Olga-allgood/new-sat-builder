"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Col,
  Flex,
  Row,
  Spin,
  Typography,
} from "antd";
import {
  LoginOutlined,
  RocketOutlined,
} from "@ant-design/icons";

import { supabase } from "@/app/lib/supabaseClient";

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function authenticate() {
      const { data } =
        await supabase.auth.getSession();

      if (data.session) {
        router.replace("/game");
        return;
      }

      setLoading(false);
    }

    authenticate();
  }, [router]);

  if (loading) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={12}
        style={{
          minHeight: "70vh",
        }}
      >
        <Spin size="large" />

        <Text type="secondary">
          Loading...
        </Text>
      </Flex>
    );
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <Row
          gutter={[32, 32]}
          align="middle"
        >
          {/* IMAGE */}

          <Col
            xs={24}
            md={11}
          >
            <Card
              styles={{
                body: {
                  padding: 0,
                },
              }}
              style={{
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4 / 3",
                }}
              >
                <Image
                  src="/images/student.png"
                  alt="Student practicing vocabulary"
                  fill
                  priority
                  sizes="
                    (max-width: 768px) 100vw,
                    45vw
                  "
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
            </Card>
          </Col>

          {/* CONTENT */}

          <Col
            xs={24}
            md={13}
          >
            <Flex
              vertical
              gap={20}
              align="flex-start"
            >
              <Title
                level={1}
                style={{
                  margin: 0,
                  color: "#2d76c0",
                  fontSize:
                    "clamp(32px, 6vw, 52px)",
                  lineHeight: 1.1,
                }}
              >
                Build SAT Vocabulary
                with Confidence
              </Title>

              <Paragraph
                style={{
                  margin: 0,
                  maxWidth: 600,
                  fontSize:
                    "clamp(16px, 3vw, 20px)",
                  lineHeight: 1.7,
                }}
              >
                Practice academic vocabulary
                through an interactive word
                game, track your progress, and
                learn from missed words with
                personalized AI-generated
                reading passages.
              </Paragraph>

              <Flex
                wrap="wrap"
                gap={12}
                style={{
                  width: "100%",
                }}
              >
                <Link href="/signup">
                  <Button
                    type="primary"
                    size="large"
                    icon={<RocketOutlined />}
                  >
                    Get Started
                  </Button>
                </Link>

                <Link href="/login">
                  <Button
                    size="large"
                    icon={<LoginOutlined />}
                  >
                    Log In
                  </Button>
                </Link>
              </Flex>
            </Flex>
          </Col>
        </Row>
      </div>
    </main>
  );
}