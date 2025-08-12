import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

interface Milestone {
  id: string;
  name: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  order: number;
}

interface Props {
  milestones: Milestone[];
}

export default function MapViewComponent({ milestones }: Props) {
  // Coordinates must be [longitude, latitude] for Mapbox
  const routeCoordinates = milestones
    .map((m) => [m.coordinates.longitude, m.coordinates.latitude])
    .filter(([lng, lat]) => lng !== 0 && lat !== 0);

  return (
    <View style={styles.mapContainer}>
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
        <MapboxGL.Camera
          zoomLevel={10}
          centerCoordinate={
            routeCoordinates.length > 0
              ? routeCoordinates[0]
              : [77.5946, 12.9716] // Default Bangalore
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
              geometry: { type: 'LineString', coordinates: routeCoordinates },
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
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: Dimensions.get('window').height / 3,
    marginVertical: 10,
  },
  map: { flex: 1 },
  markerContainer: { alignItems: 'center' },
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
