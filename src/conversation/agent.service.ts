import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agent } from './schemas/agent.schema';


@Injectable()
export class AgentService {
    conversationModel: any;
    constructor(
        @InjectModel(Agent.name) private AgentModel: Model<Agent>
    ) { }

    async findDefaultAgent(): Promise<Agent> {
        return await this.AgentModel.findOne({ isDefault: true });
    }

    async findOneAgent(agentId: Types.ObjectId): Promise<Agent> {
        return await this.conversationModel.findById(agentId);
    }
}