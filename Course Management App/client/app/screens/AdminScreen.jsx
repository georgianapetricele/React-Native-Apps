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

const API_BASE_URL = "http://172.30.245.172:2506";
//const API_BASE_URL = "http://172.20.10.13:2505";
//const API_BASE_URL = "http://10.0.2.2:2505";
export default function AdminScreen() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch property interest data from the API
    const fetchPropertyInterest = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/interest`);
        const data = await response.data;
        //console.debug("Property interest data:", data);

        // Group the data by month and sum viewers
        const groupedData = groupAndSumViewers(data);
        setMonthlyData(groupedData);
      } catch (error) {
        console.error("Error fetching property interest data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyInterest();
  }, []);

  // Group data by month and sum viewers
  const groupAndSumViewers = (data) => {
    const grouped = {};

    data.forEach((entry) => {
      const month = new Date(entry.date).toISOString().slice(0, 7); // Format: "YYYY-MM"
      if (!grouped[month]) {
        grouped[month] = 0;
      }
      grouped[month] += entry.viewers;
    });

    // Convert grouped object to an array
    const groupedArray = Object.keys(grouped).map((month) => ({
      month,
      viewers: grouped[month],
    }));

    return groupedArray;
  };

  // Render each month in the list
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.month}</Text>
      <Text style={styles.viewersText}>Viewers: {item.viewers}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push("/screens/ListScreen")}
      >
        <MaterialIcons name="close" size={24} color="#5C3DAC" />
      </TouchableOpacity>
      <Text style={styles.header}>Admin: Property Interest by Month</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={monthlyData}
          renderItem={renderItem}
          keyExtractor={(item) => item.month}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  item: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewersText: {
    fontSize: 16,
    color: "#333",
  },
});
