// app/(academy)/academyMainScreen.tsx
import React, { useRef } from "react";
import {
  SafeAreaView,
  View,
  Image as RNImage,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  StyleSheet,
  Platform,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// 🔹 CAROUSEL CONFIGURATION
const ITEM_WIDTH = width * 0.82;
const SPACING = 12;
const EMPTY_ITEM_SIZE = (width - ITEM_WIDTH) / 2;

// 👇 CHANGED: Increased height from 240 to 340
const CARD_HEIGHT = 340; 

export default function AcademyMainScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const mainBanner = require("@/assets/images/heroBannerAcademy.png");

  // 🔹 1) DATA
  const data = [
    { key: "spacer-left" },
    {
      id: "hero",
      type: "image",
      title: "Discover top academies\nfor your child",
      subtitle: "Browse, compare and track progress.",
      source: mainBanner,
    },
    {
      id: "placeholder-1",
      type: "placeholder",
      title: "Academy banner spot",
      subtitle: "Registered academy’s cover image will appear here.",
      icon: "easel-outline",
    },
    {
      id: "placeholder-2",
      type: "placeholder",
      title: "Showcase your academy",
      subtitle: "Highlight facilities, coaches and training style.",
      icon: "ribbon-outline",
    },
    {
      id: "placeholder-3",
      type: "placeholder",
      title: "More coming soon",
      subtitle: "Parents will scroll through banners like this.",
      icon: "layers-outline",
    },
    { key: "spacer-right" },
  ];

  // 🔹 2) CAROUSEL RENDERER
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (!item.id) {
      return <View style={{ width: EMPTY_ITEM_SIZE }} />;
    }

    const inputRange = [
      (index - 2) * ITEM_WIDTH,
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: ITEM_WIDTH }}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          {item.type === "image" ? (
            <>
              <RNImage
                source={item.source}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardGradientOverlay} />
              <View style={styles.cardTextOverlay}>
                <Text className="text-white text-2xl font-bold mb-1 shadow-sm">
                  {item.title}
                </Text>
                <Text className="text-slate-200 text-sm font-medium">
                  {item.subtitle}
                </Text>
              </View>
            </>
          ) : (
            <View className="flex-1 items-center justify-center px-6 bg-slate-800">
              <View className="w-16 h-16 rounded-full bg-slate-700 items-center justify-center mb-4">
                <Ionicons name={item.icon as any || "image"} size={32} color="#94a3b8" />
              </View>
              <Text className="text-lg font-bold text-slate-50 text-center mb-2">
                {item.title}
              </Text>
              <Text className="text-sm text-slate-400 text-center leading-5">
                {item.subtitle}
              </Text>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };


  // 🔹 4) BUTTON COMPONENT
  const handlePress = (action: string) => {
    if (action === "Explore") {
      router.push("/(academy)/browseAcademy");
    } else if (action === "Manage") {
      router.push("/manageProfile");
    }
  };

  const ButtonComponent = ({ icon, label, onPress, style }: any) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    return (
      <TouchableWithoutFeedback
        onPressIn={() => {
          Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start();
        }}
        onPress={onPress}
      >
        <Animated.View
          style={[
            style,
            { 
              transform: [{ scale: scaleAnim }],
              backgroundColor: "#1e293b",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "#334155",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }
          ]}
        >
          <View className="items-center justify-center p-2">
            <View className="bg-white/10 rounded-full p-2 mb-1">
              {/* Reduced icon size slightly to fit smaller card */}
              <Ionicons name={icon} size={22} color="white" />
            </View>
            <Text className="text-white font-semibold text-center text-xs">
              {label}
            </Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* CAROUSEL SECTION */}
        <View className="mt-5">
          <Animated.FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            bounces={false}
            scrollEventThrottle={16}
            contentContainerStyle={{ alignItems: "center" }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            renderItem={renderItem}
          />
        </View>

        {/* HEADER TEXT */}
        <View className="px-6 mt-12 mb-8">
          <Text className="text-white text-3xl font-bold text-center mb-2">
            Academy Connect
          </Text>
          <Text className="text-slate-400 text-center text-base leading-6">
            Empowering sports academies with{'\n'}discovery and management tools.
          </Text>
        </View>

        {/* STATS SECTION */}
        <View className="flex-row justify-between mb-10 px-6">
          <StatBox value="1.2k+" label="Academies" color="#60a5fa" />
          <View className="w-[1px] h-[80%] bg-slate-700 self-center" />
          <StatBox value="50k+" label="Students" color="#4ade80" />
          <View className="w-[1px] h-[80%] bg-slate-700 self-center" />
          <StatBox value="98%" label="Success" color="#c084fc" />
        </View>

        {/* ACTION BUTTONS */}
        <View className="flex-row justify-center gap-6 px-4">
          <ButtonComponent
            icon="compass-outline"
            label="Explore"
            onPress={() => handlePress("Explore")}
            // 👇 CHANGED: Made smaller. Width 0.35 -> 0.35, Height 0.32 -> 0.22
            style={{ width: width * 0.35, height: width * 0.22 }}
          />
          <ButtonComponent
            icon="trophy-outline"
            label="Manage"
            onPress={() => handlePress("Manage")}
            // 👇 CHANGED: Made smaller. Width 0.35 -> 0.35, Height 0.32 -> 0.22
            style={{ width: width * 0.35, height: width * 0.22 }}
          />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// Helper Component for Stats
const StatBox = ({ value, label, color }: any) => (
  <View className="items-center flex-1">
    <Text style={{ color, fontSize: 22, fontWeight: "bold" }}>{value}</Text>
    <Text className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    height: CARD_HEIGHT,
    marginHorizontal: SPACING / 2,
    borderRadius: 24,
    backgroundColor: "#1e293b",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardTextOverlay: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
  },
});