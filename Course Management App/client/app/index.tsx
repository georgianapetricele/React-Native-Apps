import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ListScreen from "./screens/ListScreen";

export default function Index() {
  const router = useRouter();
  return <ListScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
