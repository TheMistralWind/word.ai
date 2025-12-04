import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { originalText, instruction } = await req.json();

        if (!originalText || !instruction) {
            return NextResponse.json(
                { error: "Missing originalText or instruction" },
                { status: 400 }
            );
        }

        const systemMessage = `You are a precise literary editor. You will receive a piece of text and a rewriting instruction.

Your Rules:
1. Rewrite the text according to the instruction.
2. Maintain the original tone unless asked to change it.
3. OUTPUT ONLY THE REWRITTEN TEXT.
4. Do not output conversational filler like "Here is the new version."
5. Do not output markdown code blocks. Just the raw string.`;

        const userMessage = `Original Text: "${originalText}"
Instruction: "${instruction}"`;

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
            { error: "Failed to refactor text" },
            { status: 500 }
        );
    }
}
