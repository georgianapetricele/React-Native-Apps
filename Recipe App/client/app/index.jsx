import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {"\n"}
        {"\n"}MY {"\n"}RECIPES
      </Text>

      <View style={styles.imageContainer}>
        <Image
          source={require("./../assets/images/recipeBook.jpg")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/screens/RecipeListScreen")}
      >
        <Text style={styles.buttonText}>GET STARTED</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    fontFamily: "montserrat",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DFB8E5",
    textTransform: "uppercase",
    fontFamily: "montserrat",
    marginBottom: 15,
    marginTop: 50,
  },
  title: {
    fontSize: 45,
    color: "#a56600",
    textAlign: "left",
    marginBottom: 70,
    lineHeight: 36,
    fontFamily: "montserrat-bold",
  },
  imageContainer: {
    width: "100%",
    height: 400,
    marginBottom: 50,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  button: {
    backgroundColor: "#a56600",
    width: 180,
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 100,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "montserrat-bold",
  },
});
