import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription: {
    plan: 'free' | 'pro' | 'premium';
    startDate: string;
    endDate?: string;
  };
  credits: number;
  referralCode: string;
  referredBy?: string;
  streak: number;
  isAccecptedTerm?: boolean;
  dailyProgress: {
    completed: number;
    goal: number;
  };
  speakingTimeMinutes: number;
  accuracy: number;
  achievements: string[];
  level?: string; // Added level field
}

const initialState: UserState | null = null;

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState | null>) {
      return action.payload;
    },
    resetUser() {
      return null;
    },
    setLevel(state, action: PayloadAction<string>) {
      if (state) {
        state.level = action.payload;
      }
    },
  },
});

export const { setUser, resetUser, setLevel } = userSlice.actions;
export default userSlice.reducer;
