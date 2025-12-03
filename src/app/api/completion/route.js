import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { prompt, context } = await req.json();

        // Construct a system message based on the user's context
        const systemMessage = context
            ? `You are a helpful writing assistant. The user is writing a text with the following context/style: "${context}". Continue the text naturally, matching the style. Provide only the next few words or sentences to complete the thought. Do not repeat the prompt.`
            : "You are a helpful writing assistant. Continue the text naturally. Provide only the next few words or sentences to complete the thought. Do not repeat the prompt.";

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt },
            ],
            max_tokens: 50, // Keep it short for "next word" feel
            temperature: 0.7,
        });

        const completion = response.choices[0].message.content;

        return NextResponse.json({ completion });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate completion" },
            { status: 500 }
        );
    }
}
