// app/(academy)/academyMainScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Image as RNImage,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.86;
const CARD_SPACING = 16;
const CARD_HEIGHT = 230;

export default function AcademyMainScreen() {
  // 🔹 1) CAROUSEL DATA
  const mainBanner = require("@/assets/images/heroBannerAcademy.png");

  const baseItems = useMemo(
    () => [
      {
        id: "hero",
        type: "image" as const,
        title: "Discover top academies\nfor your child",
        subtitle: "Browse, compare and track progress in one place.",
        source: mainBanner,
      },
      {
        id: "placeholder-1",
        type: "placeholder" as const,
        title: "Academy banner spot",
        subtitle: "Registered academy’s cover image will appear here.",
      },
      {
        id: "placeholder-2",
        type: "placeholder" as const,
        title: "Showcase your academy",
        subtitle: "Highlight facilities, coaches and training style.",
      },
      {
        id: "placeholder-3",
        type: "placeholder" as const,
        title: "More academies coming",
        subtitle: "Parents will scroll through banners like this.",
      },
    ],
    []
  );

  // create looped data (x3) and start in the middle block
  const loopData = useMemo(
    () => [...baseItems, ...baseItems, ...baseItems],
    [baseItems]
  );

  const BASE_LEN = baseItems.length;
  const [currentIndex, setCurrentIndex] = useState(BASE_LEN);
  const carouselRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    // jump to middle block on mount
    setTimeout(() => {
      carouselRef.current?.scrollToIndex({
        index: BASE_LEN,
        animated: false,
      });
    }, 0);
  }, [BASE_LEN]);

  const getItemLayout = (_: any, index: number) => ({
    length: CARD_WIDTH + CARD_SPACING,
    offset: (CARD_WIDTH + CARD_SPACING) * index,
    index,
  });

  const handleCarouselScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);

    // if we’ve reached near the edges, jump back into the middle block
    if (index < BASE_LEN || index >= BASE_LEN * 2) {
      let newIndex = index;
      if (index < BASE_LEN) newIndex = index + BASE_LEN;
      if (index >= BASE_LEN * 2) newIndex = index - BASE_LEN;

      setTimeout(() => {
        carouselRef.current?.scrollToIndex({
          index: newIndex,
          animated: false,
        });
        setCurrentIndex(newIndex);
      }, 0);
    }
  };

  const renderCarouselItem = ({ item }: { item: any }) => {
    const isImage = item.type === "image";

    return (
      <View
        style={[
          styles.cardContainer,
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            marginRight: CARD_SPACING,
          },
        ]}
      >
        {isImage ? (
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
              <Ionicons name="image-outline" size={32} color="#64748b" />
            </View>
            <Text style={styles.placeholderTitle}>{item.title}</Text>
            <Text style={styles.placeholderSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      </View>
    );
  };

  // 🔹 2) BUTTON COMPONENT
  const handlePress = (action: string): void => {
    if (action === "Explore") {
      router.navigate("./../(academy)/browseAcademy");
    } else if (action === "Manage") {
      router.navigate("./../manageProfile");
    }
  };

  interface ButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    style: any;
  }

  const ButtonComponent: React.FC<ButtonProps> = ({
    icon,
    label,
    onPress,
    style,
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const animateIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
      }).start();
    };

    const animateOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 80,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableWithoutFeedback
        onPressIn={animateIn}
        onPressOut={animateOut}
        onPress={onPress}
      >
        <Animated.View
          style={[
            style,
            {
              backgroundColor: "#334155",
              borderRadius: 20,
              shadowColor: "#000",
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 6,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View className="flex-1 items-center justify-center p-3">
            <View className="bg-white/10 rounded-full p-2 mb-2">
              <Ionicons name={icon} size={24} color="white" />
            </View>
            <Text
              className="text-white font-semibold text-center text-sm"
              numberOfLines={2}
            >
              {label}
            </Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  // 🔹 3) MAIN RENDER
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* TOP CAROUSEL */}
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={carouselRef}
          horizontal
          data={loopData}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderCarouselItem}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          snapToAlignment="start"
          getItemLayout={getItemLayout}
          contentContainerStyle={{
            paddingHorizontal: (width - CARD_WIDTH) / 2,
          }}
          onMomentumScrollEnd={handleCarouselScrollEnd}
        />

        {/* arrows as visual “swipe” hints only */}
        <View style={[styles.arrowContainer, { left: 12 }]}>
          <Ionicons name="chevron-back" size={18} color="#cbd5f5" />
          <Text style={styles.arrowText}>Swipe</Text>
        </View>
        <View style={[styles.arrowContainer, { right: 12 }]}>
          <Text style={styles.arrowText}>Swipe</Text>
          <Ionicons name="chevron-forward" size={18} color="#cbd5f5" />
        </View>
      </View>

      {/* CONTENT AREA */}
      <View className="flex-1 bg-slate-900">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold text-center mb-2">
              Academy Connect
            </Text>
            <Text className="text-slate-300 text-center text-base leading-5 px-2">
              Empowering sports academies with discovery and management
            </Text>
          </View>

          {/* Stats Section */}
          <View className="flex-row justify-between mb-14 px-2">
            <View className="items-center">
              <Text className="text-blue-400 text-xl font-bold">1,200+</Text>
              <Text className="text-slate-400 text-xs">Academies</Text>
            </View>
            <View className="items-center">
              <Text className="text-green-400 text-xl font-bold">50K+</Text>
              <Text className="text-slate-400 text-xs">Students</Text>
            </View>
            <View className="items-center">
              <Text className="text-purple-400 text-xl font-bold">98%</Text>
              <Text className="text-slate-400 text-xs">Success Rate</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="items-center mb-4 mt-8">
            <View className="flex-row justify-center mb-8">
              <View className="items-center mx-6">
                <ButtonComponent
                  icon="compass-outline"
                  label="Explore Academies"
                  onPress={() => handlePress("Explore")}
                  style={{
                    width: width * 0.25,
                    height: width * 0.25,
                  }}
                />
              </View>
              <View className="items-center mx-6">
                <ButtonComponent
                  icon="trophy-outline"
                  label="Manage Academy"
                  onPress={() => handlePress("Manage")}
                  style={{
                    width: width * 0.25,
                    height: width * 0.25,
                  }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: {
    paddingVertical: 12,
  },
  cardContainer: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.40)",
  },
  cardTextOverlay: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  placeholderInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  placeholderIconCircle: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: "#cbd5f5",
    marginBottom: 10,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 4,
  },
  placeholderSubtitle: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
  },
  arrowContainer: {
    position: "absolute",
    top: CARD_HEIGHT / 2 - 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  arrowText: {
    color: "#cbd5f5",
    fontSize: 10,
    marginHorizontal: 4,
  },
});
