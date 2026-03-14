import { NextRequest, NextResponse } from "next/server";
 
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt } = body;
 
  if (!prompt) {
    return NextResponse.json({ error: "No prompt" }, { status: 400 });
  }
 
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
 
  const data = await response.json();
 
  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message || "API error" },
      { status: 500 }
    );
  }
 
  return NextResponse.json(data);
}