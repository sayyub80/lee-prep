import { Schema, model, models, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface ISubscription {
  plan: 'free' | 'pro' | 'premium';
  startDate: Date;
  endDate?: Date;
}

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  subscription: ISubscription;
  credits: number;
  referralCode: string;
  referredBy?: Schema.Types.ObjectId;
  referrals: Schema.Types.ObjectId[]; 
  streak: number;
  isAccecptedTerm:{
    type:boolean,
    default:false
  };
  dailyProgress: {
    completed: number;
    goal: number;
  };
  speakingTimeMinutes: number;
  accuracy: number;
  level?:{
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
   achievements: string[];
  groups: Schema.Types.ObjectId[]; 
  role: 'user' | 'admin'; 
   status: 'active' | 'suspended';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String },
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }
  },
  credits: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  referrals: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
  streak: { type: Number, default: 0 },
  dailyProgress: {
    completed: { type: Number, default: 0 },
    goal: { type: Number, default: 100 }
  },
  speakingTimeMinutes: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
   achievements: { type: [String], default: [] },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' } ,
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  
  next();
});

UserSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default models.User || model<IUser>('User', UserSchema);