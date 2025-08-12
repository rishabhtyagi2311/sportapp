import { View, Text } from 'react-native';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    console.log("🏠 Home screen mounted");
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>🏠 Home Screen Content</Text>
    </View>
  );
}
