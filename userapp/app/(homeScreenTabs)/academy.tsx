// app/(academy)/academyMainScreen.tsx
import React, { useRef, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Image as RNImage,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// 🔹 CAROUSEL CONFIGURATION
const ITEM_WIDTH = width * 0.85;
const CARD_HEIGHT = 350;
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

  const features = [
    {
      id: "1",
      icon: "search-outline",
      title: "Smart Discovery",
      description: "Find academies that match your preferences",
      color: "#3b82f6",
    },
    {
      id: "2",
      icon: "bar-chart-outline",
      title: "Progress Tracking",
      description: "Monitor achievements in real-time",
      color: "#10b981",
    },
    {
      id: "3",
      icon: "people-outline",
      title: "Expert Network",
      description: "Connect with certified coaches",
      color: "#f59e0b",
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
          {
            width: ITEM_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: 20,
            overflow: "hidden",
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        {item.type === "image" ? (
          <>
            <RNImage
              source={item.source}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/35" />
            <View className="absolute left-4 right-4 bottom-4">
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
            className="flex-1 rounded-2xl border-1.5 items-center justify-center px-4 py-5"
            style={{
              backgroundColor: (item.color || "#3b82f6") + "15",
              borderColor: (item.color || "#3b82f6") + "30",
            }}
          >
            <View
              className="w-14 h-14 rounded-base items-center justify-center mb-3"
              style={{
                backgroundColor: (item.color || "#3b82f6") + "20",
              }}
            >
              <Ionicons name={item.icon as any} size={28} color={item.color || "#3b82f6"} />
            </View>
            <Text className="text-slate-100 text-base font-bold text-center mb-1">
              {item.title}
            </Text>
            <Text className="text-slate-400 text-xs text-center leading-4">
              {item.subtitle}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  // 🔹 3) CAROUSEL PAGINATION DOTS
  const renderDots = () => {
    return (
      <View className="flex-row items-center justify-center gap-1.5 my-3">
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
              className="h-2 w-1 rounded-full bg-blue-500"
              style={{
                opacity,
              }}
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

  const SmallButton = ({ icon, label, onPress, color }: any) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    return (
      <TouchableWithoutFeedback
        onPressIn={() => {
          Animated.spring(scaleAnim, {
            toValue: 0.93,
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
          className="flex-row items-center gap-1.5 py-2.5 px-3.5 rounded-lg bg-slate-950 border flex-1 justify-center shadow-md"
          style={{
            transform: [{ scale: scaleAnim }],
            borderColor: color,
            borderWidth: 1.5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Ionicons name={icon} size={18} color={color} />
          <Text className="text-xs font-bold" style={{ color }}>
            {label}
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  const FeatureCard = ({ feature }: any) => {
    return (
      <View className="bg-slate-800 rounded-xl p-3 border border-slate-700 mb-4">
        <View
          className="w-10 h-10 rounded-lg items-center justify-center mb-2"
          style={{
            backgroundColor: feature.color + "15",
          }}
        >
          <Ionicons name={feature.icon} size={24} color={feature.color} />
        </View>
        <Text className="text-slate-100 text-sm font-bold mb-1">
          {feature.title}
        </Text>
        <Text className="text-slate-400 text-xs leading-4">
          {feature.description}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* CAROUSEL SECTION */}
        <View className="mt-4 mb-2">
          <AnimatedFlatList
            data={carouselData}
            keyExtractor={(item: any) => item.id}
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

        {/* NEW CREATIVE SECTION */}
        <View className="px-5 mt-6">
          {/* Main Heading */}
          <View className="mb-8">
            <View className="flex-row items-center gap-1.5 mb-3 self-start bg-blue-500/10 py-1.5 px-2.5 rounded-full border border-blue-500/30">
              <Ionicons name="flash-outline" size={14} color="#3b82f6" />
              <Text className="text-xs font-semibold text-blue-500">
                Your Sports Journey
              </Text>
            </View>
            <Text className="text-3xl font-black text-slate-100 mb-2">
              Academy Connect
            </Text>
           
          </View>

          {/* CTA Section */}
          <View className="bg-transparent rounded-2xl p-4 border border-slate-500 mt-1">
            <View className="mb-3.5">
              <Text className="text-base font-bold text-slate-100 mb-1">
                Ready to explore?
              </Text>
              <Text className="text-sm text-slate-400 leading-tight">
                Browse thousands of academies and find the perfect fit
              </Text>
            </View>
            <View className="flex-row gap-2.5">
              <SmallButton
                icon="compass-outline"
                label="Explore"
                onPress={() => handlePress("Explore")}
                color="#3b82f6"
              />
              <SmallButton
                icon="trophy-outline"
                label="Manage"
                onPress={() => handlePress("Manage")}
                color="#10b981"
              />
            </View>
          </View>

          {/* Features Grid */}
          <View className="mb-7 mt-6">
            {features.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}