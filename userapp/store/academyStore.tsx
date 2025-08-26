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
  academies: [
    {
      academyName: "Rising Stars Cricket Academy",
      sportType: "Cricket",
      address: "Sector 21, Near Sports Complex",
      city: "Delhi",
      coachName: "Rahul Sharma",
      contactNumber: "9876543210",
      facilities: "Turf pitch, Bowling machine, Indoor nets",
      feeStructure: "monthly",
      monthlyFee: "1500",
    },
    {
      academyName: "Football United Academy",
      sportType: "Football",
      address: "MG Road, Near City Park",
      city: "Bangalore",
      coachName: "Arjun Nair",
      contactNumber: "9123456789",
      facilities: "Grass field, Artificial turf, Goal posts",
      feeStructure: "monthly",
      monthlyFee: "2000",
    },
    {
      academyName: "Hoops Basketball Academy",
      sportType: "Basketball",
      address: "Andheri West, Near Metro Station",
      city: "Mumbai",
      coachName: "Michael D’Souza",
      contactNumber: "9988776655",
      facilities: "Indoor court, Wooden flooring, Fitness training",
      feeStructure: "quarterly",
      monthlyFee: "4500",
    },
    {
      academyName: "Smash Badminton Academy",
      sportType: "Badminton",
      address: "Sector 14, Near Market",
      city: "Chandigarh",
      coachName: "Priya Verma",
      contactNumber: "9090909090",
      facilities: "Indoor courts, Wooden floor, Synthetic mats",
      feeStructure: "monthly",
      monthlyFee: "1200",
    },
    {
      academyName: "Grand Slam Tennis Academy",
      sportType: "Tennis",
      address: "Beside Sports Authority Ground",
      city: "Hyderabad",
      coachName: "Sanjay Kapoor",
      contactNumber: "9911223344",
      facilities: "Clay court, Hard court, Indoor training",
      feeStructure: "annually",
      monthlyFee: "18000",
    },
    {
      academyName: "Blue Waves Swimming Academy",
      sportType: "Swimming",
      address: "Near Lakeside Club",
      city: "Pune",
      coachName: "Meera Joshi",
      contactNumber: "9876501234",
      facilities: "Olympic pool, Training pool, Diving board",
      feeStructure: "monthly",
      monthlyFee: "2500",
    },
  ],

  addAcademy: (academy) =>
    set((state) => ({
      academies: [...state.academies, academy],
    })),

  getAcademies: () => get().academies,

  clearAcademies: () => set({ academies: [] }),
}));
