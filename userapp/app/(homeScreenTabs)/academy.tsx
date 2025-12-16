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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// 🔹 CAROUSEL CONFIGURATION
const ITEM_WIDTH = width * 0.82; // Card width
const SPACING = 12; // Gap between cards
const EMPTY_ITEM_SIZE = (width - ITEM_WIDTH) / 2; // To center the first/last item
const CARD_HEIGHT = 240;

export default function AcademyMainScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const mainBanner = require("@/assets/images/heroBannerAcademy.png");

  // 🔹 1) DATA
  const data = [
    { key: "spacer-left" }, // Spacer for centering
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
    { key: "spacer-right" }, // Spacer for centering
  ];

  // 🔹 2) CAROUSEL RENDERER
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (!item.id) {
      return <View style={{ width: EMPTY_ITEM_SIZE }} />;
    }

    // INTERPOLATION: Scale up the center item, scale down side items
    const inputRange = [
      (index - 2) * ITEM_WIDTH,
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
    ];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, -10, 20], // Parallax vertical move
      extrapolate: "clamp",
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9], // Grow center, shrink sides
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6], // Fade sides
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
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
            </>
          ) : (
            <View style={styles.placeholderInner}>
              <View style={styles.placeholderIconCircle}>
                <Ionicons name={item.icon || "image"} size={32} color="#64748b" />
              </View>
              <Text style={styles.placeholderTitle}>{item.title}</Text>
              <Text style={styles.placeholderSubtitle}>{item.subtitle}</Text>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  // 🔹 3) PAGINATION DOTS
  const Pagination = () => {
    // Filter out spacers
    const actualData = data.filter((item) => item.id);
    
    return (
      <View style={styles.paginationContainer}>
        {actualData.map((_, idx) => {
          // Because we added a spacer at index 0, the real items start at index 1
          const realIndex = idx + 1; 
          
          const inputRange = [
            (realIndex - 1) * ITEM_WIDTH,
            realIndex * ITEM_WIDTH,
            (realIndex + 1) * ITEM_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8], // Active dot gets wider
            extrapolate: "clamp",
          });

          const dotColor = scrollX.interpolate({
            inputRange,
            outputRange: ["#334155", "#60a5fa", "#334155"], // Blue when active
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={idx.toString()}
              style={[
                styles.dot,
                { width: dotWidth, backgroundColor: dotColor },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // 🔹 4) BUTTON COMPONENT
  const handlePress = (action: string): void => {
    if (action === "Explore") {
      router.navigate("./../(academy)/browseAcademy");
    } else if (action === "Manage") {
      router.navigate("./../manageProfile");
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
            styles.actionButton,
            style,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View className="items-center justify-center p-2">
            <View className="bg-white/10 rounded-full p-3 mb-2">
              <Ionicons name={icon} size={26} color="white" />
            </View>
            <Text className="text-white font-semibold text-center text-sm">
              {label}
            </Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* 🔹 MAIN SCROLL CONTENT */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* CAROUSEL SECTION */}
        <View style={{ marginTop: 20 }}>
          <Animated.FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast" // Ensures crisp snap
            bounces={false}
            scrollEventThrottle={16} // 60fps updates
            contentContainerStyle={{ alignItems: "center" }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            renderItem={renderItem}
          />

          {/* Pagination Dots */}
          <Pagination />
        </View>

        {/* HEADER TEXT */}
        <View className="px-6 mt-2 mb-8">
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
          <View style={styles.statDivider} />
          <StatBox value="50k+" label="Students" color="#4ade80" />
          <View style={styles.statDivider} />
          <StatBox value="98%" label="Success" color="#c084fc" />
        </View>

        {/* ACTION BUTTONS */}
        <View className="flex-row justify-center gap-6 px-4">
          <ButtonComponent
            icon="compass-outline"
            label="Explore"
            onPress={() => handlePress("Explore")}
            style={{ width: width * 0.38, height: width * 0.32 }}
          />
          <ButtonComponent
            icon="trophy-outline"
            label="Manage"
            onPress={() => handlePress("Manage")}
            style={{ width: width * 0.38, height: width * 0.32 }}
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
    marginHorizontal: SPACING / 2, // Split spacing between items
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
  cardTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardSubtitle: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  placeholderInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#1e293b",
  },
  placeholderIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 6,
  },
  placeholderSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    height: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionButton: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#334155",
    alignSelf: "center",
  },
});