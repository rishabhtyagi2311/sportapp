// app/_layout.tsx
import "../global.css";
import { Slot } from "expo-router";

export default function RootLayout() {
  console.log("🚀 RootLayout is rendering with RecoilRoot");

  // No SplashScreen here, just the app tree
  return <Slot />;
}
