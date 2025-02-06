import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  FlatList,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://172.30.245.172:2506";

export default function AddScreen() {
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    instructor: "",
    description: "",
    status: "",
    students: "",
    duration: "",
  });

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkConnection = () => {
      NetInfo.addEventListener((state) => {
        setIsOnline(state.isConnected);
      });
    };
    checkConnection();
  }, []);

  const handleChange = (field, value) => {
    if (field === "students" || field === "duration") {
      value = value ? parseInt(value, 10) : "";
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    console.debug("Form Data:", formData);
    if (
      !formData.name ||
      !formData.instructor ||
      !formData.description ||
      !formData.status ||
      !formData.students ||
      !formData.duration
    ) {
      Alert.alert("Error", "All fields must be filled out.");
      return;
    }

    const studentsNum = parseInt(formData.students, 10);
    const durationNum = parseInt(formData.duration, 10);
    if (
      isNaN(studentsNum) ||
      studentsNum < 0 ||
      isNaN(durationNum) ||
      durationNum < 0
    ) {
      Alert.alert("Error", "Students and Duration must be valid integers.");
      return;
    }

    setLoading(true);
    const newItem = {
      ...formData,
      students: studentsNum,
      duration: durationNum,
    };

    if (!isOnline) {
      let items = JSON.parse(await AsyncStorage.getItem("items")) || [];
      newItem.id = items.length + 10;
    }

    try {
      if (isOnline) {
        const response = await axios.post(`${API_BASE_URL}/course`, newItem);
        Alert.alert("Success", "Course added successfully to the server!", [
          { text: "OK", onPress: () => router.push("/screens/ListScreen") },
        ]);
        const storedCourses =
          JSON.parse(await AsyncStorage.getItem("items")) || [];
        storedCourses.push(response.data);
        await AsyncStorage.setItem("items", JSON.stringify(storedCourses));
      } else {
        const storedCourses =
          JSON.parse(await AsyncStorage.getItem("items")) || [];
        storedCourses.push(newItem);
        await AsyncStorage.setItem("items", JSON.stringify(storedCourses));
        const offlineItems =
          JSON.parse(await AsyncStorage.getItem("offlineItems")) || [];
        offlineItems.push(newItem);
        await AsyncStorage.setItem(
          "offlineItems",
          JSON.stringify(offlineItems)
        );
        Alert.alert(
          "Offline",
          "Course added to local storage. It will sync when you're online.",
          [{ text: "OK", onPress: () => router.push("/screens/ListScreen") }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "There was an issue adding the course");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ["upcoming", "ongoing", "completed"];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.scrollViewContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.push("/screens/ListScreen")}
          >
            <MaterialIcons name="close" size={24} color="#5C3DAC" />
          </TouchableOpacity>
          <Text style={styles.header}>Add New Course</Text>
          <TextInput
            style={styles.input}
            placeholder="Course Name"
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Instructor"
            value={formData.instructor}
            onChangeText={(text) => handleChange("instructor", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={formData.description}
            onChangeText={(text) => handleChange("description", text)}
          />

          <Text style={styles.label}>Status</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setStatusModalVisible(true)}
          >
            <Text style={styles.pickerText}>
              {formData.status || "Select Status"}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Students"
            keyboardType="numeric"
            value={formData.students}
            onChangeText={(text) => handleChange("students", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Duration (hours)"
            keyboardType="numeric"
            value={formData.duration}
            onChangeText={(text) => handleChange("duration", text)}
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={styles.loading}
            />
          ) : (
            <Button title="Add Course" onPress={handleSubmit} />
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Modal for Status Selection */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Select Status</Text>
            <FlatList
              data={statusOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    handleChange("status", item.toLowerCase());
                    setStatusModalVisible(false);
                  }}
                >
                  <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.modalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  loading: {
    marginVertical: 20,
  },
});
