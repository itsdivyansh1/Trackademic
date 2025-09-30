import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

// Helper to read a stream into base64
async function streamToBase64(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const full = new Uint8Array(totalLength);
  let offset = 0;
  for (const c of chunks) {
    full.set(c, offset);
    offset += c.length;
  }

  // Convert to base64
  return Buffer.from(full).toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "Missing GEMINI_API_KEY. Set it in your .env.local for the web app.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const {
      question,
      fileUrl,
      fileType,
      title,
      includeFile = false,
    } = body as {
      question: string;
      fileUrl?: string;
      fileType?: string;
      title?: string;
      includeFile?: boolean;
    };

    if (!question) {
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Available Gemini models
    const modelCandidates = [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-pro",
    ].filter(Boolean) as string[];

    let lastError: any;
    let text: string | null = null;

    const systemPreamble = [
      "You are the Trackademic research assistant.",
      "Primary goal: help with questions about the CURRENT paper/certificate (title and file).",
      "You may also suggest related papers, keywords, and search strategies based on the title/DOI/authors provided.",
      "Format your answer with clear sections and bullet points when useful.",
      "Keep answers grounded to the provided context; do not fabricate citations.",
    ].join("\n");

    const baseParts: any[] = [
      {
        text: `${systemPreamble}\n\nTitle: ${title ?? "Untitled"}\nSource URL: ${fileUrl ?? "(not provided)"}`,
      },
    ];

    // Build the parts array
    const parts: any[] = [...baseParts];

    // Include file content if requested
    if (includeFile && fileUrl) {
      try {
        const fileRes = await fetch(fileUrl);
        if (fileRes.ok && fileRes.body) {
          const contentType =
            fileRes.headers.get("content-type") || "application/octet-stream";

          // Process supported file types
          if (
            contentType.startsWith("image/") ||
            contentType === "application/pdf" ||
            contentType.startsWith("text/")
          ) {
            const base64 = await streamToBase64(
              fileRes.body as ReadableStream<Uint8Array>,
            );
            parts.push({
              inlineData: {
                data: base64,
                mimeType: contentType,
              },
            });
            parts.push({
              text: `File content has been attached for analysis. The file type is ${contentType}.`,
            });
          } else {
            parts.push({
              text: `Note: File type ${contentType} is not supported for inline analysis. Proceeding with limited context.`,
            });
          }
        } else {
          parts.push({
            text: `Note: Failed to fetch the file from ${fileUrl}. Status ${fileRes.status}. Proceed with limited context.`,
          });
        }
      } catch (e: any) {
        parts.push({
          text: `Note: Error fetching file (${e?.message}). Proceed with limited context.`,
        });
      }
    } else {
      parts.push({
        text: "Note: File content was not attached for analysis. Answers may be limited to general information present in the question itself.",
      });
    }

    // Add the user's question
    parts.push({
      text: `User question about this file: ${question}`,
    });

    // Try each model until one works
    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        // Try streaming first for better UX
        try {
          const streamResult = await model.generateContentStream({
            contents: [{ role: "user", parts }],
          });

          // Create a readable stream for the response
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of streamResult.stream) {
                  const chunkText = chunk.text();
                  if (chunkText) {
                    controller.enqueue(new TextEncoder().encode(chunkText));
                  }
                }
              } catch (streamError) {
                console.error("Streaming error:", streamError);
                controller.error(streamError);
              } finally {
                controller.close();
              }
            },
          });

          return new Response(readable, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (streamError) {
          // Fallback to non-streaming
          console.log("Streaming failed, falling back to regular generation");
          const result = await model.generateContent({
            contents: [{ role: "user", parts }],
          });
          text = result.response.text();
          break;
        }
      } catch (err: any) {
        console.error(`Model ${modelName} failed:`, err.message);
        lastError = err;
        continue;
      }
    }

    if (!text) {
      throw lastError || new Error("All model candidates failed");
    }

    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return new Response(
      JSON.stringify({
        error:
          error?.message ||
          "Unknown error occurred while processing your request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
