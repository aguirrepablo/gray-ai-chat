import { Injectable } from '@nestjs/common';
import { Content, GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private geminiApiToken = process.env.GEMINI_AI_API_TOKEN;
    private geminiModel = process.env.GEMINI_MODEL;

    async getGenerativeModel(messages: Content[], prompt : string): Promise<any> {
        try {
            const genAI = new GoogleGenerativeAI(this.geminiApiToken);

            const promptCasteado = {
                text: prompt
            };

            const model = genAI.getGenerativeModel({
                model: this.geminiModel,
                systemInstruction: promptCasteado
            });

            const result = await model.generateContent({
                contents: messages,
            });

            return result.response;
        } catch (error) {
            console.error("Error gemini > ", error);
            throw error;
        }

    }
}
