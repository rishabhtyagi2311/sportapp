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
  ImageBackground
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { User, Mail } from "lucide-react-native";
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

type FormData = {
  phone: string;
};

export default function InfoRegisterScreen() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const router = useRouter();
  const {setContact} = signUpStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      phone: '',
    },
  });

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.out(Easing.exp) }),
        withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.8, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const onSubmit = async (data: FormData) => {
    setContact(data.phone)
    router.push("./basicInfoRegisterThree");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white">
          <ImageBackground
            source={require('../../assets/images/coverImage.jpg')}
            resizeMode="cover"
            className="flex-1"
          >
            <View className="flex-1 justify-end">
              <View
                className="bg-white border-black border-4"
                style={{ height: "40%", borderTopRightRadius: 180 }}
              >
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 30 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text
                    className="text-black text-2xl font-extrabold mt-8 ml-8 mb-2"
                  >
                    Enter Your Contact Number 
                  </Text>
                  <Text className="mb-10 ml-8">
                   An OTP will be sent for verification
                  </Text>

                  <View className="px-4">
                    {/* Country Code + Phone Input */}
                    <View className="flex-row w-full mb-8">
                      {/* Static India Country Code */}
                      <View className="border-2 border-black rounded-2xl bg-white px-4 py-1.5 h-14 min-w-[120px] shadow justify-center">
                        <View className="flex-row items-center">
                          <Text className="text-xl mr-2">🇮🇳</Text>
                          <Text className="text-base font-bold text-gray-800">
                            +91
                          </Text>
                        </View>
                      </View>

                      {/* Phone Number Input */}
                      <View className="flex-1 border-2 border-black rounded-2xl bg-white px-4 h-14 justify-center shadow ml-2">
                        <Controller
                          control={control}
                          name="phone"
                          rules={{ 
                            required: "Phone number is required",
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: "Please enter a valid 10-digit phone number"
                            }
                          }}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              className="text-base text-gray-800 font-medium"
                              placeholder="Phone number"
                              placeholderTextColor="#9ca3af"
                              keyboardType="phone-pad"
                              autoCorrect={false}
                              autoCapitalize="none"
                              maxLength={10}
                              value={value}
                              onChangeText={onChange}
                            />
                          )}
                        />
                      </View>
                    </View>

                    {errors.phone && (
                      <Text className="text-red-800 font-medium ml-2 mb-2">
                        {errors.phone.message}
                      </Text>
                    )}
                  </View>

                  <View className="w-full flex items-center mt-4">
                    <TouchableOpacity
                      className="bg-black h-14 rounded-3xl flex items-center justify-center w-10/12"
                      onPress={handleSubmit(onSubmit)}
                    >
                      <Text className="text-white text-2xl font-bold">Proceed</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}