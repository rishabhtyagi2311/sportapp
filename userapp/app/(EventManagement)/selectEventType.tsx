// app/(venue)/eventManager/selectEventType.tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SelectEventTypeScreen() {
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;

  const handlePressIn = (scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header with Back Button */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-900 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white flex-1 text-center mr-10">
          Select Event Type
        </Text>
        <View className="w-10" />
      </View>

      {/* Scrollable Content */}
      <View className="flex-1 px-6 pt-8">
        {/* Subtitle */}
        <View className="mb-8">
          <Text className="text-slate-200 ml-4 text-base leading-relaxed">
            Choose the type of event you want to create
          </Text>
        </View>

        {/* Regular Event Card */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim1 }],
          }}
        >
          <TouchableOpacity
            onPress={() => router.push('/(EventManagement)/createEvent')}
            onPressIn={() => handlePressIn(scaleAnim1)}
            onPressOut={() => handlePressOut(scaleAnim1)}
            activeOpacity={0.9}
          >
            <View className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 mb-5 border border-blue-500/30">
              {/* Icon and Badge */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="w-14 h-14 bg-blue-500/30 rounded-2xl items-center justify-center">
                  <Ionicons name="calendar-outline" size={28} color="#60a5fa" />
                </View>
                <View className="bg-blue-400/20 px-3 py-1 rounded-full">
                  <Text className="text-blue-200 text-xs font-semibold">
                    Popular
                  </Text>
                </View>
              </View>

              {/* Content */}
              <Text className="text-white text-lg font-bold mb-2">
                Regular Event
              </Text>
              <Text className="text-blue-100 text-sm leading-5">
                Practice, friendly matches, training sessions
              </Text>

              {/* Arrow Icon */}
              <View className="mt-4">
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#93c5fd"
                  style={{ alignSelf: 'flex-end' }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Football Tournament Card */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim2 }],
          }}
        >
          <TouchableOpacity
            onPress={() =>
              router.push('/(EventManagement)/createFootballTournamentEvent')
            }
            onPressIn={() => handlePressIn(scaleAnim2)}
            onPressOut={() => handlePressOut(scaleAnim2)}
            activeOpacity={0.9}
          >
            <View className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 border border-emerald-500/30">
              {/* Icon and Badge */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="w-14 h-14 bg-emerald-500/30 rounded-2xl items-center justify-center">
                  <Ionicons name="trophy-outline" size={28} color="#4ade80" />
                </View>
                <View className="bg-emerald-400/20 px-3 py-1 rounded-full">
                  <Text className="text-emerald-200 text-xs font-semibold">
                    Competitive
                  </Text>
                </View>
              </View>

              {/* Content */}
              <Text className="text-white text-lg font-bold mb-2">
                Football Tournament
              </Text>
              <Text className="text-emerald-100 text-sm leading-5">
                League or knockout football competitions
              </Text>

              {/* Arrow Icon */}
              <View className="mt-4">
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#86efac"
                  style={{ alignSelf: 'flex-end' }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Spacing */}
        <View className="flex-1" />
      </View>
    </SafeAreaView>
  );
}