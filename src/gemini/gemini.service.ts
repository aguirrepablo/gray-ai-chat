import { Injectable } from '@nestjs/common';
import { Content, GoogleGenerativeAI, SchemaType, Tool } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private geminiApiToken = process.env.GEMINI_API_TOKEN;
    private geminiModel = process.env.GEMINI_MODEL;

    async getGenerativeModel(messages: Content[], prompt: string): Promise<any> {
        try {
            const genAI = new GoogleGenerativeAI(this.geminiApiToken);

            const promptCasteado = {
                text: prompt
            };

            const tools = this.getTools();

            const model = genAI.getGenerativeModel({
                model: this.geminiModel,
                systemInstruction: promptCasteado,
                tools: tools
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

    getTools() {
        const tool_close_conversation : Tool  = {
            functionDeclarations: [
                {
                    name: "close_conversation", // **Añade el nombre de la función aquí**
                    description: "Permite cerrar la conversación actual",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            conversationId: {
                                type: SchemaType.STRING,
                                description: "El ID de la conversación, lo podés encontrar en tu prompt."
                            }
                        },
                        required: [
                            "conversationId"
                        ]
                    }
                }
            ]
        };

        const tool_disable_conversation_agent : Tool  = {
            functionDeclarations: [
                {
                    name: "disable_conversation_agent", // **Añade el nombre de la función aquí**
                    description: "Permite desactivar el agente virtual en la conversación.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            conversationId: {
                                type: SchemaType.STRING,
                                description: "El ID de la conversación, lo podés encontrar en tu prompt."
                            }
                        },
                        required: [
                            "conversationId"
                        ]
                    }
                }
            ]
        }

        return [tool_close_conversation, tool_disable_conversation_agent];
    }
}
