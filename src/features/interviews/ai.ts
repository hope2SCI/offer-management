import { AppError } from "@/lib/errors";
import type { AiAnswerMode } from "./constants";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

function modelForMode(mode: AiAnswerMode) {
  return mode === "DEEP" ? "deepseek-v4-pro" : "deepseek-v4-flash";
}

export function buildInterviewAnswerPrompt(questions: string) {
  return [
    "你是一个资深面试辅导助手。",
    "请基于用户记录的面试问题生成中文参考答案。",
    "用户只记录了问题，没有记录自己的回答。",
    "请尽量拆分每个问题，并严格使用以下格式：",
    "",
    "问题：",
    "参考答案：",
    "追问/补充点：",
    "",
    "面试问题记录：",
    questions
  ].join("\n");
}

export async function generateInterviewAiAnswer({
  apiKey,
  mode,
  questions
}: {
  apiKey: string;
  mode: AiAnswerMode;
  questions: string;
}) {
  const thinkingEnabled = mode === "DEEP";
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelForMode(mode),
      messages: [
        {
          role: "user",
          content: buildInterviewAnswerPrompt(questions)
        }
      ],
      thinking: { type: thinkingEnabled ? "enabled" : "disabled" },
      ...(thinkingEnabled ? { reasoning_effort: "high" } : {}),
      stream: false
    })
  });

  if (!response.ok) {
    throw new AppError("AI 解答生成失败，请稍后重试。", 502);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) throw new AppError("AI 没有返回可保存的答案。", 502);
  return answer;
}
