import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import RecipesRepository from "../repository/RecipesRepository";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

export default function RecipeListScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  const loadRecipes = async () => {
    try {
      const fetchedRecipes = await RecipesRepository.getAllRecipes();
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error("Error loading recipes:", error);
      Alert.alert("Error", "Failed to load recipes. Please try again.");
    }
  };

  useEffect(() => {
    const initializeWebSocket = async () => {
      await RecipesRepository.initWebSocket();
      const socket = RecipesRepository.socket;

      const handleSocketMessage = async (message) => {
        const data = JSON.parse(message.data);
        if (
          ["recipe-added", "recipe-updated", "recipe-deleted"].includes(
            data.type
          )
        ) {
          await loadRecipes();
        }
      };

      if (socket) {
        socket.addEventListener("message", handleSocketMessage);
      }

      return () => {
        if (socket) {
          socket.removeEventListener("message", handleSocketMessage);
        }
      };
    };

    initializeWebSocket();
  }, []);

  useEffect(() => {
    const checkConnectionInterval = setInterval(async () => {
      if (!RecipesRepository.isOnline && !isCheckingConnection) {
        setIsCheckingConnection(true);

        try {
          await RecipesRepository.initWebSocket();
          if (RecipesRepository.isOnline) {
            console.log(
              "WebSocket reconnected. Switching back to online mode."
            );
            await loadRecipes();
          }
        } catch (error) {
          console.log("Still offline, retrying...");
        } finally {
          setIsCheckingConnection(false);
        }
      }
    }, 30000);

    return () => clearInterval(checkConnectionInterval);
  }, [isCheckingConnection]);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );

  const handleDeleteRecipe = async (id) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await RecipesRepository.deleteRecipe(id);
              await loadRecipes();
            } catch (error) {
              console.error("Error deleting recipe:", error);
              Alert.alert(
                "Error",
                "Failed to delete the recipe. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/screens/EditRecipeScreen?id=${item.id}`)}
    >
      <View style={styles.recipeContainer}>
        <View style={styles.recipeHeader}>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <View style={styles.recipeContent}>
          <Text style={styles.areaPreview}>
            {item.ingredients.slice(0, 50)}
          </Text>
          <Text style={styles.areaPreview}>
            {item.preparationSteps.slice(0, 50)}...
          </Text>
          <View style={styles.recipeHeader}>
            <MaterialIcons name="timer" size={20} color="#000000" />
            <Text style={styles.prepTime}> {item.preparationTime} minutes</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecipe(item.id)}
        >
          <MaterialIcons name="delete" size={25} color="#d52600" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Recipes</Text>
      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/screens/AddRecipeScreen")}
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
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontFamily: "montserrat-bold",
    color: "#a56600",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "montserrat",
    color: "#5C3DAC",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 100,
  },
  recipeContainer: {
    backgroundColor: "#fff9eb",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 5,
  },
  deleteButton: {
    flexDirection: "row",

    alignSelf: "flex-end",
  },
  deleteText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#656565",
    fontFamily: "montserrat",
  },
  name: {
    fontSize: 18,
    color: "#000000",
    fontFamily: "montserrat-bold",
  },
  prepTime: {
    fontSize: 14,
    color: "#000000",
    fontFamily: "montserrat",
  },
  areaPreview: {
    fontSize: 14,
    color: "#000000",
    fontFamily: "montserrat",
    marginBottom: 5,
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
});
