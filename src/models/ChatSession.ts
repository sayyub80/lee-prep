import { Schema, model, models, Document, Types } from 'mongoose';

interface IChatSession extends Document {
  participants: Types.ObjectId[];
  type: 'chat' | 'voice';
  status: 'active' | 'ended';
  startedAt: Date;
  endedAt?: Date;
}

const ChatSessionSchema = new Schema<IChatSession>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  type: { type: String, enum: ['chat', 'voice'], required: true },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
}, { timestamps: true });

export default models.ChatSession || model<IChatSession>('ChatSession', ChatSessionSchema);
