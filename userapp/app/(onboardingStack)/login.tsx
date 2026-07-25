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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";

type FormData = {
  identifier: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await login(data);
      router.replace("./../(homeScreenTabs)");
    } catch (err: any) {
      setSubmitError(err.message || "Please check your credentials.");
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
        <SafeAreaView edges={['bottom']} className="flex-1 bg-white">
          <ImageBackground
            source={require("../../assets/images/coverImageNew.png")}
            resizeMode="cover"
            className="flex-1"
          >
            <View className="flex-1 justify-end">
              <View
                className="bg-white border-black border-4 overflow-hidden"
                style={{ height: "50%", borderTopRightRadius: 180 }}
              >
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 30 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text className="text-black text-2xl font-extrabold mt-8 ml-8 mb-6">
                    Log In
                  </Text>

                  <View className="px-4">
                    <Text className="text-black text-xl mb-2 ml-4">Email or Phone</Text>
                    <Controller
                      control={control}
                      name="identifier"
                      rules={{ required: "Email or phone number is required" }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="border-2 border-black rounded-2xl bg-white px-4 py-3 text-base font-medium text-gray-800 mx-4"
                          placeholder="you@example.com or phone number"
                          placeholderTextColor="#9ca3af"
                          autoCorrect={false}
                          autoCapitalize="none"
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                    {errors.identifier && (
                      <Text className="text-red-800 font-medium ml-2 mt-1">
                        {errors.identifier.message}
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
                        <TextInput
                          className="border-2 border-black rounded-2xl bg-white px-4 py-3 text-base font-medium text-gray-800 mx-4"
                          placeholder="Password"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry
                          autoCapitalize="none"
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                    {errors.password && (
                      <Text className="text-red-800 font-medium ml-2 mt-1">
                        {errors.password.message}
                      </Text>
                    )}
                  </View>

                  {submitError && (
                    <Text className="text-red-800 font-medium ml-8 mt-4">
                      {submitError}
                    </Text>
                  )}

                  <View className="w-full flex items-center mt-8">
                    <TouchableOpacity
                      className="bg-black h-14 rounded-3xl flex items-center justify-center w-10/12"
                      onPress={handleSubmit(onSubmit)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-white text-2xl font-bold">Login</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className="mt-6 items-center"
                    onPress={() => router.push("./signUp")}
                  >
                    <Text className="text-black font-medium underline">
                      New here? Create an account
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
