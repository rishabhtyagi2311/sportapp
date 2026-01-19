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
          style={[
            styles.smallButton,
            {
              transform: [{ scale: scaleAnim }],
              borderColor: color,
            },
          ]}
        >
          <Ionicons name={icon} size={18} color={color} />
          <Text style={[styles.smallButtonText, { color }]}>{label}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  const FeatureCard = ({ feature }: any) => {
    return (
      <View style={styles.featureCard}>
        <View style={[styles.featureIconBg, { backgroundColor: feature.color + "15" }]}>
          <Ionicons name={feature.icon} size={24} color={feature.color} />
        </View>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDesc}>{feature.description}</Text>
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

        {/* NEW CREATIVE SECTION */}
        <View style={styles.contentSection}>
          {/* Main Heading */}
          <View style={styles.headingBlock}>
            <View style={styles.headingBadge}>
              <Ionicons name="flash-outline" size={14} color="#3b82f6" />
              <Text style={styles.badgeText}>Your Sports Journey</Text>
            </View>
            <Text style={styles.mainHeading}>Academy Connect</Text>
            <Text style={styles.subHeading}>
              Discover premium academies and track your child's athletic growth
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Ready to explore?</Text>
              <Text style={styles.ctaText}>
                Browse thousands of academies and find the perfect fit
              </Text>
            </View>
            <View style={styles.actionButtons}>
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
  contentSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  headingBlock: {
    marginBottom: 32,
  },
  headingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    alignSelf: "flex-start",
    backgroundColor: "#3b82f6" + "15",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3b82f6" + "30",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3b82f6",
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f1f5f9",
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 21,
    fontWeight: "500",
  },
  featuresGrid: {
    marginBottom: 28,
    gap: 12,
  },
  featureCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 8,
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 16,
  },
  ctaSection: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
    marginTop: 8,
  },
  ctaContent: {
    marginBottom: 14,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 4,
  },
  ctaText: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  smallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    borderWidth: 1.5,
    flex: 1,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
});