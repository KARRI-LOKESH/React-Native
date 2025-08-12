import React, { useState, useEffect, useRef } from 'react';
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
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';

interface Milestone {
  id: string;
  name: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  estimatedDuration: number; // in minutes
  order: number;
  completed: boolean;
}

const LOCATIONIQ_API_KEY = 'pk.a08d339c51386947be9301c578fd99eb'; // Replace with your API key

const initialRegion = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function App() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<MapView>(null);

  // Animate map to first milestone on update
  useEffect(() => {
    if (milestones.length > 0 && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: milestones[0].coordinates.latitude,
          longitude: milestones[0].coordinates.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        800
      );
    }
  }, [milestones]);

  // Debounce search input by 500ms
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim().length > 0) {
        searchLocation(searchText);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  // LocationIQ search API call
  const searchLocation = async (query: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search.php`,
        {
          params: {
            key: LOCATIONIQ_API_KEY,
            q: query,
            format: 'json',
            addressdetails: 1,
            limit: 5,
          },
        }
      );

      const places: Milestone[] = response.data.map(
        (place: any, index: number) => ({
          id: place.place_id || place.osm_id?.toString() || index.toString(),
          name: place.display_name.split(',')[0],
          address: place.display_name,
          coordinates: {
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon),
          },
          estimatedDuration: 30,
          order: milestones.length + index + 1,
          completed: false,
        })
      );

      setSearchResults(places);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch places.');
      setSearchResults([]);
    }
    setLoading(false);
  };

  // Add milestone to list
  const addMilestone = (milestone: Milestone) => {
    Keyboard.dismiss();

    if (milestones.length >= 10) {
      Alert.alert('Limit reached', 'Maximum 10 milestones allowed.');
      return;
    }
    if (milestones.find((m) => m.id === milestone.id)) {
      Alert.alert('Already added', 'This milestone is already in your list.');
      return;
    }

    setMilestones((prev) => [
      ...prev,
      { ...milestone, order: prev.length + 1, completed: false },
    ]);
    setSearchResults([]);
    setSearchText('');
  };

  // Remove milestone from list
  const removeMilestone = (id: string) => {
    if (milestones.length <= 3) {
      Alert.alert('Minimum milestones', 'At least 3 milestones are required.');
      return;
    }
    const updated = milestones.filter((m) => m.id !== id);
    const reordered = updated.map((m, index) => ({ ...m, order: index + 1 }));
    setMilestones(reordered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search and Add Milestones</Text>

      <TextInput
        style={styles.input}
        placeholder="Search places"
        value={searchText}
        onChangeText={setSearchText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      <Button
        title={loading ? 'Searching...' : 'Search'}
        onPress={() => searchLocation(searchText)}
        disabled={loading}
      />

      <FlatList
        keyboardShouldPersistTaps="handled"
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => addMilestone(item)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>{item.address}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          searchText && !loading ? (
            <Text style={styles.noResults}>No results found.</Text>
          ) : null
        }
        style={{ maxHeight: 200, marginBottom: 20 }}
      />

      <Text style={styles.title}>Your Milestones ({milestones.length})</Text>
      <FlatList
        data={milestones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.milestoneItem}>
            <Text style={styles.milestoneText}>
              {item.order}. {item.name} ({item.estimatedDuration} min)
            </Text>
            <Button
              title="Remove"
              onPress={() => removeMilestone(item.id)}
              disabled={milestones.length <= 3}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noResults}>No milestones added.</Text>
        }
      />

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {milestones.map((m) => (
            <Marker
              key={m.id}
              coordinate={{
                latitude: m.coordinates.latitude,
                longitude: m.coordinates.longitude,
              }}
              title={m.name}
              description={m.address}
            />
          ))}
          {milestones.length > 1 && (
            <Polyline
              coordinates={milestones.map((m) => m.coordinates)}
              strokeColor="#007AFF"
              strokeWidth={4}
            />
          )}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  name: { fontWeight: '600', fontSize: 16 },
  address: { color: '#555', fontSize: 12 },
  noResults: { padding: 10, color: '#888', fontStyle: 'italic' },
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  milestoneText: { flex: 1, fontSize: 16 },
  mapContainer: {
    height: Dimensions.get('window').height / 3,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: { flex: 1 },
});
