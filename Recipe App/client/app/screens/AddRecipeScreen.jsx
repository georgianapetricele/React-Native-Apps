import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import RecipesRepository from "../repository/RecipesRepository";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AddRecipeScreen() {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [preparationSteps, setPreparationSteps] = useState("");
  const [preparationTime, setPreparationTime] = useState("");

  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim() || !ingredients.trim() || !preparationSteps.trim()) {
      Alert.alert("All fields must be filled.");
      return;
    }

    const time = parseInt(preparationTime);
    if (isNaN(time) || time <= 0) {
      Alert.alert("Preparation time must be a valid positive number.");
      return;
    }

    const newRecipe = {
      name,
      ingredients,
      preparationSteps,
      preparationTime: time,
    };

    try {
      await RecipesRepository.addRecipe(newRecipe);
      router.push("/screens/RecipeListScreen");
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "There was an error saving your recipe.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push("/screens/RecipeListScreen")}
      >
        <MaterialIcons name="close" size={24} color="#5C3DAC" />
      </TouchableOpacity>
      <Text style={styles.title}>Add a new recipe</Text>

      <Text style={styles.label}>Recipe Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter here the recipe name"
      />

      <Text style={styles.label}>Ingredients</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={ingredients}
        onChangeText={setIngredients}
        placeholder="Enter here the ingredients"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Preparation Steps</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={preparationSteps}
        onChangeText={setPreparationSteps}
        placeholder="Enter here the preparation steps"
        multiline
        numberOfLines={6}
      />

      <Text style={styles.label}>Preparation Time</Text>
      <TextInput
        style={styles.input}
        value={preparationTime}
        onChangeText={setPreparationTime}
        keyboardType="numeric"
        placeholder="Enter the preparation time in minutes"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>SAVE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 30,
    fontFamily: "montserrat-bold",
    color: "#a56600",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "montserrat-bold",
    color: "#a56600",
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#a56600",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontFamily: "montserrat",
    color: "#000000",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#a56600",
    borderRadius: 8,
    marginTop: 30,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "montserrat-bold",
  },
});
