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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// 🔹 CAROUSEL CONFIGURATION
// 👇 CHANGED: Increased width ratio from 0.82 to 0.88
const ITEM_WIDTH = width * 0.88;
// 👇 CHANGED: Increased height from 340 to 380
const CARD_HEIGHT = 380;

export default function AcademyMainScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const mainBanner = require("@/assets/images/heroBannerAcademy.png");

  // 🔹 1) CORE DATA
  const baseData = [
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
  ];

  // 🔹 2) CREATE INFINITE LOOP DATA
  const LOOPS = 1000;
  const infiniteData = useMemo(() => {
    return Array(LOOPS).fill(baseData).flat();
  }, [baseData]);

  const START_INDEX = (infiniteData.length / 2) - ((infiniteData.length / 2) % baseData.length);

  // 🔹 3) CAROUSEL RENDERER
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
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
      <View style={{ width: ITEM_WIDTH, alignItems: 'center' }}>
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
            data={infiniteData}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            
            snapToInterval={ITEM_WIDTH}
            snapToAlignment="center" 
            decelerationRate="fast"
            bounces={false}
            
            initialScrollIndex={START_INDEX}
            getItemLayout={(data, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}

            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            
            contentContainerStyle={{ 
                paddingHorizontal: (width - ITEM_WIDTH) / 2 
            }}
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
    width: ITEM_WIDTH, 
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: "#1e293b",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
    marginHorizontal: 0, 
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