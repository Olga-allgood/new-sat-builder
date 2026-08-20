"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
} from "antd";
import {
  LockOutlined,
  LoginOutlined,
  MailOutlined,
} from "@ant-design/icons";

import { supabase } from "@/app/lib/supabaseClient";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const { data } =
        await supabase.auth.getSession();

      if (data.session) {
        router.replace("/game");
      }
    }

    checkAuth();
  }, [router]);

  const handleLogin = async (
    values: LoginFormValues
  ) => {
    setLoading(true);
    setError("");

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

    if (loginError) {
      console.error("Login error:", {
        message: loginError.message,
        status: loginError.status,
        code: loginError.code,
        name: loginError.name,
      });

      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.replace("/game");
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 16px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 420,
        }}
        styles={{
          body: {
            padding: "32px 24px",
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
          <div
            style={{
              textAlign: "center",
            }}
          >
            <Title
              level={2}
              style={{
                marginBottom: 8,
                color: "#2d76c0",
              }}
            >
              Welcome Back
            </Title>

            <Text type="secondary">
              Log in to continue practicing SAT vocabulary.
            </Text>
          </div>

          {error && (
            <Alert
              type="error"
              title="Unable to log in"
              description={error}
              showIcon
              closable={{
                onClose: () => setError(""),
              }}
            />
          )}

          <Form
            layout="vertical"
            onFinish={handleLogin}
            requiredMark={false}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter your email.",
                },
                {
                  type: "email",
                  message:
                    "Please enter a valid email address.",
                },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter your password.",
                },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item
              style={{
                marginBottom: 12,
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                icon={<LoginOutlined />}
                loading={loading}
                block
                size="large"
              >
                Log In
              </Button>
            </Form.Item>

            <div
              style={{
                textAlign: "center",
              }}
            >
              <Text type="secondary">
                Don&apos;t have an account?{" "}
              </Text>

              <Link href="/signup">
                Sign Up
              </Link>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
}