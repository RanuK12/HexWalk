import React from 'react';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useGameTheme } from '../constants/Themes';

export default function AppTabs() {
  const theme = useGameTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1.5,
          paddingTop: 5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <SymbolView name="house.fill" size={20} tintColor={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <SymbolView name="map.fill" size={20} tintColor={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="quests"
        options={{
          title: 'Misiones',
          tabBarIcon: ({ color }) => (
            <SymbolView name="list.bullet.clipboard.fill" size={20} tintColor={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color }) => (
            <SymbolView name="trophy.fill" size={19} tintColor={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => (
            <SymbolView name="gearshape.fill" size={20} tintColor={color} />
          ),
        }}
      />
    </Tabs>
  );
}
