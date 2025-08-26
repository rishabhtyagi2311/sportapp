import React, { useRef } from "react";
import { 
  SafeAreaView, 
  View, 
  Image as RNImage, 
  Text, 
  TouchableWithoutFeedback, 
  Dimensions, 
  ScrollView, 
  Animated 
} from "react-native";
import Svg, { Defs, ClipPath, Path, Image as SvgImage } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function Academy() {
  const src = require("../../assets/images/academyCoverImage.jpg");
  const uri = RNImage.resolveAssetSource(src).uri;

  const handlePress = (action: string): void => {
    console.log(`${action} pressed`);
    // Add your navigation logic here
    if(action === 'Register')
    {
      router.navigate('./../(academy)/registerAcademy')
    }
  };

  interface ButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    style: any;
  }

  const ButtonComponent: React.FC<ButtonProps> = ({ icon, label, onPress, style }) => {
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
            <Text className="text-white font-semibold text-center text-sm" numberOfLines={2}>
              {label}
            </Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Cover Image with Wave */}
      <View className="w-full h-1/3 bg-slate-900">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <ClipPath id="img-clip">
              <Path
                d="
                  M0,0 
                  L100,0 
                  L100,70 
                  Q75,95 50,85 
                  Q25,75 0,90 
                  Z
                "
              />
            </ClipPath>
          </Defs>

          <SvgImage
            href={{ uri }}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#img-clip)"
          />
        </Svg>
      </View>

      {/* Content Area */}
      <View className="flex-1 bg-slate-900">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold text-center mb-2">Academy Connect</Text>
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
          <View className="items-center mb-8">
            <View className="flex-row justify-center mb-8">
              <View className="items-center mx-6">
                <ButtonComponent
                  icon="school-outline"
                  label="Register Academy"
                  onPress={() => handlePress("Register")}
                  style={{
                    width: width * 0.25,
                    height: width * 0.25,
                  }}
                />
              </View>

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
            </View>

            <View className="items-center">
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
