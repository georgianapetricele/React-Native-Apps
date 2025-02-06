import React, { useEffect, useState } from "react";
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
import { useRouter } from "expo-router"; // Use this for navigation
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Import MaterialIcons

const API_BASE_URL = "http://172.30.245.172:2506";
//const API_BASE_URL = "http://172.20.10.13:2505";// Adjust to your API endpoint
//const API_BASE_URL = "http://10.0.2.2:2505";

export default function AnalyticsScreen() {
  const router = useRouter();
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopItems();
  }, []);

  const fetchTopItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/allCourses`);

      const sortedItems = response.data
        .sort((a, b) => {
          const statusA = a.status.toLowerCase();
          const statusB = b.status.toLowerCase();

          if (statusA < statusB) return -1;
          if (statusA > statusB) return 1;

          // If statuses are the same, sort students in descending order
          return b.students - a.students;
        })
        .slice(0, 5);

      setTopItems(sortedItems);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Unable to fetch most popular items. Please try again later.");
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
            data={topItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.bookContainer}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.author}>Status: {item.status}</Text>
                <Text style={styles.author}>
                  Enrolled Students: {item.students || 0}
                </Text>
                <Text style={styles.author}>Instructor: {item.instructor}</Text>
                <Text style={styles.avgRating}>
                  Description: {item.description} / 5
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
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 30,
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
  bookContainer: {
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
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#a56600",
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
  avgRating: {
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
