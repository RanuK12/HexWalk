import { ThemeType } from '../hooks/useHexStore';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentSecondary: string;
  border: string;
  tint: string;
  success: string;
  mapStyle: any[];
}

export const Themes: Record<ThemeType, ThemeColors> = {
  cyberpunk: {
    background: '#0a0a0f',
    cardBackground: '#14141f',
    text: '#ffffff',
    textSecondary: '#8f92a1',
    accent: '#00f0ff', // neon cyan
    accentSecondary: '#ff007f', // neon pink
    border: '#222235',
    tint: '#00f0ff',
    success: '#39ff14', // neon green
    mapStyle: [
      { elementType: 'geometry', stylers: [{ color: '#0f0f15' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f15' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#7f8291' }] },
      { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#a0a2af' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#161622' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1f1f2e' }] },
      { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8f92a1' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b2b3d' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1c1c28' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#757788' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#ff007f', weight: 1.2 }] }, // highway in pink
      { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0a0a0f' }] },
      { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f2f45' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#002538' }] }, // water deep blue
      { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#00e5ff' }] }
    ]
  },
  synthwave: {
    background: '#120024', // retro purple
    cardBackground: '#24003d',
    text: '#ffffff',
    textSecondary: '#a595c2',
    accent: '#ff7c00', // retro orange
    accentSecondary: '#e0009c', // retro hot pink
    border: '#3d0061',
    tint: '#ff7c00',
    success: '#00ffc4',
    mapStyle: [
      { elementType: 'geometry', stylers: [{ color: '#1a082c' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a082c' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#8b6fb3' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#270c40' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#31124f' }] },
      { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#a384cf' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#44166d' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a082c' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#b697e0' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#ff7c00', weight: 1 }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0040' }] },
      { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#ff00c8' }] }
    ]
  },
  forest: {
    background: '#0b100d', // dark moss
    cardBackground: '#141c18',
    text: '#ecfdf5', // mint white
    textSecondary: '#839c8e',
    accent: '#10b981', // emerald green
    accentSecondary: '#f59e0b', // warm amber
    border: '#202e26',
    tint: '#10b981',
    success: '#34d399',
    mapStyle: [
      { elementType: 'geometry', stylers: [{ color: '#0f1712' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1712' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#688c77' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#17241d' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e3328' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#064e3b' }] }, // park dark green
      { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#10b981' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#273b30' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f1712' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#7da18c' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f59e0b', weight: 1 }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b1f28' }] },
      { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] }
    ]
  },
  minimalLight: {
    background: '#f8fafc', // clean light background
    cardBackground: '#ffffff',
    text: '#0f172a', // dark slate
    textSecondary: '#64748b', // slate grey
    accent: '#2563eb', // royal blue
    accentSecondary: '#4f46e5', // indigo
    border: '#e2e8f0',
    tint: '#2563eb',
    success: '#10b981',
    mapStyle: [
      { elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e2e8f0' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0f2fe' }] },
      { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0369a1' }] }
    ]
  }
};

/**
 * Custom hook to get the currently selected theme from the Zustand store.
 */
export function useGameTheme(): ThemeColors {
  const activeTheme = useHexStore((state) => state.activeTheme);
  return Themes[activeTheme] || Themes.cyberpunk;
}

// Simple export of useHexStore selector to make imports cleaner
import { useHexStore } from '../hooks/useHexStore';
