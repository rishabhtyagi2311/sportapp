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
import { ChevronDown, ChevronUp, User, Mail } from "lucide-react-native";
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

import { countryCodes, CountryCodeWithCities} from './../../data/countryCodeswithCities';
import signUpStore from "./../../store/signUpStore"
type FormData = {
  phone: string;
};

export default function InfoRegisterScreen() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeWithCities>(
    countryCodes.find(c => c.dialCode === '+91') || countryCodes[0]
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const router = useRouter();
  const { signUpDetails, addSignUpDetails } = signUpStore();

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
    console.log(signUpDetails);
    
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

                  <View className="px-4 ">
                    {/* Country Code + Phone Input */}
                    <View className=" flex-row  w-full mb-8 ">
                      <View className="relative z-50">
                        <TouchableOpacity
                          className={`flex-row items-center justify-between border-2 border-black rounded-2xl bg-white px-4 py-1.5 h-14 min-w-[120px] shadow ${
                            dropdownVisible ? 'rounded-b-md shadow-lg' : ''
                          }`}
                          onPress={() => setDropdownVisible(!dropdownVisible)}
                          activeOpacity={0.8}
                        >
                          <View className="flex-row items-center flex-1">
                            <Text className="text-xl mr-2">{selectedCountry.flag}</Text>
                            <Text className="text-base font-bold text-gray-800">
                              {selectedCountry.dialCode}
                            </Text>
                          </View>
                          <View className="ml-2 p-0.5">
                            {dropdownVisible ? (
                              <ChevronUp size={18} color="#6b7280" strokeWidth={2.5} />
                            ) : (
                              <ChevronDown size={18} color="#6b7280" strokeWidth={2.5} />
                            )}
                          </View>
                        </TouchableOpacity>

                        {dropdownVisible && (
                          <View className="absolute top-14 left-0 right-0 bg-white border-2 border-black border-t-0 rounded-b-2xl max-h-56 shadow-lg">
                            <ScrollView
                              className="flex-1"
                              showsVerticalScrollIndicator={false}
                              nestedScrollEnabled={true}
                            >
                              {countryCodes.map((country, index) => (
                                <TouchableOpacity
                                  key={country.code}
                                  className={`flex-row items-center px-4 py-3 border-b border-gray-100 ${
                                    selectedCountry.code === country.code ? 'bg-blue-50 border-blue-100' : ''
                                  } ${index === countryCodes.length - 1 ? 'border-b-0' : ''}`}
                                  onPress={() => {
                                    setSelectedCountry(country);
                                    setDropdownVisible(false);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text className="text-lg mr-3">{country.flag}</Text>
                                  <Text
                                    className={`text-base font-semibold text-gray-700 ${
                                      selectedCountry.code === country.code ? 'text-sky-700 font-bold' : ''
                                    }`}
                                  >
                                    {country.dialCode}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>

                      <View className="flex-1 border-2 border-black rounded-2xl bg-white px-4 h-14 justify-center shadow ml-2">
                        <Controller
                          control={control}
                          name="phone"
                          rules={{ required: "Phone number is required" }}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              className="text-base text-gray-800 font-medium"
                              placeholder="Phone number"
                              placeholderTextColor="#9ca3af"
                              keyboardType="phone-pad"
                              autoCorrect={false}
                              autoCapitalize="none"
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
