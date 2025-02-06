import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const API_BASE_URL = "http://172.30.245.172:2506";
//const API_BASE_URL = "http://172.20.10.13:2505";
//const API_BASE_URL = "http://10.0.2.2:2505";

export default function UpdateScreen() {
  const { id } = useLocalSearchParams(); // Get book ID from navigation
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: id || "", // Ensure ID is included in the request body
    title: "",
    author: "",
    genre: "",
    status: "",
    reviewCount: "",
    avgRating: "",
  });

  const router = useRouter();

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/book/${id}`);
      setFormData(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch book details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!isOnline) {
      Alert.alert("Offline", "You must be online to update a book.");
      return;
    }

    setLoading(true);
    try {
      // Update the book on the server
      const response = await axios.put(`${API_BASE_URL}/book`, formData);

      // Check if update was successful
      if (response.status === 200) {
        Alert.alert("Success", "Book updated successfully!", [
          {
            text: "OK",
            onPress: () => router.push("/screens/ListScreen"),
          },
        ]);

        // Update the local storage with the new data
        const books = await AsyncStorage.getItem("items");
        const parsedBooks = JSON.parse(books);

        // Find the book by id and update it directly in local storage
        const updatedBooks = parsedBooks.map((book) => {
          if (book.id === formData.id) {
            // Directly update the book in the local storage
            return { ...book, ...formData };
          }
          return book;
        });

        // Save the updated books array back to AsyncStorage
        await AsyncStorage.setItem("items", JSON.stringify(updatedBooks));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update the book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.push("/screens/ListScreen")}
          >
            <MaterialIcons name="close" size={24} color="#5C3DAC" />
          </TouchableOpacity>
          <Text style={styles.header}>Update Book</Text>

          <TextInput
            style={styles.input}
            placeholder="Title"
            value={formData.title}
            onChangeText={(text) => handleChange("title", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Author"
            value={formData.author}
            onChangeText={(text) => handleChange("author", text)}
          />

          <Text style={styles.label}>Genre</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.genre}
              onValueChange={(itemValue) => handleChange("genre", itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Fiction" value="fiction" />
              <Picker.Item label="Non-Fiction" value="non-fiction" />
              <Picker.Item label="Mystery" value="mystery" />
            </Picker>
          </View>

          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.status}
              onValueChange={(itemValue) => handleChange("status", itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Not Started" value="not started" />
              <Picker.Item label="Reading" value="reading" />
              <Picker.Item label="Completed" value="completed" />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Review Count"
            keyboardType="numeric"
            value={String(formData.reviewCount)}
            onChangeText={(text) => handleChange("reviewCount", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Average Rating"
            keyboardType="numeric"
            value={String(formData.avgRating)}
            onChangeText={(text) => handleChange("avgRating", text)}
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={styles.loading}
            />
          ) : (
            <Button title="Update Book" onPress={handleUpdate} />
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 50,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    height: 150,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  loading: {
    marginVertical: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
});
