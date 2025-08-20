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
import { ChevronDown, User, Mail, MapPin } from "lucide-react-native";
import Animated, {
  FadeInDown, FlipInYRight, FlipOutYLeft,
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
  firstName: string;
  lastName: string;
  email: string;
};




export default function InfoRegisterScreen() {
  
  const { setFirstName, setLastName, setEmail} = signUpStore();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const router = useRouter()
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
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
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));



 

  const onSubmit = async (data: FormData) => {

  
  setFirstName(data.firstName)
  setLastName(data.lastName)
  setEmail(data.email)
  
  router.push("./basicInfoRegisterTwo")





  };

  const renderInput = (
    name: keyof FormData,
    label: string,
    icon: React.ReactNode,
    rules: object = {},
    props: object = {}
  ) => (
    <Animated.View entering={FadeInDown.delay(200)} className="m-2 self-center">


      <View className="flex-row items-center bg-white rounded-xl border border-black h-14 px-4 shadow-sm mb-6 w-11/12">
        <View className="mr-3">{icon}</View>
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="flex-1 text-base text-black"
              placeholder={`Enter ${label}`}
              placeholderTextColor="#94A3B8"
              onChangeText={onChange}
              value={value}
              {...props}
            />
          )}
        />
      </View>
      {errors[name] && (
        <Animated.Text entering={FadeInDown} className="text-red-900 text-base font-bold ml-4 ">
          {errors[name]?.message as string}
        </Animated.Text>
      )}
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // adjust if needed
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
                style={{ height: "60%", borderTopRightRadius: 180 }}
              >
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 30 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Animated.Text
                    style={animatedStyle}
                    className="text-black text-3xl font-extrabold  mt-8 mb-10 ml-12"
                  >
                    Get Started.
                  </Animated.Text>

                  <View className="px-2 flex ">
                    
                    {renderInput("firstName", "First Name", <User size={20} color="#64748B" />, {
                      required: "First name is required",
                    })}
                    {renderInput("lastName", "Last Name", <User size={20} color="#64748B" />, {
                      required: "Last name is required",
                    })}
                    {renderInput(
                      "email",
                      "Email",
                      <Mail size={20} color="#64748B" />,
                      {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: "Please enter a valid email",
                        },
                      },
                      { keyboardType: "email-address" }
                    )}
                  </View>

                  <View className="w-full flex items-center mt-6">
                    <TouchableOpacity
                      className="bg-black h-14 rounded-3xl flex items-center justify-center w-10/12"
                      onPress={handleSubmit(onSubmit)}
                    >
                      <Text className="text-white text-2xl font-bold ">Proceed</Text>
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
