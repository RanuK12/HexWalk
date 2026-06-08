import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, StatusBar } from 'react-native';
import { useHexStore } from '../hooks/useHexStore';
import { useGameTheme } from '../constants/Themes';
import { SymbolView } from 'expo-symbols';

interface Explorer {
  name: string;
  level: number;
  hexs: number;
  isCurrentUser?: boolean;
  avatar: string;
}

export default function LeaderboardScreen() {
  const theme = useGameTheme();
  const { totalHexesCount, level, currentLocation, isSimulatorActive, simulatorLocation } = useHexStore();

  // Determine localized region name based on coordinates
  const getLeaderboardRegion = () => {
    const loc = isSimulatorActive ? simulatorLocation : currentLocation;
    if (!loc) return 'Tu Barrio';
    
    const lat = loc.latitude;
    const lng = loc.longitude;

    // Matching presets approximately
    if (Math.abs(lat - 19.432) < 0.1 && Math.abs(lng - -99.133) < 0.1) return 'CDMX Zócalo';
    if (Math.abs(lat - 40.416) < 0.1 && Math.abs(lng - -3.703) < 0.1) return 'Madrid Centro';
    if (Math.abs(lat - -34.608) < 0.1 && Math.abs(lng - -58.371) < 0.1) return 'Buenos Aires';
    if (Math.abs(lat - 41.387) < 0.1 && Math.abs(lng - 2.170) < 0.1) return 'Barcelona Centro';
    if (Math.abs(lat - 48.858) < 0.1 && Math.abs(lng - 2.294) < 0.1) return 'París, Francia';
    
    return 'Tu Zona Local';
  };

  // Generate fake local leaderboard list.
  // The user's stats are injected dynamically, and the list is sorted!
  const mockExplorers: Explorer[] = [
    { name: 'GigaExplorer', level: 12, hexs: 180, avatar: '👤' },
    { name: 'Caminante_Z', level: 8, hexs: 95, avatar: '🦊' },
    { name: 'Nómada_Alfa', level: 6, hexs: 72, avatar: '🐱' },
    { name: 'Luna_Vagabunda', level: 4, hexs: 34, avatar: '🐨' },
    { name: 'UrbanRunner', level: 3, hexs: 18, avatar: '🐼' },
  ];

  // Inject user
  const userExplorer: Explorer = {
    name: 'Tú (Explorador)',
    level: level,
    hexs: totalHexesCount,
    isCurrentUser: true,
    avatar: '🧭',
  };

  // Merge, sort by hexs descending, and determine rank
  const allExplorers = [...mockExplorers, userExplorer].sort((a, b) => b.hexs - a.hexs);

  // Split top 3 and others
  const top3 = allExplorers.slice(0, 3);
  const runnersUp = allExplorers.slice(3);

  // Sort top 3 as: Rank 2 (Left), Rank 1 (Center), Rank 3 (Right) for correct podium visual structure
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ explorer: top3[1], rank: 2 }); // Rank 2
  if (top3[0]) podiumOrder.push({ explorer: top3[0], rank: 1 }); // Rank 1
  if (top3[2]) podiumOrder.push({ explorer: top3[2], rank: 3 }); // Rank 3

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Clasificación</Text>
        <View style={styles.regionRow}>
          <SymbolView name="mappin.and.ellipse" size={13} tintColor={theme.accent} />
          <Text style={[styles.subtitle, { color: theme.accent }]}>{getLeaderboardRegion()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Visual Podium Section */}
        {podiumOrder.length > 0 && (
          <View style={styles.podiumContainer}>
            {podiumOrder.map(({ explorer, rank }) => {
              const height = rank === 1 ? 120 : rank === 2 ? 90 : 70;
              const color = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32'; // Gold, Silver, Bronze
              
              return (
                <View key={rank} style={[styles.podiumCol, { width: rank === 1 ? '36%' : '30%' }]}>
                  {/* Avatar */}
                  <View style={[styles.podiumAvatarWrapper, { borderColor: explorer.isCurrentUser ? theme.accent : color }]}>
                    <Text style={styles.podiumAvatar}>{explorer.avatar}</Text>
                    <View style={[styles.rankBadge, { backgroundColor: color }]}>
                      <Text style={styles.rankBadgeText}>{rank}</Text>
                    </View>
                  </View>

                  <Text style={[styles.podiumName, { color: theme.text }]} numberOfLines={1}>
                    {explorer.isCurrentUser ? 'Tú' : explorer.name}
                  </Text>
                  
                  <Text style={[styles.podiumHexs, { color: theme.textSecondary }]}>
                    {explorer.hexs} hexs
                  </Text>

                  {/* Column Graphic */}
                  <View 
                    style={[
                      styles.podiumBar, 
                      { 
                        height, 
                        backgroundColor: theme.cardBackground, 
                        borderColor: explorer.isCurrentUser ? theme.accent : theme.border 
                      }
                    ]}
                  >
                    <Text style={[styles.podiumBarText, { color }]}>Nvl {explorer.level}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Runners up List */}
        <Text style={[styles.listHeader, { color: theme.textSecondary }]}>Resto de Exploradores</Text>

        <View style={styles.list}>
          {runnersUp.map((explorer, index) => {
            const rank = index + 4;
            return (
              <View 
                key={explorer.name} 
                style={[
                  styles.listRow, 
                  { 
                    backgroundColor: explorer.isCurrentUser ? `${theme.accent}0A` : theme.cardBackground,
                    borderColor: explorer.isCurrentUser ? theme.accent : theme.border 
                  }
                ]}
              >
                <View style={styles.rowLeft}>
                  <Text style={[styles.rowRank, { color: theme.textSecondary }]}>#{rank}</Text>
                  <Text style={styles.rowAvatar}>{explorer.avatar}</Text>
                  <View>
                    <Text style={[styles.rowName, { color: theme.text, fontWeight: explorer.isCurrentUser ? 'bold' : '600' }]}>
                      {explorer.name}
                    </Text>
                    <Text style={[styles.rowLevel, { color: theme.textSecondary }]}>Nivel {explorer.level}</Text>
                  </View>
                </View>

                <View style={styles.rowRight}>
                  <Text style={[styles.rowHexs, { color: explorer.isCurrentUser ? theme.accent : theme.text }]}>
                    {explorer.hexs}
                  </Text>
                  <Text style={[styles.rowHexsLabel, { color: theme.textSecondary }]}>hexs</Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 25,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  podiumCol: {
    alignItems: 'center',
  },
  podiumAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 10,
    position: 'relative',
  },
  podiumAvatar: {
    fontSize: 28,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  podiumHexs: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
  },
  podiumBar: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  podiumBarText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  listHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  list: {
    gap: 12,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowRank: {
    fontSize: 13,
    fontWeight: 'bold',
    width: 26,
  },
  rowAvatar: {
    fontSize: 24,
  },
  rowName: {
    fontSize: 14,
  },
  rowLevel: {
    fontSize: 11,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowHexs: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rowHexsLabel: {
    fontSize: 9,
    fontWeight: '500',
  },
});
