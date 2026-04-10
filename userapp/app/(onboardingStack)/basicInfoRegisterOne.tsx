import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Dimensions
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { User, Phone } from "lucide-react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useRouter } from "expo-router";
import signUpStore from "./../../store/signUpStore"

const { width, height } = Dimensions.get('window');
const isTablet = width >= 500;

type FormData = {
  name: string;
  phone: string;
};

export default function InfoRegisterScreen() {
  const { setName, setContact } = signUpStore();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.9);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1200, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const onSubmit = async (data: FormData) => {
    setName(data.name);
    setContact(data.phone);
    router.push("./../(homeScreenTabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <ImageBackground
            source={require('../../assets/images/coverImageNew.png')}
            className="flex-1"
            resizeMode="cover"
          >
            {/* Spacer to push content down */}
            <View className="flex-1" />

            {/* Content Container */}
            <View 
              className="bg-white px-8 pt-10  "
              style={{ 
                height: height * 0.47, 
                borderTopRightRadius: isTablet ? 220 : 220,
                borderTopWidth: 4,
                borderRightWidth: 4,
                borderColor: '#000'
              }}
            >
              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                className="mt-12"
              >
                <Animated.View entering={FadeInDown.delay(100)}>
                  <Animated.Text
                    style={animatedTextStyle}
                    className="text-black text-4xl ml-2 font-black mb-8"
                  >
                    Get Started.
                  </Animated.Text>
                </Animated.View>

                {/* Name Input */}
                <KeyboardAvoidingView className="mb-6 ">
                  <View className="flex-row items-center bg-slate-50 rounded-2xl border-2 border-black h-16 px-4 shadow-sm">
                    <User size={22} color="#000" />
                    <Controller
                      control={control}
                      name="name"
                      rules={{ required: "Name is required" }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="flex-1 ml-3 text-lg font-bold text-black "
                          placeholder="Full Name"
                          placeholderTextColor="#94A3B8"
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                    />
                  </View>
                  {errors.name && (
                    <Text className="text-red-600 font-bold mt-1 ml-2">{errors.name.message}</Text>
                  )}
                </KeyboardAvoidingView>

                {/* Phone Input Group */}
                <Animated.View entering={FadeInDown.delay(300)} className="mb-8">
                  <View className="flex-row">
                    {/* Country Code */}
                    <View className="bg-slate-100 border-2 border-black rounded-2xl px-4 h-16 justify-center items-center flex-row">
                      <Text className="text-xl mr-1">🇮🇳</Text>
                      <Text className="text-lg font-black">+91</Text>
                    </View>

                    {/* Number Field */}
                    <View className="flex-1 ml-3 bg-slate-50 border-2 border-black rounded-2xl px-4 h-16 justify-center shadow-sm">
                      <Controller
                        control={control}
                        name="phone"
                        rules={{
                          required: "Required",
                          pattern: { value: /^[0-9]{10}$/, message: "Invalid number" }
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            className="text-lg font-bold text-black"
                            placeholder="Phone number"
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={value}
                            onChangeText={onChange}
                          />
                        )}
                      />
                    </View>
                  </View>
                  {errors.phone && (
                    <Text className="text-red-600 font-bold mt-1 ml-2">{errors.phone.message}</Text>
                  )}
                </Animated.View>

                {/* Submit Button */}
                <Animated.View entering={FadeInDown.delay(400)} className="items-center pb-10">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={{ 
                      width: '100%', 
                      shadowColor: "#000",
                      shadowOffset: { width: 4, height: 4 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                    }}
                    className="bg-black h-16 rounded-2xl items-center justify-center flex-row"
                    onPress={handleSubmit(onSubmit)}
                  >
                    <Text className="text-white text-xl font-black mr-2 uppercase tracking-tighter">
                      Proceed
                    </Text>
                    <Phone size={20} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>
              </ScrollView>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}