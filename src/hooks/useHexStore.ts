import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHexId, getDistance } from '../utils/hexGrid';
import { Vibration } from 'react-native';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'explore' | 'steps' | 'distance';
  target: number; // e.g. 10 hexes, 2000 steps, 1000 meters
  progress: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  progress: number;
  unlocked: boolean;
}

export interface Chest {
  id: string;
  sponsorName: string;
  latitude: number;
  longitude: number;
  rewardCoins: number;
  coupon: string;
  claimed: boolean;
}

export type ThemeType = 'cyberpunk' | 'synthwave' | 'forest' | 'minimalLight';

interface HexState {
  // Exploration data
  unlockedHexes: Record<string, boolean>; // Map of "q_r" -> true
  currentLocation: { latitude: number; longitude: number; accuracy?: number } | null;
  lastLocation: { latitude: number; longitude: number } | null;
  totalDistance: number; // in meters
  totalHexesCount: number;
  
  // Health & Daily Stats
  stepsToday: number;
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  
  // Gamification & Rewards
  xp: number;
  level: number;
  coins: number;
  chests: Chest[];
  lastUnlockedCoupon: { sponsorName: string; coupon: string } | null;
  quests: Quest[];
  achievements: Achievement[];
  activeTheme: ThemeType;
  
  // Developer Simulator
  isSimulatorActive: boolean;
  simulatorLocation: { latitude: number; longitude: number } | null;

  // Actions
  updateLocation: (latitude: number, longitude: number, accuracy?: number) => void;
  unlockHexDirect: (hexId: string) => void;
  addSteps: (steps: number) => void;
  claimQuestReward: (questId: string) => void;
  clearLastUnlockedCoupon: () => void;
  setTheme: (theme: ThemeType) => void;
  resetProgress: () => void;
  
  // Simulator Actions
  toggleSimulator: () => void;
  moveSimulator: (direction: 'N' | 'S' | 'E' | 'W') => void;
  teleportSimulator: (latitude: number, longitude: number) => void;
}

// Initial Chests near global presets
const getInitialChests = (): Chest[] => [
  {
    id: 'c1',
    sponsorName: 'Starbucks Centro',
    latitude: 19.433400, // CDMX Zocalo north-east
    longitude: -99.132500,
    rewardCoins: 50,
    coupon: '15% de Descuento en tu Latte Favorito',
    claimed: false,
  },
  {
    id: 'c2',
    sponsorName: 'Café Central Madrid',
    latitude: 40.417300, // Madrid Puerta del Sol north
    longitude: -3.703200,
    rewardCoins: 60,
    coupon: 'Muffin de Regalo por la compra de un Café Grande',
    claimed: false,
  },
  {
    id: 'c3',
    sponsorName: 'Nike Buenos Aires',
    latitude: -34.607500, // BA Plaza de Mayo north
    longitude: -58.372500,
    rewardCoins: 100,
    coupon: '10% de Descuento en Zapatillas de Running',
    claimed: false,
  },
  {
    id: 'c4',
    sponsorName: 'Supermercado Cataluña',
    latitude: 41.388200, // Barcelona Plaza Cataluña north-east
    longitude: 2.169500,
    rewardCoins: 45,
    coupon: 'Bebida Energética Gratis en tu compra',
    claimed: false,
  },
  {
    id: 'c5',
    sponsorName: 'Bistró Eiffel París',
    latitude: 48.859200, // Paris Eiffel north
    longitude: 2.293800,
    rewardCoins: 80,
    coupon: 'Copa de Vino Gratis con tu Menú de Almuerzo',
    claimed: false,
  }
];

const getInitialQuests = (): Quest[] => [
  {
    id: 'q1',
    title: 'Primeros Pasos',
    description: 'Desbloquea 5 hexágonos explorando tu entorno.',
    type: 'explore',
    target: 5,
    progress: 0,
    xpReward: 50,
    completed: false,
    claimed: false,
  },
  {
    id: 'q2',
    title: 'Explorador Urbano',
    description: 'Camina 1,000 metros (1 km) en total.',
    type: 'distance',
    target: 1000,
    progress: 0,
    xpReward: 100,
    completed: false,
    claimed: false,
  },
  {
    id: 'q3',
    title: 'Actividad Diaria',
    description: 'Da 3,000 pasos hoy.',
    type: 'steps',
    target: 3000,
    progress: 0,
    xpReward: 150,
    completed: false,
    claimed: false,
  },
  {
    id: 'q4',
    title: 'Gran Expedición',
    description: 'Desbloquea 20 hexágonos.',
    type: 'explore',
    target: 20,
    progress: 0,
    xpReward: 250,
    completed: false,
    claimed: false,
  }
];

const getInitialAchievements = (): Achievement[] => [
  {
    id: 'a1',
    title: 'Cartógrafo Aprendiz',
    description: 'Desbloquea tu primer hexágono.',
    category: 'explore',
    target: 1,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'a2',
    title: 'Conquistador de Calles',
    description: 'Desbloquea 50 hexágonos.',
    category: 'explore',
    target: 50,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'a3',
    title: 'Maratonista Local',
    description: 'Recorre 5,000 metros (5 km).',
    category: 'distance',
    target: 5000,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'a4',
    title: 'Espíritu Imparable',
    description: 'Alcanza una racha de 3 días caminando.',
    category: 'streak',
    target: 3,
    progress: 0,
    unlocked: false,
  }
];

const XP_PER_HEX = 15;

export const useHexStore = create<HexState>()(
  persist(
    (set, get) => ({
      unlockedHexes: {},
      currentLocation: null,
      lastLocation: null,
      totalDistance: 0,
      totalHexesCount: 0,
      stepsToday: 0,
      streak: 0,
      lastActiveDate: null,
      xp: 0,
      level: 1,
      coins: 0,
      chests: getInitialChests(),
      lastUnlockedCoupon: null,
      quests: getInitialQuests(),
      achievements: getInitialAchievements(),
      activeTheme: 'cyberpunk',
      isSimulatorActive: false,
      simulatorLocation: null,

      updateLocation: (latitude, longitude, accuracy) => {
        const state = get();
        const activeLocation = state.isSimulatorActive
          ? (state.simulatorLocation || { latitude, longitude })
          : { latitude, longitude };

        const hexId = getHexId(activeLocation.latitude, activeLocation.longitude);
        const isNewHex = !state.unlockedHexes[hexId];

        // 1. Calculate distance from last location
        let distanceDelta = 0;
        if (state.lastLocation) {
          distanceDelta = getDistance(
            state.lastLocation.latitude,
            state.lastLocation.longitude,
            activeLocation.latitude,
            activeLocation.longitude
          );
          // QA Filter: Ignore GPS jumps > 300m to prevent glitches (unless simulator is active)
          if (distanceDelta > 300 && !state.isSimulatorActive) {
            distanceDelta = 0;
          }
        }

        const newUnlockedHexes = { ...state.unlockedHexes };
        let newXp = state.xp;
        let newHexCount = state.totalHexesCount;

        if (isNewHex) {
          newUnlockedHexes[hexId] = true;
          newXp += XP_PER_HEX;
          newHexCount += 1;
          
          // UX Loop: Vibration on new hex unlock!
          try {
            Vibration.vibrate(60); // light haptic bump
          } catch (e) {
            // Ignore on web/headless environments
          }
        }

        const newDistance = state.totalDistance + distanceDelta;

        // 2. Check for chest collection / collisions (within 35 meters)
        let newlyUnlockedCoupon = null;
        let addedCoins = 0;
        const updatedChests = state.chests.map((chest) => {
          if (chest.claimed) return chest;
          const distToChest = getDistance(
            activeLocation.latitude,
            activeLocation.longitude,
            chest.latitude,
            chest.longitude
          );
          if (distToChest < 35) {
            // Chest Claimed!
            newlyUnlockedCoupon = { sponsorName: chest.sponsorName, coupon: chest.coupon };
            addedCoins = chest.rewardCoins;
            newXp += 30; // Bonus XP for finding chests
            
            // UX loop: Dual pulse distinct vibration for chests
            try {
              Vibration.vibrate([0, 100, 50, 150]);
            } catch (e) {}
            
            return { ...chest, claimed: true };
          }
          return chest;
        });

        const newCoins = state.coins + addedCoins;

        // 3. Check and update streak
        const todayStr = new Date().toISOString().split('T')[0];
        let newStreak = state.streak;
        if (state.lastActiveDate !== todayStr) {
          if (state.lastActiveDate === null) {
            newStreak = 1;
          } else {
            const lastDate = new Date(state.lastActiveDate);
            const today = new Date(todayStr);
            const diffTime = Math.abs(today.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              newStreak += 1; // Consecutive day
            } else if (diffDays > 1) {
              newStreak = 1; // Streak broken, reset
            }
          }
        }

        // 4. Update Quest Progresses
        const updatedQuests = state.quests.map((q) => {
          if (q.completed) return q;
          let progress = q.progress;
          if (q.type === 'explore') {
            progress = newHexCount;
          } else if (q.type === 'distance') {
            progress = Math.round(newDistance);
          }
          const completed = progress >= q.target;
          return { ...q, progress: Math.min(progress, q.target), completed };
        });

        // 5. Update Achievement Progresses
        const updatedAchievements = state.achievements.map((a) => {
          if (a.unlocked) return a;
          let progress = a.progress;
          if (a.category === 'explore') {
            progress = newHexCount;
          } else if (a.category === 'distance') {
            progress = Math.round(newDistance);
          } else if (a.category === 'streak') {
            progress = newStreak;
          }
          const unlocked = progress >= a.target;
          return { ...a, progress: Math.min(progress, a.target), unlocked };
        });

        // 6. Check for level ups
        let tempLevel = state.level;
        let xpNeeded = tempLevel * 150;
        while (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          tempLevel += 1;
          xpNeeded = tempLevel * 150;
        }

        set({
          currentLocation: { latitude: activeLocation.latitude, longitude: activeLocation.longitude, accuracy },
          lastLocation: { latitude: activeLocation.latitude, longitude: activeLocation.longitude },
          unlockedHexes: newUnlockedHexes,
          totalHexesCount: newHexCount,
          totalDistance: newDistance,
          xp: newXp,
          level: tempLevel,
          streak: newStreak,
          lastActiveDate: todayStr,
          coins: newCoins,
          chests: updatedChests,
          lastUnlockedCoupon: newlyUnlockedCoupon || state.lastUnlockedCoupon,
          quests: updatedQuests,
          achievements: updatedAchievements,
        });
      },

      unlockHexDirect: (hexId) => {
        const state = get();
        if (state.unlockedHexes[hexId]) return;

        const newUnlockedHexes = { ...state.unlockedHexes, [hexId]: true };
        const newHexCount = state.totalHexesCount + 1;
        let newXp = state.xp + XP_PER_HEX;

        // Level up check
        let tempLevel = state.level;
        let xpNeeded = tempLevel * 150;
        while (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          tempLevel += 1;
          xpNeeded = tempLevel * 150;
        }

        const updatedQuests = state.quests.map((q) => {
          if (q.completed) return q;
          if (q.type === 'explore') {
            const progress = newHexCount;
            return { ...q, progress: Math.min(progress, q.target), completed: progress >= q.target };
          }
          return q;
        });

        const updatedAchievements = state.achievements.map((a) => {
          if (a.unlocked) return a;
          if (a.category === 'explore') {
            const progress = newHexCount;
            return { ...a, progress: Math.min(progress, a.target), unlocked: progress >= a.target };
          }
          return a;
        });

        set({
          unlockedHexes: newUnlockedHexes,
          totalHexesCount: newHexCount,
          xp: newXp,
          level: tempLevel,
          quests: updatedQuests,
          achievements: updatedAchievements,
        });

        try {
          Vibration.vibrate(60);
        } catch (e) {}
      },

      addSteps: (steps) => {
        const state = get();
        const newSteps = state.stepsToday + steps;

        const updatedQuests = state.quests.map((q) => {
          if (q.completed) return q;
          if (q.type === 'steps') {
            const progress = newSteps;
            return { ...q, progress: Math.min(progress, q.target), completed: progress >= q.target };
          }
          return q;
        });

        set({
          stepsToday: newSteps,
          quests: updatedQuests,
        });
      },

      claimQuestReward: (questId) => {
        const state = get();
        const quest = state.quests.find((q) => q.id === questId);
        if (!quest || !quest.completed || quest.claimed) return;

        let newXp = state.xp + quest.xpReward;
        let tempLevel = state.level;
        let xpNeeded = tempLevel * 150;

        while (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          tempLevel += 1;
          xpNeeded = tempLevel * 150;
        }

        const updatedQuests = state.quests.map((q) => {
          if (q.id === questId) {
            return { ...q, claimed: true };
          }
          return q;
        });

        // Claim Reward Bonus Coins!
        const newCoins = state.coins + 25; 

        set({
          xp: newXp,
          level: tempLevel,
          coins: newCoins,
          quests: updatedQuests,
        });
      },

      clearLastUnlockedCoupon: () => {
        set({ lastUnlockedCoupon: null });
      },

      setTheme: (theme) => {
        set({ activeTheme: theme });
      },

      resetProgress: () => {
        set({
          unlockedHexes: {},
          currentLocation: null,
          lastLocation: null,
          totalDistance: 0,
          totalHexesCount: 0,
          stepsToday: 0,
          streak: 0,
          lastActiveDate: null,
          xp: 0,
          level: 1,
          coins: 0,
          chests: getInitialChests(),
          lastUnlockedCoupon: null,
          quests: getInitialQuests(),
          achievements: getInitialAchievements(),
          isSimulatorActive: false,
          simulatorLocation: null,
        });
      },

      // Simulator Actions
      toggleSimulator: () => {
        const state = get();
        const nextActive = !state.isSimulatorActive;
        
        let simLoc = state.simulatorLocation;
        if (nextActive && !simLoc) {
          simLoc = state.currentLocation 
            ? { latitude: state.currentLocation.latitude, longitude: state.currentLocation.longitude }
            : { latitude: 19.432608, longitude: -99.133209 };
        }

        set({
          isSimulatorActive: nextActive,
          simulatorLocation: simLoc,
          lastLocation: nextActive ? null : state.lastLocation,
        });

        if (nextActive && simLoc) {
          get().updateLocation(simLoc.latitude, simLoc.longitude, 10);
        }
      },

      moveSimulator: (direction) => {
        const state = get();
        if (!state.isSimulatorActive || !state.simulatorLocation) return;

        const stepMeters = 25;
        const latDelta = stepMeters / 111111;
        const cosLat = Math.cos((state.simulatorLocation.latitude * Math.PI) / 180);
        const lngDelta = stepMeters / (111111 * cosLat);

        let newLat = state.simulatorLocation.latitude;
        let newLng = state.simulatorLocation.longitude;

        switch (direction) {
          case 'N':
            newLat += latDelta;
            break;
          case 'S':
            newLat -= latDelta;
            break;
          case 'E':
            newLng += lngDelta;
            break;
          case 'W':
            newLng -= lngDelta;
            break;
        }

        set({
          simulatorLocation: { latitude: newLat, longitude: newLng },
        });

        get().addSteps(35);
        get().updateLocation(newLat, newLng, 5);
      },

      teleportSimulator: (latitude, longitude) => {
        const state = get();
        set({
          simulatorLocation: { latitude, longitude },
          lastLocation: null,
        });
        
        if (state.isSimulatorActive) {
          get().updateLocation(latitude, longitude, 5);
        }
      },
    }),
    {
      name: 'hexwalk-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        unlockedHexes: state.unlockedHexes,
        totalDistance: state.totalDistance,
        totalHexesCount: state.totalHexesCount,
        stepsToday: state.stepsToday,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        xp: state.xp,
        level: state.level,
        coins: state.coins,
        chests: state.chests,
        lastUnlockedCoupon: state.lastUnlockedCoupon,
        quests: state.quests,
        achievements: state.achievements,
        activeTheme: state.activeTheme,
        simulatorLocation: state.simulatorLocation,
      }),
    }
  )
);
