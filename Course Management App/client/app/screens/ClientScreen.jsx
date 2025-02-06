import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Property Types: ["apartment", "house", "commercial", "apartment", "house", "commercial", "apartment", "house", "commercial", "apartment"]artment", "house", "commercial", "apartment", "house", "commercial", "apa4-bedroom house with a large backyard", "id": 2, "name": "Spacious House", "status": "pending", "type": "rtment"]

const API_BASE_URL = "http://172.30.245.172:2506";
//const API_BASE_URL = "http://172.20.10.13:2505";
//const API_BASE_URL = "http://10.0.2.2:2505";

export default function ClientScreen() {
  const [stringList, setStringList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  const fetchPropertyTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/types`);
      setStringList(response.data);
      console.log("Property Types:", response.data);
    } catch (err) {
      console.error("Error fetching property types:", err);
      setError("Failed to load property types.");
      Alert.alert("Error", "Unable to fetch property types. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectItem = async (item) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/register/${item}`);
      Alert.alert("Success", `You have expressed interest in ${item}`);
      console.log("Interest registered:", response.data);
    } catch (err) {
      console.error("Error expressing interest:", err);
      Alert.alert("Error", "Could not express interest. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push("/screens/ListScreen")}
      >
        <MaterialIcons name="close" size={24} color="#5C3DAC" />
      </TouchableOpacity>
      <Text style={styles.title}>Property Types</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#a56600" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={stringList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => selectItem(item)}
            >
              <Text style={styles.propertyName}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#a56600",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff9eb",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    alignItems: "center",
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#a56600",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});
