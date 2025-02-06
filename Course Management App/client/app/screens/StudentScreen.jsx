import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const API_BASE_URL = "http://172.30.245.172:2506";
//const API_BASE_URL = "http://172.20.10.13:2505";
//const API_BASE_URL = "http://10.0.2.2:2505";

export default function StudentScreen() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/allCourses`);
      const readingBooks = response.data.filter(
        (book) => book.status.toLowerCase() === "ongoing"
      );
      setItems(readingBooks);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Unable to fetch items. Please try again later.");
    } finally {
      setLoading(false);
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.author}>Duration: {item.duration}</Text>
                <Text style={styles.author}>Status: {item.status}</Text>
                <Text style={styles.author}>
                  Enrolled students: {item.students || 0}
                </Text>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() =>
                    router.push(`/screens/DetailsScreen?id=${item.id}`)
                  }
                >
                  <MaterialIcons name="info" size={24} color="#a56600" />
                  <Text style={styles.detailsText}>Details</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  itemContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  author: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
  status: {
    fontSize: 14,
    color: "#777",
  },
  reviewCount: {
    fontSize: 14,
    color: "#777",
  },
  detailsButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  detailsText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#a56600",
  },
});
