import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { useHexStore, Quest, Achievement } from '../hooks/useHexStore';
import { useGameTheme } from '../constants/Themes';
import { SymbolView } from 'expo-symbols';

export default function QuestsScreen() {
  const theme = useGameTheme();
  const [activeTab, setActiveTab] = useState<'quests' | 'achievements'>('quests');
  
  const { quests, achievements, claimQuestReward } = useHexStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Bitácora de Viaje</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Cumple desafíos y desbloquea insignias</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Pressable 
          style={[styles.tab, activeTab === 'quests' && { backgroundColor: theme.border }]}
          onPress={() => setActiveTab('quests')}
        >
          <SymbolView name="list.bullet.clipboard.fill" size={16} tintColor={activeTab === 'quests' ? theme.accent : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'quests' ? theme.text : theme.textSecondary }]}>Misiones</Text>
        </Pressable>

        <Pressable 
          style={[styles.tab, activeTab === 'achievements' && { backgroundColor: theme.border }]}
          onPress={() => setActiveTab('achievements')}
        >
          <SymbolView name="trophy.fill" size={16} tintColor={activeTab === 'achievements' ? theme.accentSecondary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'achievements' ? theme.text : theme.textSecondary }]}>Logros</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'quests' ? (
          quests.map((quest) => renderQuestCard(quest))
        ) : (
          achievements.map((achievement) => renderAchievementCard(achievement))
        )}
      </ScrollView>
    </SafeAreaView>
  );

  // --- RENDER QUEST CARD ---
  function renderQuestCard(quest: Quest) {
    const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);
    const unit = quest.type === 'explore' ? 'hexs' : quest.type === 'steps' ? 'pasos' : 'm';

    return (
      <View 
        key={quest.id} 
        style={[
          styles.card, 
          { backgroundColor: theme.cardBackground, borderColor: quest.completed && !quest.claimed ? theme.success : theme.border }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <SymbolView 
              name={quest.claimed ? "checkmark.circle.fill" : quest.completed ? "exclamationmark.circle.fill" : "circle"} 
              size={20} 
              tintColor={quest.claimed ? theme.textSecondary : quest.completed ? theme.success : theme.accent} 
            />
            <Text style={[styles.cardTitle, { color: quest.claimed ? theme.textSecondary : theme.text }]}>
              {quest.title}
            </Text>
          </View>
          <View style={[styles.rewardTag, { backgroundColor: `${theme.accent}15` }]}>
            <Text style={[styles.rewardText, { color: theme.accent }]}>+{quest.xpReward} XP</Text>
          </View>
        </View>

        <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{quest.description}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
              {quest.progress} / {quest.target} {unit}
            </Text>
            <Text style={[styles.progressLabel, { color: theme.accent }]}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.fill, 
                { 
                  width: `${progressPercent}%`, 
                  backgroundColor: quest.claimed ? theme.border : quest.completed ? theme.success : theme.accent 
                }
              ]} 
            />
          </View>
        </View>

        {/* Claiming button */}
        {quest.completed && !quest.claimed && (
          <Pressable 
            style={[styles.claimBtn, { backgroundColor: theme.success }]}
            onPress={() => claimQuestReward(quest.id)}
          >
            <SymbolView name="gift.fill" size={14} tintColor="#000000" />
            <Text style={styles.claimBtnText}>Reclamar Recompensa</Text>
          </Pressable>
        )}

        {quest.claimed && (
          <View style={styles.claimedTag}>
            <Text style={[styles.claimedText, { color: theme.textSecondary }]}>Completado y Reclamado</Text>
          </View>
        )}
      </View>
    );
  }

  // --- RENDER ACHIEVEMENT CARD ---
  function renderAchievementCard(ach: Achievement) {
    const progressPercent = Math.min((ach.progress / ach.target) * 100, 100);
    const categoryIcon = ach.category === 'explore' ? 'map.fill' : ach.category === 'distance' ? 'figure.walk' : 'flame.fill';

    return (
      <View 
        key={ach.id} 
        style={[
          styles.card, 
          { backgroundColor: theme.cardBackground, borderColor: ach.unlocked ? theme.accentSecondary : theme.border }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View 
              style={[
                styles.iconBox, 
                { backgroundColor: ach.unlocked ? `${theme.accentSecondary}1A` : `${theme.textSecondary}10` }
              ]}
            >
              <SymbolView 
                name={categoryIcon} 
                size={16} 
                tintColor={ach.unlocked ? theme.accentSecondary : theme.textSecondary} 
              />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: ach.unlocked ? theme.text : theme.textSecondary }]}>
                {ach.title}
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary, marginBottom: 0, fontSize: 12 }]}>
                {ach.description}
              </Text>
            </View>
          </View>
          {ach.unlocked && (
            <View style={[styles.unlockedBadge, { backgroundColor: `${theme.accentSecondary}20` }]}>
              <SymbolView name="star.fill" size={10} tintColor={theme.accentSecondary} />
              <Text style={[styles.unlockedBadgeText, { color: theme.accentSecondary }]}>Logrado</Text>
            </View>
          )}
        </View>

        {/* Progress bar for locked achievements */}
        {!ach.unlocked && (
          <View style={[styles.progressContainer, { marginTop: 15 }]}>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                Progreso: {ach.progress} / {ach.target}
              </Text>
              <Text style={[styles.progressLabel, { color: theme.accentSecondary }]}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: theme.border }]}>
              <View style={[styles.fill, { width: `${progressPercent}%`, backgroundColor: theme.accentSecondary }]} />
            </View>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 45,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  rewardTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    paddingLeft: 4,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 15,
    gap: 6,
  },
  claimBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  claimedTag: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  claimedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  unlockedBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});
