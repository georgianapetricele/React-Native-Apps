import { Stack } from "expo-router";
import { useFonts } from "expo-font"

export default function RootLayout() {
  useFonts({
    'montserrat':require('./../assets/fonts/Montserrat-Regular.ttf'),
    'montserrat-bold':require('./../assets/fonts/Montserrat-Bold.ttf')
  })
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
