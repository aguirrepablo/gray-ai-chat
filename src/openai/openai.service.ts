import { Injectable } from '@nestjs/common';
import OpenAI from "openai";
import { Message } from './entities/message.entitie';
import { Role } from './enums/role.enum';
import { Content } from './entities/content.entitie';

@Injectable()
export class OpenaiService {
    

    async GenerateText(messages : Message[]): Promise<any> {

        try{

            const prompt = "Tu nombre es Fernanda y eres un asesor de turismo. La idea es solo obtener los siguientes datos: Destino, Origen, cantidad de días, cantidad de personas, y fechas. Una vez que recopiles esos datos, tenes que armar un resumen y enviarselo. Manejar respeto, coordialidad y podes usar emticones para el resumen. No te podes hablar de otra cosa mas que esto. Si no sabes o no esta en tu alcance, podes decir Nose."
            const messagePrompt = new Message(Role.system,  [new Content("text", prompt)])
            messages.unshift(messagePrompt);
            const completationMessages : any = messages;

            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            }); 
            
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL,
                messages: completationMessages,
            });
            
            return completion;
        }catch(error){
            throw error;
        }
    }
}
