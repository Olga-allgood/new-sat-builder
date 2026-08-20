"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Flex,
  Space,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import { supabase } from "@/app/lib/supabaseClient";
import { SignOut } from "@/app/lib/auth";

const { Title, Text } = Typography;

export default function Header() {
  const [user, setUser] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [failedWords, setFailedWords] = useState(0);
  const [guessedWords, setGuessedWords] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (id: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(error.message);
      return;
    }

    setUser(profile?.email ?? null);

    const {
      count: correctCount,
      error: correctError,
    } = await supabase
      .from("game_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("status", true)
      .eq("correct_guesses", true);

    if (!correctError && correctCount !== null) {
      setGuessedWords(correctCount);
    }

    const {
      count: incorrectCount,
      error: incorrectError,
    } = await supabase
      .from("game_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("status", true)
      .eq("correct_guesses", false);

    if (!incorrectError && incorrectCount !== null) {
      setFailedWords(incorrectCount);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;

      if (session) {
        setIsLoggedIn(true);
        fetchUserData(session.user.id);
      }

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        fetchUserData(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setGuessedWords(0);
        setFailedWords(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function increaseCorrectCount() {
      setGuessedWords((prev) => prev + 1);
    }

    function increaseIncorrectCount() {
      setFailedWords((prev) => prev + 1);
    }

    window.addEventListener("wordCompleted", increaseCorrectCount);
    window.addEventListener("wordFailed", increaseIncorrectCount);

    return () => {
      window.removeEventListener("wordCompleted", increaseCorrectCount);
      window.removeEventListener("wordFailed", increaseIncorrectCount);
    };
  }, []);

  async function loggingOut() {
    await SignOut();

    setIsLoggedIn(false);
    setUser(null);
    setGuessedWords(0);
    setFailedWords(0);
  }

  if (loading) {
    return null;
  }

  return (
    <header
      style={{
        borderBottom: "1px solid #f0f0f0",
        background: "#ffffff",
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={16}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px 20px",
        }}
      >
        {/* Logo / Title */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Title
            level={3}
            style={{
              margin: 0,
              color: "#2d76c0",
            }}
          >
            SAT Vocabulary Builder
          </Title>
        </Link>

        {/* Logged-in user */}
        {isLoggedIn ? (
          <Flex
            align="center"
            wrap="wrap"
            gap={12}
          >
            <Text type="secondary">
              Welcome,{" "}
              <Text strong>
                {user}
              </Text>
            </Text>

            <Space size="small">
              <Text type="success">
                <CheckCircleOutlined /> {guessedWords}
              </Text>

              <Text type="danger">
                <CloseCircleOutlined /> {failedWords}
              </Text>
            </Space>

            <Link href="/history">
              <Button icon={<HistoryOutlined />}>
                History
              </Button>
            </Link>

            <Button
              icon={<LogoutOutlined />}
              onClick={loggingOut}
            >
              Log Out
            </Button>
          </Flex>
        ) : (
          <Space wrap>
            <Link href="/login">
              <Button icon={<LoginOutlined />}>
                Log In
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
              >
                Sign Up
              </Button>
            </Link>
          </Space>
        )}
      </Flex>
    </header>
  );
}