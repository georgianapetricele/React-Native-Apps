import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import RecipesRepository from "../repository/RecipesRepository";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function EditRecipeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [preparationSteps, setPreparationSteps] = useState("");
  const [preparationTime, setPreparationTime] = useState("");

  useEffect(() => {
    const loadRecipe = async () => {
      const recipe = await RecipesRepository.getRecipeById(id);
      if (recipe) {
        setName(recipe.name);
        setIngredients(recipe.ingredients);
        setPreparationSteps(recipe.preparationSteps);
        setPreparationTime(recipe.preparationTime.toString());
      } else {
        Alert.alert("Error", "Recipe not found.");
      }
    };

    loadRecipe();
  }, [id]);

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

    const updatedRecipe = {
      name,
      ingredients,
      preparationSteps,
      preparationTime: time,
    };

    try {
      await RecipesRepository.updateRecipe(id, updatedRecipe);
      router.push("/screens/RecipeListScreen");
    } catch (error) {
      console.error("Error updating recipe:", error);
      Alert.alert("Error", "Failed to update the recipe.");
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

      <Text style={styles.title}>Edit the recipe</Text>

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
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontFamily: "montserrat-bold",
    color: "#a56600",
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  input: {
    borderWidth: 1,
    borderColor: "#a56600",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#333333",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#a56600",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
