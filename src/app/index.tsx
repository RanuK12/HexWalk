import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { useHexStore } from '../hooks/useHexStore';
import { useGameTheme } from '../constants/Themes';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const theme = useGameTheme();
  
  // Zustand state
  const {
    level,
    xp,
    totalHexesCount,
    totalDistance,
    stepsToday,
    streak,
    quests,
    coins,
  } = useHexStore();

  // Next level formula: level * 150
  const xpNeeded = level * 150;
  const xpPercentage = Math.min((xp / xpNeeded) * 100, 100);

  // Get rank title based on level
  const getRankTitle = (lvl: number) => {
    if (lvl < 2) return 'Nómada Novato';
    if (lvl < 5) return 'Cartógrafo Local';
    if (lvl < 10) return 'Rastreador de Calles';
    if (lvl < 15) return 'Explorador Urbano';
    if (lvl < 20) return 'Conquistador de Asfalto';
    return 'Explorador Legendario';
  };

  // Format total distance
  const formattedDistance = (totalDistance / 1000).toFixed(2); // in km

  // Find nearest incomplete quest
  const activeQuest = quests.find(q => !q.completed) || quests[quests.length - 1];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>Bienvenido de vuelta,</Text>
            <View style={styles.userRow}>
              <Text style={[styles.userName, { color: theme.text }]}>Explorador 🧭</Text>
              <View style={[styles.walletChip, { backgroundColor: `${theme.accent}12`, borderColor: theme.border }]}>
                <SymbolView name={"dollarsign.circle.fill" as any} size={13} tintColor="#FFD700" />
                <Text style={[styles.walletCoins, { color: theme.text }]}>{coins}</Text>
              </View>
            </View>
          </View>
          <Pressable 
            style={[styles.settingsButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => router.push('/settings')}
          >
            <SymbolView name="gearshape" size={20} tintColor={theme.accent} />
          </Pressable>
        </View>

        {/* Level & XP Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={[styles.levelLabel, { color: theme.textSecondary }]}>NIVEL ACTUAL</Text>
              <Text style={[styles.levelValue, { color: theme.accent }]}>{level}</Text>
            </View>
            <View style={styles.rankContainer}>
              <Text style={[styles.rankTitle, { color: theme.accentSecondary }]}>{getRankTitle(level)}</Text>
            </View>
          </View>

          {/* XP Bar */}
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarLabels}>
              <Text style={[styles.xpText, { color: theme.textSecondary }]}>{xp} / {xpNeeded} XP</Text>
              <Text style={[styles.xpPercentText, { color: theme.textSecondary }]}>{Math.round(xpPercentage)}%</Text>
            </View>
            <View style={[styles.xpTrack, { backgroundColor: theme.border }]}>
              <View style={[styles.xpFill, { width: `${xpPercentage}%`, backgroundColor: theme.accent }]} />
            </View>
          </View>
        </View>

        {/* Stat Grid */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tus Estadísticas</Text>
        
        <View style={styles.grid}>
          {/* Steps Today */}
          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={[styles.iconWrapper, { backgroundColor: `${theme.accent}15` }]}>
              <SymbolView name="shoeprints.fill" size={22} tintColor={theme.accent} />
            </View>
            <Text style={[styles.gridCardValue, { color: theme.text }]}>{stepsToday}</Text>
            <Text style={[styles.gridCardLabel, { color: theme.textSecondary }]}>Pasos Hoy</Text>
          </View>

          {/* Unlocked Hexes */}
          <Pressable 
            style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => router.push('/explore')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: `${theme.accentSecondary}15` }]}>
              <SymbolView name="map.fill" size={22} tintColor={theme.accentSecondary} />
            </View>
            <Text style={[styles.gridCardValue, { color: theme.text }]}>{totalHexesCount}</Text>
            <Text style={[styles.gridCardLabel, { color: theme.textSecondary }]}>Hexágonos</Text>
          </Pressable>

          {/* Distance Walked */}
          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={[styles.iconWrapper, { backgroundColor: `${theme.accent}15` }]}>
              <SymbolView name="figure.walk" size={22} tintColor={theme.accent} />
            </View>
            <Text style={[styles.gridCardValue, { color: theme.text }]}>{formattedDistance} km</Text>
            <Text style={[styles.gridCardLabel, { color: theme.textSecondary }]}>Distancia</Text>
          </View>

          {/* Streak */}
          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={[styles.iconWrapper, { backgroundColor: `${theme.accentSecondary}15` }]}>
              <SymbolView name="flame.fill" size={22} tintColor={theme.accentSecondary} />
            </View>
            <Text style={[styles.gridCardValue, { color: theme.text }]}>{streak} {streak === 1 ? 'día' : 'días'}</Text>
            <Text style={[styles.gridCardLabel, { color: theme.textSecondary }]}>Racha Activa</Text>
          </View>
        </View>

        {/* Current Quest Widget */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Misión Activa</Text>

        {activeQuest && (
          <Pressable 
            style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => router.push('/quests')}
          >
            <View style={styles.questHeader}>
              <View style={styles.questTitleContainer}>
                <SymbolView 
                  name={activeQuest.completed ? "checkmark.circle.fill" : "circle"} 
                  size={20} 
                  tintColor={activeQuest.completed ? theme.success : theme.accent} 
                />
                <Text style={[styles.questTitle, { color: theme.text }]}>{activeQuest.title}</Text>
              </View>
              <View style={[styles.xpRewardTag, { backgroundColor: `${theme.accent}15` }]}>
                <Text style={[styles.xpRewardText, { color: theme.accent }]}>+{activeQuest.xpReward} XP</Text>
              </View>
            </View>
            
            <Text style={[styles.questDesc, { color: theme.textSecondary }]}>{activeQuest.description}</Text>

            {/* Quest Progress Bar */}
            <View style={styles.questProgressContainer}>
              <View style={styles.questProgressLabels}>
                <Text style={[styles.questProgressText, { color: theme.textSecondary }]}>
                  Progreso: {activeQuest.progress} / {activeQuest.target} {activeQuest.type === 'explore' ? 'hexs' : activeQuest.type === 'steps' ? 'pasos' : 'm'}
                </Text>
                <Text style={[styles.questProgressText, { color: theme.accent }]}>
                  {Math.round((activeQuest.progress / activeQuest.target) * 100)}%
                </Text>
              </View>
              <View style={[styles.xpTrack, { backgroundColor: theme.border }]}>
                <View 
                  style={[
                    styles.xpFill, 
                    { 
                      width: `${Math.min((activeQuest.progress / activeQuest.target) * 100, 100)}%`, 
                      backgroundColor: activeQuest.completed ? theme.success : theme.accent 
                    }
                  ]} 
                />
              </View>
            </View>

            {activeQuest.completed && !activeQuest.claimed && (
              <View style={styles.claimButtonContainer}>
                <Text style={[styles.claimHint, { color: theme.success }]}>¡Misión Completada!</Text>
                <Text style={[styles.claimActionText, { color: theme.accentSecondary }]}>Reclama tu premio en la pestaña de Misiones →</Text>
              </View>
            )}
          </Pressable>
        )}

        {/* Start Exploring Banner */}
        <Pressable 
          style={[styles.banner, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/explore')}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>¡Sal a explorar tu barrio! 🏃‍♂️</Text>
            <Text style={styles.bannerSubtitle}>Abre el mapa interactivo y comienza a desbloquear hexágonos.</Text>
          </View>
          <SymbolView name="chevron.right" size={24} tintColor="#000000" />
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  levelValue: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
  },
  rankContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  xpBarContainer: {
    marginTop: 5,
  },
  xpBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpPercentText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridCard: {
    width: '47%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gridCardLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpRewardTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpRewardText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  questDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 15,
  },
  questProgressContainer: {
    marginTop: 5,
  },
  questProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  questProgressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  claimButtonContainer: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  claimHint: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  claimActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  banner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  bannerContent: {
    flex: 1,
    marginRight: 15,
  },
  bannerTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  walletCoins: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
