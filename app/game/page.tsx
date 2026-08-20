"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Flex,
  Spin,
  Typography,
} from "antd";

import { supabase } from "@/app/lib/supabaseClient";
import GameBoard from "@/app/components/GameBoard";

const { Text } = Typography;

export default function GamePage() {
  const router = useRouter();

  const [userId, setUserId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(
          "Unable to verify your session."
        );
        setLoading(false);
        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUserId(null);
          router.replace("/login");
          return;
        }

        setUserId(session.user.id);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
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
          padding: 16,
        }}
      >
        <Spin size="large" />

        <Text type="secondary">
          Loading your game...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        <Alert
          type="error"
          showIcon
          message="Unable to load game"
          description={error}
        />
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <main
      style={{
        width: "100%",
        minHeight: "calc(100vh - 80px)",
        padding: "16px 0 32px",
      }}
    >
      <GameBoard userId={userId} />
    </main>
  );
}