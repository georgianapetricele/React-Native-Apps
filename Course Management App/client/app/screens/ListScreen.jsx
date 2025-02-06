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
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo"; // Check online status
import axios from "axios";
import { useRouter } from "expo-router"; // Use this for navigation
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Import MaterialIcons
import WebSocketClient from "../WebSocketClient"; // Import WebSocketClient

const API_BASE_URL = "http://172.30.245.172:2506";
//const API_BASE_URL = "http://172.20.10.13:2505"; // Adjust to your API endpoint
//const API_BASE_URL = "http://10.0.2.2:2505";

export default function ListScreen() {
  const router = useRouter(); // Initialize router
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showRetry, setShowRetry] = useState(false); // State to show retry button
  const [alertShown, setAlertShown] = useState(false); // State to track if alert has been shown
  const [wasOffline, setWasOffline] = useState(false);

  const handleWebSocketMessage = (data) => {
    try {
      const item = JSON.parse(data);
      //console.debug("New item added:", item);

      Alert.alert(
        "New Item Added",
        `Course: ${item.name}\nInstructor: ${item.instructor}\nDescription: ${item.description}`,
        [{ text: "Dismiss" }]
      );
    } catch (error) {
      console.debug("Error parsing WebSocket message:", error);
    }
  };
    // useEffect(() => {
    //   clearStorage();
    // }, []);

    // const clearStorage = async () => {
    //   try {
    //     await AsyncStorage.clear();
    //     console.log("AsyncStorage cleared successfully!");
    //   } catch (error) {
    //     console.error("Error clearing AsyncStorage:", error);
    //   }
    // };

  WebSocketClient(handleWebSocketMessage);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);

      if (!state.isConnected) {
        //setWasOffline(true);
        setShowRetry(true);
        if (!alertShown) {
          Alert.alert(
            "Offline",
            "You are offline. Please check your connection."
          );
          setAlertShown(true);
        }
      } else {
        setShowRetry(false);
        setAlertShown(false);

        // Sync only if the app was offline before
        // if (wasOffline) {
        //   syncOfflineItems();
        //   setWasOffline(false); // Reset after sync
        // }
      }
    });

    return () => unsubscribe();
  }, [alertShown]);
  //   }, [alertShown, wasOffline]);

  useEffect(() => {
    loadItems();
  }, []);

  //   const syncOfflineItems = async () => {
  //     const offlineItems =
  //       JSON.parse(await AsyncStorage.getItem("offlineItems")) || [];
  //     try {
  //       if (isOnline) {
  //         if (offlineItems.length > 0) {
  //           for (const item of offlineItems) {
  //             await axios.post(`${API_BASE_URL}/book`, item);
  //             console.log("Item synced to server:", item);
  //           }

  //           // Clear offline items after syncing
  //           await AsyncStorage.setItem("offlineItems", JSON.stringify([]));
  //           console.log("All offline items synced and stored cleared.");
  //         } else {
  //           console.log("No new items to sync");
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error syncing items:", error);
  //     }
  //   };

  const loadItems = async () => {
    try {
      const cachedItems = await AsyncStorage.getItem("items");
      //console.log("cachedItems", cachedItems);
      if (cachedItems) {
        console.debug("Fetched items from cache");
        setItems(JSON.parse(cachedItems));
      } else {
        const response = await axios.get(`${API_BASE_URL}/courses`);
        setItems(response.data);
        await AsyncStorage.setItem("items", JSON.stringify(response.data));
        setIsOnline(true);
        //Alert.alert("Data Fetched", "Successfully fetched items from server");
      }
    } catch (error) {
      setIsOnline(false);
      console.debug("Error fetching items from server:", error);
      const cachedItems = await AsyncStorage.getItem("items");
      if (cachedItems) {
        setItems(JSON.parse(cachedItems));
      }
    } finally {
      setLoading(false);
    }
  };

  const retryLoad = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`);
      setItems(response.data);
      await AsyncStorage.setItem("items", JSON.stringify(response.data));
      setShowRetry(false);
      Alert.alert("Success", "Data reloaded from server.");
    } catch (error) {
      Alert.alert("Error", "Unable to fetch data. Please try again.");
      setShowRetry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await axios.delete(`${API_BASE_URL}/course/${id}`);

            const updatedItems = items.filter((item) => item.id !== id);
            setItems(updatedItems);

            // Update AsyncStorage instead of removing it
            await AsyncStorage.setItem("items", JSON.stringify(updatedItems));

            console.debug("Item deleted from server", id);
          } catch (error) {
            const updatedItems = items.filter((item) => item.id !== id);
            setItems(updatedItems);

            // Update AsyncStorage instead of removing it
            await AsyncStorage.setItem("items", JSON.stringify(updatedItems));

            console.debug("Item deleted", id);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          {isOnline && (
            <View style={styles.navButtons}>
              <TouchableOpacity
                onPress={() => router.push("/screens/ListScreen")}
              >
                <Text style={styles.navButton}>Instructor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/screens/StudentScreen")}
              >
                <Text style={styles.navButton}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/screens/AnalyticsScreen")}
              >
                <Text style={styles.navButton}>Analytics</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <TouchableOpacity
                  style={styles.itemDetails}
                  onPress={() =>
                    router.push(`/screens/DetailsScreen?id=${item.id}`)
                  }
                >
                  <Text style={styles.name}>{item.name}</Text>
                  <Text>Id: {item.id}</Text>
                  <Text>Instructor: {item.instructor}</Text>
                  <Text>Category: {item.category}</Text>
                </TouchableOpacity>

                {isOnline && (
                  <>
                    {/* <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        router.push(`/screens/UpdateScreen?id=${item.id}`)
                      }
                    >
                      <MaterialIcons name="edit" size={24} color="#a56600" />
                    </TouchableOpacity> */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id)}
                    >
                      <MaterialIcons name="delete" size={25} color="#d52600" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          />
          {showRetry && (
            <View style={styles.offlineContainer}>
              <Button title="Retry" onPress={retryLoad} />
            </View>
          )}
        </>
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/screens/AddScreen")}
      >
        <MaterialIcons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginTop: 50,
  },
  itemContainer: {
    backgroundColor: "#fff9eb",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    position: "relative",
  },
  itemDetails: {
    marginBottom: 10,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 10,
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  navButton: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#a56600",
    padding: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  offlineContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addButton: {
    backgroundColor: "#a56600",
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
});
