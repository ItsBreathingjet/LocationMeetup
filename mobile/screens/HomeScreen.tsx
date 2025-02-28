import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { calculateMidpoint, calculateDistance, fetchRoutes } from '../../client/src/lib/map-utils';

interface Location {
  lat: number;
  lon: number;
  name: string;
}

export default function HomeScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [midpoint, setMidpoint] = useState<{ latitude: number; longitude: number }>();
  const [searchText1, setSearchText1] = useState('');
  const [searchText2, setSearchText2] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (text: string, index: number) => {
    if (text.length < 3) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      setSearchResults(data.map((item: any) => ({
        ...item,
        index
      })));
    } catch (error) {
      console.error('Failed to search location:', error);
    }
  };

  const handleLocationSelect = async (location: Location, index: number) => {
    const newLocations = [...locations];
    newLocations[index] = location;
    if (newLocations.length > 2) newLocations.length = 2;

    setLocations(newLocations);
    setSearchResults([]);

    if (index === 0) {
      setSearchText1(location.name);
    } else {
      setSearchText2(location.name);
    }

    if (newLocations.length === 2) {
      const mid = calculateMidpoint(
        newLocations[0].lat,
        newLocations[0].lon,
        newLocations[1].lat,
        newLocations[1].lon
      );
      setMidpoint(mid);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 35.5,
          longitude: -80,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {locations.map((loc, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: loc.lat, longitude: loc.lon }}
            title={`Location ${index + 1}`}
            description={loc.name}
          />
        ))}
        {midpoint && (
          <Marker
            coordinate={{ latitude: midpoint.latitude, longitude: midpoint.longitude }}
            title="Midpoint"
            pinColor="red"
          />
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.label}>Location 1</Text>
          <TextInput
            style={styles.input}
            value={searchText1}
            onChangeText={(text) => {
              setSearchText1(text);
              handleSearch(text, 0);
            }}
            placeholder="Enter first location"
          />
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.label}>Location 2</Text>
          <TextInput
            style={styles.input}
            value={searchText2}
            onChangeText={(text) => {
              setSearchText2(text);
              handleSearch(text, 1);
            }}
            placeholder="Enter second location"
          />
        </View>

        {searchResults.length > 0 && (
          <ScrollView style={styles.resultsList}>
            {searchResults.map((result) => (
              <TouchableOpacity
                key={result.place_id}
                style={styles.resultItem}
                onPress={() => handleLocationSelect({
                  lat: parseFloat(result.lat),
                  lon: parseFloat(result.lon),
                  name: result.display_name,
                }, result.index)}
              >
                <Text numberOfLines={1}>{result.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBox: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2563eb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  resultsList: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 5,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
