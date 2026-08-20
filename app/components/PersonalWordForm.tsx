"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { supabase } from "@/app/lib/supabaseClient";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface PersonalWordFormProps {
  userProfile: string;
}

interface FormValues {
  word: string;
  meaning: string;
}

export default function PersonalWordForm({
  userProfile,
}: PersonalWordFormProps) {
  const [form] = Form.useForm<FormValues>();

  const [successMessage, setSuccessMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    values: FormValues
  ) => {
    setError("");
    setSuccessMessage("");
    setLoading(true);

    const word = values.word.trim();
    const meaning = values.meaning.trim();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError(
        "You must be logged in to add a word."
      );
      setLoading(false);
      return;
    }

    const {
      data: wordData,
      error: wordError,
    } = await supabase
      .from("words")
      .insert({
        word,
        meaning,
        user_id: user.id,
        is_public: false,
        is_active: true,
      })
      .select()
      .single();

    if (wordError || !wordData) {
      console.error(
        "Word insert error:",
        wordError
      );

      setError(
        wordError?.message ||
          "Failed to add word."
      );

      setLoading(false);
      return;
    }

    const {
      error: sessionError,
    } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        word_id: wordData.id,
        status: false,
        correct_guesses: false,
      });

    if (sessionError) {
      console.error(
        "Game session insert error:",
        sessionError
      );

      setError(sessionError.message);
      setLoading(false);
      return;
    }

    setSuccessMessage(
      `"${word}" has been added to your vocabulary.`
    );

    form.resetFields();
    setLoading(false);
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
      <Title
        level={4}
        style={{
          marginTop: 0,
          marginBottom: 4,
        }}
      >
        Add Your Own Word
      </Title>

      <Paragraph
        type="secondary"
        style={{
          marginBottom: 20,
        }}
      >
        Add a vocabulary word you would like
        to practice in the game.
      </Paragraph>

      {error && (
        <Alert
          type="error"
          title="Unable to add word"
          description={error}
          showIcon
          closable={{
            onClose: () => setError(""),
          }}
          style={{
            marginBottom: 16,
          }}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          title="Word added"
          description={successMessage}
          showIcon
          closable={{
            onClose: () =>
              setSuccessMessage(""),
          }}
          style={{
            marginBottom: 16,
          }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          label="Word"
          name="word"
          rules={[
            {
              required: true,
              message:
                "Please enter a word.",
            },
            {
              whitespace: true,
              message:
                "Please enter a word.",
            },
          ]}
        >
          <Input
            size="large"
            placeholder="Example: meticulous"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          label="Meaning"
          name="meaning"
          rules={[
            {
              required: true,
              message:
                "Please enter the meaning.",
            },
            {
              whitespace: true,
              message:
                "Please enter the meaning.",
            },
          ]}
        >
          <TextArea
            placeholder="Enter a short definition..."
            showCount
            maxLength={300}
            autoSize={{
              minRows: 3,
              maxRows: 6,
            }}
          />
        </Form.Item>

        <Form.Item
          style={{
            marginBottom: 0,
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
            loading={loading}
            block
            size="large"
          >
            Add Word
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}