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
            ? `You are a helpful writing assistant. The user is writing a text with the following context/style: "${context}". Continue the text naturally, matching the style. IMPORTANT: Keep it brief (max 2-3 sentences). Ensure proper spacing. Do not repeat the prompt.`
            : "You are a helpful writing assistant. Continue the text naturally. IMPORTANT: Keep it brief (max 2-3 sentences). Ensure proper spacing. Do not repeat the prompt.";

        let response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt },
            ],
            max_tokens: 60, // Reduced for brief suggestions
            temperature: 0.7,
        });

        let completion = response.choices[0].message.content;

        // Check if the completion ends with a sentence-ending punctuation
        if (completion && !/[.!?"]$/.test(completion.trim())) {
            // If not, ask the model to complete it
            const secondResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt },
                    { role: "assistant", content: completion },
                    { role: "user", content: "Please complete the last sentence/thought. Do not repeat the previous text." }
                ],
                max_tokens: 100,
                temperature: 0.7,
            });

            const extraContent = secondResponse.choices[0].message.content;
            if (extraContent) {
                completion += extraContent;
            }
        }

        return NextResponse.json({ completion });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate completion" },
            { status: 500 }
        );
    }
}
