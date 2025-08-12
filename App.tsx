import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  Dimensions,
} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import axios from 'axios';

interface Milestone {
  id: string;
  name: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  estimatedDuration: number;
  order: number;
  completed: boolean;
}

const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // If still used
const MAPBOX_ACCESS_TOKEN = 'pk.a08d339c51386947be9301c578fd99eb';

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function App() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);

  // Your existing search logic here (or replace with LocationIQ if you want)

  // ...

  // Coordinates for route line (GeoJSON format)
  const routeCoordinates = milestones
    .map((m) => [m.coordinates.longitude, m.coordinates.latitude])
    .filter((coord) => coord[0] !== 0 && coord[1] !== 0); // Filter invalid coords

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search and Add Milestones</Text>
      {/* Search UI */}
      {/* Your existing search input, button, list */}

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
          <MapboxGL.Camera
            zoomLevel={10}
            centerCoordinate={
              routeCoordinates.length > 0
                ? routeCoordinates[0]
                : [77.5946, 12.9716] // Default to Bangalore coords
            }
          />
          {milestones.map((m) => (
            <MapboxGL.PointAnnotation
              key={m.id}
              id={m.id}
              coordinate={[m.coordinates.longitude, m.coordinates.latitude]}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker} />
                <Text style={styles.markerText}>{m.order}</Text>
              </View>
              <MapboxGL.Callout title={`${m.name}\n${m.address}`} />
            </MapboxGL.PointAnnotation>
          ))}

          {routeCoordinates.length > 1 && (
            <MapboxGL.ShapeSource
              id="routeSource"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates,
                },
              }}
            >
              <MapboxGL.LineLayer
                id="routeFill"
                style={{
                  lineColor: '#007AFF',
                  lineWidth: 4,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </MapboxGL.ShapeSource>
          )}
        </MapboxGL.MapView>
      </View>

      {/* Your milestones list UI here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
  mapContainer: {
    height: Dimensions.get('window').height / 3,
    marginVertical: 10,
  },
  map: { flex: 1 },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    borderColor: '#fff',
    borderWidth: 2,
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    position: 'absolute',
    top: 2,
    left: 7,
  },
});
