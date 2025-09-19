import { Schema, model, models, Document, Types } from 'mongoose';

export interface IDailyChallenge extends Document {
  topic: string;
  reward: number;
  timeLimit: number; // in seconds
  activeDate: Date;
  createdBy: Types.ObjectId;
}

const DailyChallengeSchema = new Schema<IDailyChallenge>({
  topic: { type: String, required: true },
  reward: { type: Number, default: 50 },
  timeLimit: { type: Number, default: 60 },
  activeDate: { type: Date, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default models.DailyChallenge || model<IDailyChallenge>('DailyChallenge', DailyChallengeSchema);