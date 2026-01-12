// app/(academy)/academyMainScreen.tsx
import React, { useRef, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Image as RNImage,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// 🔹 CAROUSEL CONFIGURATION
const ITEM_WIDTH = width * 0.85;
const CARD_HEIGHT = 200;
const SPACING = 12;

// 🔹 CREATE ANIMATED FLATLIST
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList) as any;

export default function AcademyMainScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const mainBanner = require("@/assets/images/heroBannerAcademy.png");

  // 🔹 1) CORE DATA - Removed infinite loop complexity
  const carouselData = [
    {
      id: "hero",
      type: "image",
      title: "Discover top academies",
      subtitle: "for your child",
      source: mainBanner,
    },
    {
      id: "placeholder-1",
      type: "placeholder",
      title: "Academy Spotlight",
      subtitle: "Premium training programs",
      icon: "star-outline",
      color: "#06b6d4",
    },
    {
      id: "placeholder-2",
      type: "placeholder",
      title: "Expert Coaches",
      subtitle: "Certified professionals",
      icon: "person-circle-outline",
      color: "#8b5cf6",
    },
    {
      id: "placeholder-3",
      type: "placeholder",
      title: "Track Progress",
      subtitle: "Monitor your child's growth",
      icon: "trending-up-outline",
      color: "#10b981",
    },
  ];

  // 🔹 2) CAROUSEL RENDERER
  const renderCarouselItem = ({ item, index }: { item: (typeof carouselData)[number]; index: number }) => {
    const inputRange = [
      (index - 1) * (ITEM_WIDTH + SPACING),
      index * (ITEM_WIDTH + SPACING),
      (index + 1) * (ITEM_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.itemWrapper,
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
              <Text className="text-white text-xl font-bold leading-6">
                {item.title}
              </Text>
              <Text className="text-slate-200 text-sm font-medium mt-1">
                {item.subtitle}
              </Text>
            </View>
          </>
        ) : (
          <View
            style={[
              styles.placeholderCard,
              { backgroundColor: (item.color || "#3b82f6") + "15", borderColor: (item.color || "#3b82f6") + "30" },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: (item.color || "#3b82f6") + "20" },
              ]}
            >
              <Ionicons name={item.icon as any} size={28} color={item.color || "#3b82f6"} />
            </View>
            <Text style={styles.placeholderTitle}>{item.title}</Text>
            <Text style={styles.placeholderSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  // 🔹 3) CAROUSEL PAGINATION DOTS
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {carouselData.map((_, index) => {
          const inputRange = [
            (index - 1) * (ITEM_WIDTH + SPACING),
            index * (ITEM_WIDTH + SPACING),
            (index + 1) * (ITEM_WIDTH + SPACING),
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity,
                },
              ]}
            />
          );
        })}
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
            },
          ]}
        >
          <View className="items-center justify-center p-2">
            <View className="bg-white/10 rounded-full p-2 mb-1">
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
        <View style={styles.carouselContainer}>
          <AnimatedFlatList
            data={carouselData}
            keyExtractor={(item :any) => item.id}
            renderItem={renderCarouselItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH + SPACING}
            snapToAlignment="center"
            decelerationRate="fast"
            bounces={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            contentContainerStyle={{
              paddingHorizontal: (width - ITEM_WIDTH) / 2,
              gap: SPACING,
            }}
          />
        </View>

        {/* PAGINATION DOTS */}
        {renderDots()}

        {/* HEADER TEXT */}
        <View className="px-6 mt-10 mb-8">
          <Text className="text-white text-3xl font-bold text-center mb-2">
            Academy Connect
          </Text>
          <Text className="text-slate-400 text-center text-base leading-6">
            Empowering sports academies with{"\n"}discovery and management tools.
          </Text>
        </View>

        {/* ACTION BUTTONS */}
        <View className="flex-row justify-center gap-6 px-4">
          <ButtonComponent
            icon="compass-outline"
            label="Explore"
            onPress={() => handlePress("Explore")}
            style={{ width: width * 0.35, height: width * 0.22 }}
          />
          <ButtonComponent
            icon="trophy-outline"
            label="Manage"
            onPress={() => handlePress("Manage")}
            style={{ width: width * 0.35, height: width * 0.22 }}
          />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  itemWrapper: {
    width: ITEM_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  cardTextOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  placeholderCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: 4,
  },
  placeholderSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },
});