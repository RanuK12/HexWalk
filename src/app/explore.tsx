import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { useHexStore } from '../hooks/useHexStore';
import { useGameTheme } from '../constants/Themes';
import { getHexPolygon, getHexCenter, getDistance, DEFAULT_HEX_RADIUS } from '../utils/hexGrid';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { SymbolView } from 'expo-symbols';

// Import react-native-maps conditionally to prevent web crashes
let MapView: any;
let Polygon: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== 'web') {
  try {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default;
    Polygon = RNMaps.Polygon;
    Marker = RNMaps.Marker;
    PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('React Native Maps could not be loaded dynamically:', e);
  }
}

// Global presets for teleportation
const PRESETS = [
  { name: 'CDMX (Zócalo)', lat: 19.432608, lng: -99.133209 },
  { name: 'Madrid (Sol)', lat: 40.416775, lng: -3.703790 },
  { name: 'Buenos Aires', lat: -34.608056, lng: -58.371389 },
  { name: 'Barcelona (Pl. Cat)', lat: 41.387015, lng: 2.170047 },
  { name: 'París (Eiffel)', lat: 48.858370, lng: 2.294481 },
];

export default function ExploreScreen() {
  const theme = useGameTheme();
  
  // Geolocation and step sensor hook
  const { gpsPermission, toggleBackgroundTracking, isTrackingBackground } = useLocationTracker();

  // Zustand Store
  const {
    currentLocation,
    unlockedHexes,
    isSimulatorActive,
    simulatorLocation,
    toggleSimulator,
    moveSimulator,
    teleportSimulator,
    updateLocation,
    chests,
    coins,
    lastUnlockedCoupon,
    clearLastUnlockedCoupon,
  } = useHexStore();

  const [mapReady, setMapReady] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [isAutoWalking, setIsAutoWalking] = useState(false);
  const autoWalkInterval = useRef<any>(null);
  const mapRef = useRef<any>(null);

  // Active coordinates (either GPS or Simulator)
  const activeCoords = isSimulatorActive 
    ? (simulatorLocation || { latitude: 19.432608, longitude: -99.133209 })
    : currentLocation 
      ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
      : null;

  // Handle auto-walk simulation
  useEffect(() => {
    if (isAutoWalking && isSimulatorActive) {
      // Directions cycle: N, N, E, E, S, S, W, W to walk in a loop
      const dirs: ('N' | 'E' | 'S' | 'W')[] = ['N', 'N', 'E', 'E', 'S', 'S', 'W', 'W'];
      let index = 0;
      
      autoWalkInterval.current = setInterval(() => {
        const dir = dirs[index % dirs.length];
        moveSimulator(dir);
        index++;
      }, 1500); // Move every 1.5 seconds
    } else {
      if (autoWalkInterval.current) {
        clearInterval(autoWalkInterval.current);
        autoWalkInterval.current = null;
      }
    }

    return () => {
      if (autoWalkInterval.current) {
        clearInterval(autoWalkInterval.current);
      }
    };
  }, [isAutoWalking, isSimulatorActive, moveSimulator]);

  // Center map on coordinates when ready or when simulator teleports
  useEffect(() => {
    if (mapReady && mapRef.current && activeCoords) {
      mapRef.current.animateToRegion({
        latitude: activeCoords.latitude,
        longitude: activeCoords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, [mapReady, activeCoords?.latitude, activeCoords?.longitude]);

  // Fallback map trigger for web or first location load
  useEffect(() => {
    // If we have no location, trigger a default location to boot the map
    if (!activeCoords) {
      // Boot default location CDMX
      updateLocation(19.432608, -99.133209, 10);
    }
  }, []);

  // Filter and compute hexagons to render:
  // Render only unlocked hexes within 1.2km of the active center to maintain 60fps performance!
  const renderedHexes = Object.keys(unlockedHexes)
    .map((key) => {
      const [qStr, rStr] = key.split('_');
      const q = parseInt(qStr, 10);
      const r = parseInt(rStr, 10);
      const center = getHexCenter(q, r, DEFAULT_HEX_RADIUS);
      return { key, q, r, center };
    })
    .filter((hex) => {
      if (!activeCoords) return false;
      const dist = getDistance(
        activeCoords.latitude,
        activeCoords.longitude,
        hex.center.latitude,
        hex.center.longitude
      );
      return dist < 1200; // 1.2 kilometers radius
    });

  // Handle manual location refresh / centering
  const centerMap = () => {
    if (activeCoords && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: activeCoords.latitude,
        longitude: activeCoords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }, 800);
    }
  };

  const handleTeleport = (preset: { lat: number, lng: number }) => {
    teleportSimulator(preset.lat, preset.lng);
    setShowPresets(false);
  };

  // --- RENDER WEB MOCK MAP ---
  if (Platform.OS === 'web') {
    // A stylized interactive canvas mockup that works in standard browser
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.webFallbackContainer}>
          <Text style={[styles.webTitle, { color: theme.text }]}>Modo Exploración (Web Demo)</Text>
          <Text style={[styles.webSubtitle, { color: theme.textSecondary }]}>
            El mapa nativo requiere Android o iOS. En web puedes probar la lógica del juego con la cuadrícula de simulación a continuación.
          </Text>

          {/* Stylized Grid Showcase */}
          <View style={[styles.webGridContainer, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            {/* Draw a grid of hex circles to simulate exploration */}
            <View style={styles.webGrid}>
              {PRESETS.map((p, idx) => (
                <Pressable
                  key={idx}
                  style={[
                    styles.webHexButton,
                    {
                      borderColor: theme.border,
                      backgroundColor: activeCoords && Math.abs(activeCoords.latitude - p.lat) < 0.1 ? theme.accent : 'transparent'
                    }
                  ]}
                  onPress={() => teleportSimulator(p.lat, p.lng)}
                >
                  <Text style={[styles.webHexText, { color: activeCoords && Math.abs(activeCoords.latitude - p.lat) < 0.1 ? '#000' : theme.text }]}>
                    {p.name.split(' ')[0]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.webLocationDisplay}>
              <SymbolView name="location.fill" size={16} tintColor={theme.accent} />
              <Text style={[styles.webCoordsText, { color: theme.textSecondary }]}>
                Coordenadas actuales: {activeCoords?.latitude.toFixed(5)}, {activeCoords?.longitude.toFixed(5)}
              </Text>
            </View>
          </View>
        </View>

        {/* Floating Simulator Panel */}
        {renderSimulatorPanel()}

        {/* Floating Coins Indicator */}
        <View style={styles.topLeftControls}>
          <View style={[styles.coinIndicator, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <SymbolView name={"dollarsign.circle.fill" as any} size={16} tintColor="#FFD700" />
            <Text style={[styles.coinText, { color: theme.text }]}>{coins}</Text>
          </View>
        </View>

        {/* Coupon Modal Popup */}
        {lastUnlockedCoupon && (
          <View style={[styles.couponModalBackdrop, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
            <View style={[styles.couponModal, { backgroundColor: theme.cardBackground, borderColor: theme.accentSecondary }]}>
              <View style={[styles.couponHeaderIcon, { backgroundColor: `${theme.accentSecondary}20` }]}>
                <SymbolView name="gift.fill" size={32} tintColor={theme.accentSecondary} />
              </View>
              <Text style={[styles.couponModalTitle, { color: theme.text }]}>¡Cofre Desbloqueado!</Text>
              <Text style={[styles.couponModalSponsor, { color: theme.accent }]}>{lastUnlockedCoupon.sponsorName}</Text>
              <Text style={[styles.couponModalOffer, { color: theme.text }]}>{lastUnlockedCoupon.coupon}</Text>
              <Text style={[styles.couponModalInstruction, { color: theme.textSecondary }]}>
                Muestra esta pantalla al pagar en el establecimiento o ingresa el código **HEXWALK15** en su web.
              </Text>
              <Pressable 
                style={[styles.couponCloseBtn, { backgroundColor: theme.accentSecondary }]}
                onPress={clearLastUnlockedCoupon}
              >
                <Text style={styles.couponCloseBtnText}>¡Excelente, gracias!</Text>
              </Pressable>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // --- RENDER NATIVE MAP ---
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!activeCoords ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Esperando señal de GPS...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: activeCoords.latitude,
            longitude: activeCoords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          customMapStyle={theme.mapStyle}
          showsUserLocation={!isSimulatorActive}
          showsMyLocationButton={false}
          onMapReady={() => setMapReady(true)}
        >
          {/* Render simulator marker if simulator is active */}
          {isSimulatorActive && activeCoords && (
            <Marker
              coordinate={{
                latitude: activeCoords.latitude,
                longitude: activeCoords.longitude,
              }}
              title="Simulador GPS"
              description="Ubicación simulada de caminata"
            >
              <View style={[styles.pulseMarker, { backgroundColor: theme.accent }]}>
                <View style={[styles.pulseOuter, { borderColor: theme.accent }]} />
              </View>
            </Marker>
          )}

          {/* Draw all unlocked hexagons close to the user */}
          {renderedHexes.map((hex) => {
            const vertices = getHexPolygon(hex.q, hex.r, DEFAULT_HEX_RADIUS);
            return (
              <Polygon
                key={hex.key}
                coordinates={vertices}
                fillColor={`${theme.accent}1F`} // 12% opacity fill
                strokeColor={theme.accent}
                strokeWidth={1.5}
              />
            );
          })}

          {/* Draw all unclaimed sponsored chests */}
          {chests.filter((c: any) => !c.claimed).map((chest: any) => (
            <Marker
              key={chest.id}
              coordinate={{
                latitude: chest.latitude,
                longitude: chest.longitude,
              }}
              title={chest.sponsorName}
              description="¡Camina aquí para abrir el cofre!"
            >
              <View style={[styles.chestMarker, { borderColor: theme.accentSecondary, backgroundColor: theme.cardBackground }]}>
                <Text style={styles.chestEmoji}>🎁</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Floating Buttons: Recenter & GPS Status */}
      <View style={styles.topRightControls}>
        <Pressable 
          style={[styles.floatingCircleBtn, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={centerMap}
        >
          <SymbolView name="location.fill" size={18} tintColor={theme.accent} />
        </Pressable>

        <Pressable 
          style={[
            styles.floatingCircleBtn, 
            { 
              backgroundColor: isTrackingBackground ? theme.accent : theme.cardBackground, 
              borderColor: theme.border 
            }
          ]}
          onPress={() => toggleBackgroundTracking(!isTrackingBackground)}
        >
          <SymbolView 
            name={isTrackingBackground ? "bolt.fill" : "bolt.slash"} 
            size={18} 
            tintColor={isTrackingBackground ? "#000" : theme.textSecondary} 
          />
        </Pressable>
      </View>

      {/* Floating Simulator Panel */}
      {renderSimulatorPanel()}

      {/* Floating Coins Indicator */}
      <View style={styles.topLeftControls}>
        <View style={[styles.coinIndicator, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <SymbolView name={"dollarsign.circle.fill" as any} size={16} tintColor="#FFD700" />
          <Text style={[styles.coinText, { color: theme.text }]}>{coins}</Text>
        </View>
      </View>

      {/* Coupon Modal Popup */}
      {lastUnlockedCoupon && (
        <View style={[styles.couponModalBackdrop, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
          <View style={[styles.couponModal, { backgroundColor: theme.cardBackground, borderColor: theme.accentSecondary }]}>
            <View style={[styles.couponHeaderIcon, { backgroundColor: `${theme.accentSecondary}20` }]}>
              <SymbolView name="gift.fill" size={32} tintColor={theme.accentSecondary} />
            </View>
            <Text style={[styles.couponModalTitle, { color: theme.text }]}>¡Cofre Desbloqueado!</Text>
            <Text style={[styles.couponModalSponsor, { color: theme.accent }]}>{lastUnlockedCoupon.sponsorName}</Text>
            <Text style={[styles.couponModalOffer, { color: theme.text }]}>{lastUnlockedCoupon.coupon}</Text>
            <Text style={[styles.couponModalInstruction, { color: theme.textSecondary }]}>
              Muestra esta pantalla al pagar en el establecimiento o ingresa el código **HEXWALK15** en su web.
            </Text>
            <Pressable 
              style={[styles.couponCloseBtn, { backgroundColor: theme.accentSecondary }]}
              onPress={clearLastUnlockedCoupon}
            >
              <Text style={styles.couponCloseBtnText}>¡Excelente, gracias!</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  // --- FLOATING SIMULATOR PANEL ---
  function renderSimulatorPanel() {
    return (
      <View style={[styles.simulatorPanel, { backgroundColor: `${theme.cardBackground}E0`, borderColor: theme.border }]}>
        
        {/* Toggle Bar */}
        <View style={styles.simHeader}>
          <View style={styles.simTitleRow}>
            <View style={[styles.indicator, { backgroundColor: isSimulatorActive ? theme.success : theme.textSecondary }]} />
            <Text style={[styles.simTitle, { color: theme.text }]}>Simulador GPS (Pruebas)</Text>
          </View>
          <Pressable 
            style={[styles.toggleBtn, { backgroundColor: isSimulatorActive ? theme.accentSecondary : theme.border }]}
            onPress={() => {
              toggleSimulator();
              setIsAutoWalking(false);
            }}
          >
            <Text style={[styles.toggleBtnText, { color: isSimulatorActive ? '#ffffff' : theme.text }]}>
              {isSimulatorActive ? 'Apagar' : 'Encender'}
            </Text>
          </Pressable>
        </View>

        {isSimulatorActive && (
          <View style={styles.simControls}>
            
            {/* Direction Arrows */}
            <View style={styles.controlRow}>
              <View style={styles.dpad}>
                <View style={styles.dpadRow}>
                  <Pressable style={[styles.arrowBtn, { backgroundColor: theme.border }]} onPress={() => moveSimulator('N')}>
                    <SymbolView name="chevron.up" size={16} tintColor={theme.text} />
                  </Pressable>
                </View>
                <View style={styles.dpadRowHoriz}>
                  <Pressable style={[styles.arrowBtn, { backgroundColor: theme.border }]} onPress={() => moveSimulator('W')}>
                    <SymbolView name="chevron.left" size={16} tintColor={theme.text} />
                  </Pressable>
                  <View style={styles.dpadCenter}>
                    <SymbolView name="figure.walk" size={14} tintColor={theme.accent} />
                  </View>
                  <Pressable style={[styles.arrowBtn, { backgroundColor: theme.border }]} onPress={() => moveSimulator('E')}>
                    <SymbolView name="chevron.right" size={16} tintColor={theme.text} />
                  </Pressable>
                </View>
                <View style={styles.dpadRow}>
                  <Pressable style={[styles.arrowBtn, { backgroundColor: theme.border }]} onPress={() => moveSimulator('S')}>
                    <SymbolView name="chevron.down" size={16} tintColor={theme.text} />
                  </Pressable>
                </View>
              </View>

              {/* Auto Walk & Teleport Actions */}
              <View style={styles.simActions}>
                {/* Auto Walk Toggle */}
                <Pressable
                  style={[
                    styles.actionBtn, 
                    { 
                      backgroundColor: isAutoWalking ? theme.success : theme.border,
                      borderColor: isAutoWalking ? 'transparent' : theme.border 
                    }
                  ]}
                  onPress={() => setIsAutoWalking(!isAutoWalking)}
                >
                  <SymbolView name={isAutoWalking ? "pause.fill" : "play.fill"} size={14} tintColor={isAutoWalking ? '#000000' : theme.text} />
                  <Text style={[styles.actionBtnText, { color: isAutoWalking ? '#000000' : theme.text }]}>
                    {isAutoWalking ? 'Pausar Auto' : 'Auto Caminata'}
                  </Text>
                </Pressable>

                {/* Teleport Dropdown Toggle */}
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: theme.border, borderColor: theme.border }]}
                  onPress={() => setShowPresets(!showPresets)}
                >
                  <SymbolView name="paperplane.fill" size={12} tintColor={theme.accent} />
                  <Text style={[styles.actionBtnText, { color: theme.text }]}>Teletransporte</Text>
                </Pressable>
              </View>
            </View>

            {/* Presets List */}
            {showPresets && (
              <View style={[styles.presetsDropdown, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.presetsTitle, { color: theme.textSecondary }]}>Selecciona un destino:</Text>
                {PRESETS.map((preset, i) => (
                  <Pressable
                    key={i}
                    style={[styles.presetItem, { borderBottomColor: theme.border }]}
                    onPress={() => handleTeleport(preset)}
                  >
                    <Text style={[styles.presetItemText, { color: theme.text }]}>{preset.name}</Text>
                    <Text style={[styles.presetItemCoords, { color: theme.textSecondary }]}>
                      {preset.lat.toFixed(3)}, {preset.lng.toFixed(3)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.infoFooter}>
              <Text style={[styles.coordsText, { color: theme.textSecondary }]}>
                Simulación: {activeCoords?.latitude.toFixed(6)}, {activeCoords?.longitude.toFixed(6)}
              </Text>
              <Text style={[styles.hintText, { color: theme.accent }]}>
                * Cada click avanza 25m y simula 35 pasos.
              </Text>
            </View>

          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  topRightControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 20,
    gap: 12,
    zIndex: 10,
  },
  floatingCircleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pulseMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    opacity: 0.4,
  },
  simulatorPanel: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 16,
    right: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  simHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  simTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  simControls: {
    marginTop: 15,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dpad: {
    width: 120,
    alignItems: 'center',
  },
  dpadRow: {
    height: 36,
    justifyContent: 'center',
  },
  dpadRowHoriz: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dpadCenter: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simActions: {
    flex: 1,
    marginLeft: 20,
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  presetsDropdown: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 150,
    overflow: 'scroll',
    padding: 8,
  },
  presetsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  presetItemText: {
    fontSize: 12,
    fontWeight: '600',
  },
  presetItemCoords: {
    fontSize: 10,
  },
  infoFooter: {
    marginTop: 12,
    alignItems: 'center',
    gap: 2,
  },
  coordsText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 9,
    fontWeight: '500',
  },
  // Web Fallback styles
  webFallbackContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  webSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    maxWidth: 500,
  },
  webGridContainer: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  webGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  webHexButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webHexText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  webLocationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  webCoordsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chestMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  chestEmoji: {
    fontSize: 16,
  },
  topLeftControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    zIndex: 10,
  },
  coinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  coinText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  couponModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  couponModal: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  couponHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  couponModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  couponModalSponsor: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  couponModalOffer: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  couponModalInstruction: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  couponCloseBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  couponCloseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
