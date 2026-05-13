/** @format */

import { create } from 'zustand';

interface ProgressStore {
  isLoading: boolean;
  progress: number;
  message: string;
  startProgress: (message?: string) => void;
  setProgress: (progress: number) => void;
  completeProgress: () => void;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  isLoading: false,
  progress: 0,
  message: '',
  startProgress: (message = 'Loading...') => set({ isLoading: true, progress: 0, message }),
  setProgress: (progress) => set({ progress }),
  completeProgress: () => set({ isLoading: false, progress: 100 }),
}));
