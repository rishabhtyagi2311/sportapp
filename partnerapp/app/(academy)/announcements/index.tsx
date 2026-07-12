import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAnnouncementStore, Announcement } from "@/store/announcementStore";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

// ✅ TODO: Replace with your actual image path
const backgroundImage = require("@/assets/images/bgEnhancedCoverImage.png");

export default function ManageAnnouncementsScreen() {
  const [text, setText] = useState("");
  const { isTablet } = useResponsive();
  const { posts, addPost } = useAnnouncementStore();

  const handlePost = () => {
    if (!text.trim()) {
      // Using a cleaner custom check instead of Alert for a better UX could be next, 
      // but sticking to Alert for now as requested previously.
       alert("Please write an update before sending.");
      return;
    }
    addPost(text.trim());
    setText("");
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const renderItem = ({ item, index }: { item: Announcement; index: number }) => (
    // List items remain slightly transparent to let the background shine through nicely
    <FadeInView delay={Math.min(index, 8) * 40} className="bg-white rounded-2xl p-5 mb-4 border border-solid border-slate-900 shadow-sm">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center space-x-3">

          <Text className="text-black font-bold text-base tracking-wide">
            Message from the Academy
          </Text>
        </View>
        <Text className="text-black text-xs font-medium mt-1">
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Text className="text-black text-[15px] leading-7 pl-1">
        {item.content}
      </Text>
    </FadeInView>
  );

  return (
    // Base container is solid dark
    <View className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" />
      
      {/* 1. SOLID CLEAN HEADER */}
      <SafeAreaView className="bg-white z-20 shadow-md shadow-black/20">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-800">
          <TouchableOpacity 
              onPress={() => router.back()} 
              className="p-2 rounded-full bg-slate-800"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-black text-lg font-bold tracking-tight flex-1 text-center mr-10">
              Announcement Channel 
          </Text>
        </View>
      </SafeAreaView>

      {/* MIDDLE SECTION WITH IMAGE BACKGROUND */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ImageBackground 
            source={backgroundImage} 
            className="flex-1"
            resizeMode="cover"
        >
          {/* Overlay to ensure list readability over the image */}
          <View className="flex-1 bg-slate-950/70 px-4 pt-4">
              <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, maxWidth: isTablet ? 768 : undefined, width: '100%', alignSelf: 'center' }}
                ListHeaderComponent={
                  <Text className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-widest pl-1">
                    Recent History
                  </Text>
                }
              />
          </View>
        </ImageBackground>

        {/* 2. & 3. SOLID CLEAN FOOTER WITH SLEEKER BUTTON */}
        <SafeAreaView className="bg-neutral-300 z-20 border-t border-slate-800">
          <View className="px-2 py-4 flex flex-row items-center justify-between">
            
            {/* Input Field integrated into solid footer */}
            <View className="bg-slate-900 flex-1 rounded-2xl p-1  border border-slate-700 focus:border-blue-500/50 transition-all">
              <TextInput
                placeholder="Type your announcement here..."
                placeholderTextColor="#64748b"
                multiline
                maxLength={300}
                value={text}
                onChangeText={setText}
                className="text-white text-base min-h-[60px] px-4 py-3 font-medium"
                textAlignVertical="top"
                style={{ includeFontPadding: false }}
              />
            </View>

            {/* Sleeker "Pill-Shaped" Gradient Button */}
            <AnimatedPressable
              onPress={handlePost}
              className="rounded-2xl flex w-14 ml-2 h-20 items-center justify-center bg-neutral-300"
            >
              <Ionicons name="send" size={38} color="black" style={{ marginRight: 8 }} />
            </AnimatedPressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}