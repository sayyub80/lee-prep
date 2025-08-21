// src/models/Group.ts
import { Schema, model, models, Document, Types } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description: string;
  topic: string;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  // --- ADD THIS ---
  currentTopic: {
    title: string;
    setBy: Types.ObjectId;
    setAt: Date;
  };
}

const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  topic: { type: String, default: "General" },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // --- ADD THIS ---
  currentTopic: {
    title: { type: String, default: "Welcome! Feel free to discuss anything related to the group's theme." },
    setBy: { type: Schema.Types.ObjectId, ref: 'User' },
    setAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

export default models.Group || model<IGroup>('Group', GroupSchema);