import { Schema, model, models, Document, Types } from 'mongoose';

export interface IChallengeSubmission extends Document {
  user: Types.ObjectId;
  challenge: Types.ObjectId;
  audioUrl: string;
  transcript: string;
  score: number;
  feedback: {
    wellDone: string;
    improvementArea: string;
  };
}

const ChallengeSubmissionSchema = new Schema<IChallengeSubmission>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challenge: { type: Schema.Types.ObjectId, ref: 'DailyChallenge', required: true },
  audioUrl: { type: String, required: true },
  transcript: { type: String, default: '' },
  score: { type: Number, default: 0 },
  feedback: {
    wellDone: { type: String, default: '' },
    improvementArea: { type: String, default: '' },
  }
}, { timestamps: true });

export default models.ChallengeSubmission || model<IChallengeSubmission>('ChallengeSubmission', ChallengeSubmissionSchema);