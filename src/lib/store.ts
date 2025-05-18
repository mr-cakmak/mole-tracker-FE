import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MoleLocation = {
  x: number;
  y: number;
};

export type MoleRecord = {
  id: string;
  image: string; // Base64 encoded image
  date: string;
  prediction: number;
  maxConfidence: number;
  probabilities: number[];
};

export type Mole = {
  id: string;
  location: MoleLocation;
  records: MoleRecord[];
};

type MoleStore = {
  moles: Mole[];
  addMole: (mole: Mole) => void;
  addMoleRecord: (moleId: string, record: MoleRecord) => void;
  getMole: (id: string) => Mole | undefined;
  getMoleByLocation: (x: number, y: number, threshold: number) => Mole | undefined;
};

export const useMoleStore = create<MoleStore>()(
  persist(
    (set, get) => ({
      moles: [],
      addMole: (mole) => set((state) => ({ 
        moles: [...state.moles, mole] 
      })),
      addMoleRecord: (moleId, record) => set((state) => ({
        moles: state.moles.map((mole) => 
          mole.id === moleId 
            ? { ...mole, records: [...mole.records, record] } 
            : mole
        )
      })),
      getMole: (id) => get().moles.find((mole) => mole.id === id),
      getMoleByLocation: (x, y, threshold) => {
        return get().moles.find((mole) => {
          const distance = Math.sqrt(
            Math.pow(mole.location.x - x, 2) + 
            Math.pow(mole.location.y - y, 2)
          );
          return distance <= threshold;
        });
      }
    }),
    {
      name: 'mole-storage',
    }
  )
); 