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
  MailOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import { supabase } from "@/app/lib/supabaseClient";

const { Title, Text, Paragraph } = Typography;

interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
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

  const handleSignup = async (
    values: SignupFormValues
  ) => {
    setLoading(true);
    setError("");

    const email = values.email.trim();

    // 1. Create Supabase auth user
    const {
      data,
      error: signupError,
    } = await supabase.auth.signUp({
      email,
      password: values.password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError(
        "Account could not be created. Please try again."
      );
      setLoading(false);
      return;
    }

    // 2. Create matching public.profiles row
    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        email: data.user.email,
      });

    if (profileError) {
      console.error(
        "Profile creation error:",
        profileError
      );

      setError(
        `Your account was created, but your profile could not be created: ${profileError.message}`
      );

      setLoading(false);
      return;
    }

    // 3. Email verification is disabled,
    // so the user should already have a session.
    if (data.session) {
      router.replace("/game");
      return;
    }

    // Fallback in case Supabase doesn't return a session
    setError(
      "Your account was created, but a session was not started automatically."
    );

    setLoading(false);
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
              Create Your Account
            </Title>

            <Paragraph
              type="secondary"
              style={{
                marginBottom: 0,
              }}
            >
              Create an account to practice SAT
              vocabulary and track your progress.
            </Paragraph>
          </div>

          {error && (
            <Alert
              type="error"
              title="Unable to create account"
              description={error}
              showIcon
              closable
              onClose={() => setError("")}
            />
          )}

          <Form
            layout="vertical"
            onFinish={handleSignup}
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
                    "Please enter a password.",
                },
                {
                  min: 6,
                  message:
                    "Password must be at least 6 characters.",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message:
                    "Please confirm your password.",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      !value ||
                      getFieldValue("password") ===
                        value
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "The passwords do not match."
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Confirm password"
                autoComplete="new-password"
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
                icon={<UserAddOutlined />}
                loading={loading}
                block
                size="large"
              >
                Create Account
              </Button>
            </Form.Item>

            <div
              style={{
                textAlign: "center",
              }}
            >
              <Text type="secondary">
                Already have an account?{" "}
              </Text>

              <Link href="/login">
                Log In
              </Link>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
}