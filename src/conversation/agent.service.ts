import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agent } from './schemas/Agent.schema'; // Adjust import path as needed

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