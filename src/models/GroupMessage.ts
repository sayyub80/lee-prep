// src/models/GroupMessage.ts
import { Schema, model, models, Document, Types } from 'mongoose';

export interface IGroupMessage extends Document {
  group: Types.ObjectId;
  sender: Types.ObjectId;
  senderName: string;
  text: string;
}

const GroupMessageSchema = new Schema<IGroupMessage>({
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true }, // Denormalized for performance
  text: { type: String, required: true },
}, { timestamps: true });

export default models.GroupMessage || model<IGroupMessage>('GroupMessage', GroupMessageSchema);