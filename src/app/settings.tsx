import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert, StatusBar } from 'react-native';
import { useHexStore, ThemeType } from '../hooks/useHexStore';
import { useGameTheme, Themes } from '../constants/Themes';
import { SymbolView } from 'expo-symbols';

export default function SettingsScreen() {
  const theme = useGameTheme();
  
  const {
    activeTheme,
    setTheme,
    resetProgress,
    totalHexesCount,
    totalDistance,
    level
  } = useHexStore();

  const handleReset = () => {
    Alert.alert(
      'Reiniciar Progreso',
      '¿Estás seguro de que deseas borrar todos tus hexágonos desbloqueados y reiniciar tu nivel? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reiniciar Todo', 
          style: 'destructive',
          onPress: () => {
            resetProgress();
            alert('Progreso restablecido correctamente.');
          }
        }
      ]
    );
  };

  const THEME_OPTIONS: { id: ThemeType; name: string; icon: string; preview: string[] }[] = [
    { id: 'cyberpunk', name: 'Cyberpunk (Dark)', icon: 'sparkles', preview: ['#00f0ff', '#ff007f'] },
    { id: 'synthwave', name: 'Synthwave (Retro)', icon: 'sunset.fill', preview: ['#ff7c00', '#e0009c'] },
    { id: 'forest', name: 'Mundo Esmeralda', icon: 'tree.fill', preview: ['#10b981', '#f59e0b'] },
    { id: 'minimalLight', name: 'Luz Mínima (Light)', icon: 'sun.max.fill', preview: ['#2563eb', '#4f46e5'] },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Configuración</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Personaliza tu interfaz y mapas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Profile Stats Summary */}
        <View style={[styles.profileCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.avatar}>🧭</Text>
          <View style={styles.profileDetails}>
            <Text style={[styles.userName, { color: theme.text }]}>Explorador HexWalk</Text>
            <Text style={[styles.userLevel, { color: theme.accent }]}>Nivel {level} • Rango de Honor</Text>
          </View>
        </View>

        {/* Theme Selector */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Temas Visuales</Text>
        <View style={styles.themesList}>
          {THEME_OPTIONS.map((opt) => {
            const isSelected = activeTheme === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[
                  styles.themeRow, 
                  { 
                    backgroundColor: theme.cardBackground, 
                    borderColor: isSelected ? theme.accent : theme.border 
                  }
                ]}
                onPress={() => setTheme(opt.id)}
              >
                <View style={styles.themeLeft}>
                  <SymbolView name={opt.icon as any} size={16} tintColor={isSelected ? theme.accent : theme.textSecondary} />
                  <Text style={[styles.themeName, { color: theme.text, fontWeight: isSelected ? 'bold' : '500' }]}>
                    {opt.name}
                  </Text>
                </View>
                
                {/* Preview Dots */}
                <View style={styles.previewDots}>
                  {opt.preview.map((c, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                  ))}
                  {isSelected && (
                    <SymbolView name="checkmark.circle.fill" size={16} tintColor={theme.success} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Battery & GPS Info */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Rendimiento y Batería</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.infoRow}>
            <SymbolView name="battery.100" size={18} tintColor={theme.accent} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>Modo Bajo Consumo Activo</Text>
              <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>
                Nuestra geolocalización filtra señales rebotadas y duerme el GPS cuando estás quieto, reduciendo un 70% el gasto de batería en background.
              </Text>
            </View>
          </View>
        </View>

        {/* Premium / Monetization Banner */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Monetización</Text>
        <View style={[styles.premiumCard, { borderColor: theme.accentSecondary }]}>
          <View style={styles.premiumHeader}>
            <View style={[styles.premiumTag, { backgroundColor: `${theme.accentSecondary}1A` }]}>
              <SymbolView name="crown.fill" size={14} tintColor={theme.accentSecondary} />
              <Text style={[styles.premiumTagText, { color: theme.accentSecondary }]}>PRO MEMBER</Text>
            </View>
            <Text style={[styles.premiumPrice, { color: theme.text }]}>$2.99 / pago único</Text>
          </View>
          
          <Text style={[styles.premiumTitle, { color: theme.text }]}>Desbloquea HexWalk Pro</Text>
          <Text style={[styles.premiumDesc, { color: theme.textSecondary }]}>
            • Mapas sin anuncios{'\n'}
            • Exportación en formato GPX/KML{'\n'}
            • Estilos de mapa Satélite e Híbrido{'\n'}
            • Historial ilimitado de rutas y caminatas
          </Text>

          <Pressable style={[styles.buyBtn, { backgroundColor: theme.accentSecondary }]}>
            <Text style={styles.buyBtnText}>Comprar Suscripción Única</Text>
          </Pressable>
        </View>

        {/* Reset Progress */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Datos del Dispositivo</Text>
        <Pressable 
          style={[styles.resetBtn, { backgroundColor: '#ff003c20', borderColor: '#ff003c40' }]}
          onPress={handleReset}
        >
          <SymbolView name="trash.fill" size={16} tintColor="#ff003c" />
          <Text style={styles.resetBtnText}>Restablecer Todo el Progreso</Text>
        </Pressable>

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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 25,
    gap: 15,
  },
  avatar: {
    fontSize: 36,
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userLevel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  themesList: {
    gap: 12,
    marginBottom: 25,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeName: {
    fontSize: 13,
  },
  previewDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  premiumCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.01)',
    marginBottom: 25,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  premiumTagText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  premiumPrice: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  premiumDesc: {
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 16,
  },
  buyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  buyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  resetBtnText: {
    color: '#ff003c',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
