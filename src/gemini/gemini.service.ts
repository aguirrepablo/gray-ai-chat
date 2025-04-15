import { Injectable } from '@nestjs/common';
import { Content, GoogleGenerativeAI, SchemaType, Tool } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private geminiApiToken = process.env.GEMINI_API_TOKEN;
    private geminiModel = process.env.GEMINI_MODEL;
    private _geminiConfigTemperature = process.env.GEMINI_CONFIG_TEMPERATURE;
    private _geminiConfigTopP = process.env.GEMINI_CONFIG_TEMP_P;
    private _geminiConfigTopK = process.env.GEMINI_CONFIG_TEMP_K;
    private _geminiConfigMaxOutputTokens = process.env.GEMINI_CONFIG_MAX_OUTPUT_TOKENS;

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
                tools: tools,
                generationConfig: {
                    temperature: Number(this._geminiConfigTemperature), // Aumentamos la temperatura para más aleatoriedad
                    topP: Number(this._geminiConfigTopP),
                    topK: Number(this._geminiConfigTopK),
                    maxOutputTokens: Number(this._geminiConfigMaxOutputTokens)
                  }
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
                    name: "disable_conversation_agent",
                    description: "Permite desactivar el agente virtual en la conversación. no debes responder cuando hagas esta acción.",
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

        const tool_get_data_link : Tool  = {
            functionDeclarations: [
                {
                    name: "get_data_link", // **Añade el nombre de la función aquí**
                    description: "Obtiene información de toda la web del enlace.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            link: {
                                type: SchemaType.STRING,
                                description: "el link o enlace lo podes identificar en el mensaje."
                            }
                        },
                        required: [
                            "link"
                        ]
                    }
                }
            ]
        }

        return [tool_close_conversation, tool_disable_conversation_agent, tool_get_data_link];
    }
}
