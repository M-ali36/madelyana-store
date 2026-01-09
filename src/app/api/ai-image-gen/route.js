import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      prompt,
      negativePrompt,
      productImageBase64,
      productImageType
    } = await req.json();

    if (!prompt || !productImageBase64) {
      return NextResponse.json(
        { error: "Missing prompt or product image" },
        { status: 400 }
      );
    }

    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${prompt}\n\nNEGATIVE PROMPT:\n${negativePrompt || ""}` },
            {
              inlineData: {
                mimeType: productImageType || "image/png",
                data: productImageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 2048
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
