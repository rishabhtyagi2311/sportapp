import React, { useState } from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

type FormData = {
  contactNumber: string;
  password: string;
};

export default function PartnerLoginScreen() {
  const router = useRouter();
  const { isTablet } = useResponsive();
  const login = useAuthStore((state) => state.login);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { contactNumber: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await login(data);
      router.replace("./../(homeScreenTabs)");
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white">
          <ImageBackground
            source={require("../../assets/images/coverImageNew.png")}
            resizeMode="cover"
            className="flex-1"
          >
            <View className="flex-1 justify-end">
              <View
                className="bg-white border-black border-4"
                style={{ height: "55%", borderTopRightRadius: 180 }}
              >
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 30 }}
                  keyboardShouldPersistTaps="handled"
                >
                <FadeInView className={isTablet ? "self-center w-full max-w-md" : "w-full"}>
                  <Text className="text-black text-2xl font-extrabold mt-8 ml-8 mb-6">
                    Partner Login
                  </Text>

                  <View className="px-4">
                    <Text className="text-black text-xl mb-2 ml-4">Contact Number</Text>
                    <Controller
                      control={control}
                      name="contactNumber"
                      rules={{
                        required: "Contact number is required",
                        pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit number" },
                      }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="border-2 border-black rounded-2xl bg-white px-4 py-3 text-base font-medium text-gray-800 mx-4"
                          placeholder="Phone number"
                          placeholderTextColor="#9ca3af"
                          keyboardType="phone-pad"
                          maxLength={10}
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                    {errors.contactNumber && (
                      <Text className="text-red-800 font-medium ml-2 mt-1">
                        {errors.contactNumber.message}
                      </Text>
                    )}
                  </View>

                  <View className="px-4 mt-6">
                    <Text className="text-black text-xl mb-2 ml-4">Password</Text>
                    <Controller
                      control={control}
                      name="password"
                      rules={{ required: "Password is required" }}
                      render={({ field: { onChange, value } }) => (
                        <View className="flex-row items-center border-2 border-black rounded-2xl bg-white mx-4">
                          <TextInput
                            className="flex-1 px-4 py-3 text-base font-medium text-gray-800"
                            style={{ textAlignVertical: 'center', includeFontPadding: false }}
                            placeholder="Password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            value={value}
                            onChangeText={onChange}
                          />
                          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} className="px-4">
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                    {errors.password && (
                      <Text className="text-red-800 font-medium ml-2 mt-1">
                        {errors.password.message}
                      </Text>
                    )}
                  </View>

                  <View className="w-full flex items-center mt-8">
                    <AnimatedPressable
                      className="bg-black h-14 rounded-3xl flex items-center justify-center w-10/12"
                      onPress={handleSubmit(onSubmit)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-white text-2xl font-bold">Login</Text>
                      )}
                    </AnimatedPressable>
                  </View>

                  <TouchableOpacity
                    className="mt-6 items-center"
                    onPress={() => router.push("./basicInfoRegisterOne")}
                  >
                    <Text className="text-black font-medium underline">
                      New partner? Create an account
                    </Text>
                  </TouchableOpacity>
                </FadeInView>
                </ScrollView>
              </View>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
