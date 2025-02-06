import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo"; // For internet connectivity check
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://172.30.245.172:2506";
//const API_BASE_URL = "http://172.20.10.13:2505";
//const API_BASE_URL = "http://10.0.2.2:2505";

const DetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = () => {
      NetInfo.addEventListener((state) => {
        setIsOnline(state.isConnected);
      });
    };
    checkConnection();

    if (!id) return;

    const fetchItemDetails = async () => {
      try {
        setLoading(true); // Start loading when fetching begins
        console.debug("Fetching item details for id", id);
        console.log(isOnline);

        let item = null;

        if (isOnline) {
          // Make the Axios request only if online
          try {
            const response = await axios.get(`${API_BASE_URL}/course/${id}`);
            console.debug("Fetch item response from server", response.data);

            if (!response.data)
              throw new Error("Failed to fetch item from server");

            item = response.data; // Set item data
          } catch (networkError) {
            console.debug("Fetching item from local storage...");
            const localItemsString = await AsyncStorage.getItem("items");
            const localItems = localItemsString
              ? JSON.parse(localItemsString)
              : [];
            const parsedId = Number(id);
            item = localItems.find((item) => item.id === parsedId);
          }
        } else {
          console.debug("Fetching item from local storage...");
          const localItemsString = await AsyncStorage.getItem("items");
          const localItems = localItemsString
            ? JSON.parse(localItemsString)
            : [];
          const parsedId = Number(id);
          item = localItems.find((item) => item.id === parsedId);

          if (!item) {
            throw new Error("Item not found in local storage.");
          }
        }

        setItemDetails(item); // Set the fetched item data
        setLoading(false); // Stop loading once the data is fetched
      } catch (error) {
        console.error("Error fetching item:", error);
        setError(error.message); // Set error message
        setLoading(false); // Stop loading even in case of an error
      }
    };

    fetchItemDetails();
  }, [id, isOnline]); // Re-run effect if `id` or `isOnline` changes

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push("/screens/ListScreen")}
      >
        <Text style={{ fontSize: 18, color: "#a56600" }}>Close</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#a56600" />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : (
        <>
          <Text style={styles.title}>{itemDetails.name}</Text>

          <Text style={styles.sectionTitle}>Id</Text>
          <Text style={styles.text}>{itemDetails.id}</Text>

          <Text style={styles.sectionTitle}>Instructor</Text>
          <Text style={styles.text}>{itemDetails.instructor}</Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.text}>{itemDetails.description}</Text>

          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.text}>{itemDetails.status}</Text>

          <Text style={styles.sectionTitle}>Students</Text>
          <Text style={styles.text}>{itemDetails.students}</Text>

          <Text style={styles.sectionTitle}>Duration</Text>
          <Text style={styles.text}>{itemDetails.duration}</Text>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 30,
    fontFamily: "montserrat-bold",
    color: "#a56600",
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#a56600",
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default DetailsScreen;
