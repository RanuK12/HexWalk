import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Pedometer } from 'expo-sensors';
import { useHexStore } from './useHexStore';

const BACKGROUND_LOCATION_TASK_NAME = 'hexwalk-background-location';

// Define the background task for GPS tracking
if (TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK_NAME) === false) {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK_NAME, async ({ data, error }: { data: any; error: any }) => {
    if (error) {
      console.error('Error en tarea de GPS background:', error);
      return;
    }
    if (data) {
      const { locations } = data as { locations: Location.LocationObject[] };
      if (locations && locations.length > 0) {
        const { latitude, longitude, accuracy } = locations[0].coords;
        // QA Senior Filter: Ignore GPS drifting (poor accuracy > 35 meters)
        if (accuracy !== null && accuracy > 35) {
          return;
        }
        // Directly update our Zustand store from the background thread
        useHexStore.getState().updateLocation(latitude, longitude, accuracy ?? undefined);
      }
    }
  });
}

export function useLocationTracker() {
  const updateLocation = useHexStore((state) => state.updateLocation);
  const addSteps = useHexStore((state) => state.addSteps);
  const isSimulatorActive = useHexStore((state) => state.isSimulatorActive);
  
  const [gpsPermission, setGpsPermission] = useState<string>('undetermined');
  const [stepPermission, setStepPermission] = useState<string>('undetermined');
  const [isTrackingBackground, setIsTrackingBackground] = useState(false);

  // 1. Setup Foreground Location Tracking
  useEffect(() => {
    let positionSubscription: Location.LocationSubscription | null = null;

    async function startForegroundTracking() {
      // If the simulator is active, we don't listen to real GPS to avoid conflicts
      if (isSimulatorActive) {
        if (positionSubscription) {
          positionSubscription.remove();
          positionSubscription = null;
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      setGpsPermission(status);
      if (status !== 'granted') return;

      // Start watching position
      positionSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 4000, // every 4 seconds
          distanceInterval: 8, // every 8 meters
        },
        (location) => {
          // QA Senior Filter: Ignore GPS drifting (poor accuracy > 35 meters)
          const accuracy = location.coords.accuracy;
          if (accuracy !== null && accuracy > 35) {
            return;
          }
          
          updateLocation(
            location.coords.latitude,
            location.coords.longitude,
            accuracy ?? undefined
          );
        }
      );
    }

    startForegroundTracking();

    return () => {
      if (positionSubscription) {
        positionSubscription.remove();
      }
    };
  }, [isSimulatorActive, updateLocation]);

  // 2. Setup Background Location Tracking Functionality
  const toggleBackgroundTracking = async (shouldTrack: boolean) => {
    if (isSimulatorActive) return;

    if (!shouldTrack) {
      const isRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
      }
      setIsTrackingBackground(false);
      return;
    }

    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      setGpsPermission(fgStatus);
      return;
    }

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      alert('Se requiere permiso de localización "Siempre" para el rastreo en segundo plano.');
      return;
    }

    try {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 8000,
        distanceInterval: 15,
        // Shows a persistent notification on Android when app is in background (crucial!)
        foregroundService: {
          notificationTitle: 'HexWalk está activo',
          notificationBody: 'Rastreando tu caminata y desbloqueando el mapa.',
          notificationColor: '#00F0FF',
        },
      });
      setIsTrackingBackground(true);
    } catch (err) {
      console.error('Error al iniciar rastreo background:', err);
    }
  };

  // 3. Setup Pedometer (Steps) Tracking
  useEffect(() => {
    let stepSubscription: any = null;
    let lastStepCount = 0;

    async function startPedometerTracking() {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        setStepPermission('unavailable');
        return;
      }

      const { status } = await Pedometer.requestPermissionsAsync();
      setStepPermission(status);
      if (status !== 'granted') return;

      stepSubscription = Pedometer.watchStepCount((result) => {
        // watchStepCount returns steps accumulated since subscription started
        const stepDelta = result.steps - lastStepCount;
        if (stepDelta > 0) {
          addSteps(stepDelta);
        }
        lastStepCount = result.steps;
      });
    }

    startPedometerTracking();

    return () => {
      if (stepSubscription) {
        stepSubscription.remove();
      }
    };
  }, [addSteps]);

  // Sync background status check on mount
  useEffect(() => {
    async function checkBackgroundStatus() {
      if (isSimulatorActive) {
        setIsTrackingBackground(false);
        return;
      }
      try {
        const isRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
        setIsTrackingBackground(isRegistered);
      } catch (e) {
        // Task might not be defined on web
        setIsTrackingBackground(false);
      }
    }
    checkBackgroundStatus();
  }, [isSimulatorActive]);

  return {
    gpsPermission,
    stepPermission,
    isTrackingBackground,
    toggleBackgroundTracking,
  };
}
