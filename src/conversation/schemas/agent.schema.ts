import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AgentStatus } from '../enums/agent-status.enum';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({ timestamps: true })
export class Agent {
  _id: Types.ObjectId;
  
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ enum: AgentStatus, default: AgentStatus.OFFLINE })
  status: AgentStatus;

  @Prop({ required: true, unique: true })
  prompt: string;

  @Prop({ required: true })
  isDefault: boolean;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);