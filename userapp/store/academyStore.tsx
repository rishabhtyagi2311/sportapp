import { create } from "zustand";

type Academy = {
  academyName: string;
  sportType: string;
  address: string;
  coachName: string;
  contactNumber: string;
  facilities: string;
  feeStructure: string;
  monthlyFee: string;
  city: string; 
};

type AcademyStore = {
  academies: Academy[];
  addAcademy: (academy: Academy) => void;
  getAcademies: () => Academy[];
  clearAcademies: () => void;
};

export const useAcademyStore = create<AcademyStore>((set, get) => ({
  academies: [],

  addAcademy: (academy) =>
    set((state) => ({
      academies: [...state.academies, academy],
    })),

  getAcademies: () => get().academies,

  clearAcademies: () => set({ academies: [] }),
}));
