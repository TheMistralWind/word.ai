import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { originalText, instruction, context, fullText } = await req.json();

        if (!originalText) {
            return NextResponse.json(
                { error: "Missing originalText" },
                { status: 400 }
            );
        }

        const systemMessage = `You are a creative writer. You will receive a headline or brief description.
Your task is to expand it into a full, well-written paragraph.

Your Rules:
1. Write a paragraph based on the headline/description.
2. Maintain the tone and language of the surrounding text.
3. OUTPUT ONLY THE GENERATED PARAGRAPH.
4. Do not output conversational filler.
5. Do not output markdown code blocks.

Context provided by user: "${context || "None"}"
Surrounding text sample: "${fullText ? fullText.substring(0, 500) + "..." : "None"}"`;

        const userMessage = `Headline/Description: "${originalText}"
Instruction (Optional): "${instruction || "Expand this into a detailed paragraph matching the surrounding text's language and style."}"`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const rewrittenText = response.choices[0].message.content;

        return NextResponse.json({ rewrittenText });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return NextResponse.json(
            { error: "Failed to expand text" },
            { status: 500 }
        );
    }
}
