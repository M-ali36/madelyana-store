import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // 🔴 REQUIRED

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});

const MODEL = "vertex_ai/gemini-3-pro-image-preview";

const MODEL_FILES = {
  model_01: "model_01.webp",
  model_02: "model_02.webp",
  model_03: "model_03.webp",
  model_04: "model_04.webp",
};

export async function POST(req) {
  try {
    const body = await req.json();

    let { prompt, productImageBase64, model } = body;

    // Normalize model
    model = String(model || "")
      .toLowerCase()
      .replace(".webp", "")
      .replace("/models/", "")
      .trim();

    if (!prompt || !productImageBase64 || !model) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const fileName = MODEL_FILES[model];
    if (!fileName) {
      return Response.json(
        { error: "Invalid model" },
        { status: 400 }
      );
    }

    const modelPath = path.join(
      process.cwd(),
      "public",
      "models",
      fileName
    );

    const modelImageBase64 = fs.readFileSync(
      modelPath,
      "base64"
    );

    const chat = ai.chats.create({
      model: MODEL,
      config: {
        responseModalities: ["IMAGE"],
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const response = await chat.sendMessageStream({
          message: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/webp",
                data: productImageBase64,
              },
            },
            {
              inlineData: {
                mimeType: "image/webp",
                data: modelImageBase64,
              },
            },
          ],
        });

        for await (const chunk of response) {
          controller.enqueue(
            JSON.stringify(chunk) + "\n"
          );
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API CRASH:", err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
