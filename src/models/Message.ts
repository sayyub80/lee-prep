import { Schema, model, models, Document, Types } from 'mongoose';

interface IMessage extends Document {
  session: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  session: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default models.Message || model<IMessage>('Message', MessageSchema);
