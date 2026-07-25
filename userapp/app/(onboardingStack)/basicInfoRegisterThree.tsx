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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import signUpStore from "./../../store/signUpStore"
import { useAuthStore } from "@/store/authStore";


type FormData = {
  city: string;
  dob: string;
  email: string;
  password: string;
};

export default function InfoRegisterScreen() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {name, contact, setDob, setCity, setEmail, setPassword} = signUpStore()
  const register = useAuthStore((state) => state.register);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      city: "",
      dob: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    setCity(data.city)
    setDob(data.dob)
    setEmail(data.email)
    setPassword(data.password)

    const [firstname, ...rest] = name.trim().split(/\s+/);
    const lastname = rest.join(" ") || firstname;

    try {
      await register({
        firstname,
        lastname,
        email: data.email,
        contact,
        city: data.city,
        dob: data.dob,
        password: data.password,
      });
      router.push("./../(homeScreenTabs)");
    } catch (err: any) {
      setSubmitError(err.message || "Server Issue, Try again");
    }
  }

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
                className="bg-white border-black border-4 overflow-hidden"
                style={{ height: "50%", borderTopRightRadius: 180 }}
              >
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 30 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text className="text-black text-2xl font-extrabold mt-8 ml-8 mb-2">
                    You are Almost there. 
                  </Text>
                  {/* City Input */}
                  <Text className="text-black text-xl  mt-8 ml-8 mb-2">
                    Enter Your City
                  </Text>

                  <View className="px-4">
                    <Controller
                      control={control}
                      name="city"
                      rules={{ required: "City is required" }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="border-2 border-black rounded-2xl bg-white px-4 py-3 text-base font-medium text-gray-800 mx-4"
                         
                          autoCorrect={false}
                          autoCapitalize="words"
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                    {errors.city && (
                      <Text className="text-red-800 font-medium ml-2 mt-1">
                        {errors.city.message}
                      </Text>
                    )}
                  </View>

                  {/* Date of Birth Input */}
                  <View className="px-4 mt-6">
                    <Text className="text-black text-xl  mb-2 ml-4">
                      Date of Birth
                    </Text>

                    <Controller
                      control={control}
                      name="dob"
                      rules={{
                        required: "Date of Birth is required",
                        pattern: {
                          value: /^\d{2}-\d{2}-\d{4}$/,
                          message: "Invalid format. Use dd-mm-yyyy",
                        },
                      }}
                      render={({ field: { onChange, value } }) => {
                        const handleInput = (text: string) => {
                          const digits = text.replace(/\D/g, "");

                          let formatted = digits;
                          if (digits.length > 2) {
                            formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
                          }
                          if (digits.length > 4) {
                            formatted = `${digits.slice(0, 2)}-${digits.slice(
                              2,
                              4
                            )}-${digits.slice(4, 8)}`;
                          }

                          onChange(formatted);
                        };

                        return (
                          <TextInput
                            className="border-2 border-black rounded-2xl bg-white px-4 py-3 text-base font-medium text-gray-800 mx-4"
                            placeholder="dd-mm-yyyy"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            maxLength={10}
                            value={value}
                            onChangeText={handleInput}
                          />
                        );
                      }}
                    />

                    {errors.dob && (
                      <Text className="text-red-800 font-medium ml-2 mt-1">
                        {errors.dob.message}
                      </Text>
                    )}
                  </View>

                  {/* Email Input */}
                  <View className="px-4 mt-6">
                    <Text className="text-black text-xl mb-2 ml-4">Email</Text>
                    <Controller
                      control={control}
                      name="email"
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
                      }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="border-2 border-black rounded-2xl bg-white px-4 py-3 text-base font-medium text-gray-800 mx-4"
                          placeholder="you@example.com"
                          placeholderTextColor="#9ca3af"
                          autoCorrect={false}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                    {errors.email && (
                      <Text className="text-red-800 font-medium ml-2 mt-1">
                        {errors.email.message}
                      </Text>
                    )}
                  </View>

                  {/* Password Input */}
                  <View className="px-4 mt-6">
                    <Text className="text-black text-xl mb-2 ml-4">Password</Text>
                    <Controller
                      control={control}
                      name="password"
                      rules={{
                        required: "Password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                      }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="border-2 border-black rounded-2xl bg-white px-4 py-3 text-base font-medium text-gray-800 mx-4"
                          placeholder="Choose a password"
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

                  {/* Submit Button */}
                  <View className="w-full flex items-center mt-8">
                    <TouchableOpacity
                      className="bg-black h-14 rounded-3xl flex items-center justify-center w-10/12"
                      onPress={handleSubmit(onSubmit)}
                    >
                      <Text className="text-white text-2xl font-bold">
                        Proceed
                      </Text>
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
