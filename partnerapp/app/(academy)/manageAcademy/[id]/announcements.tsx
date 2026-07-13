import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useAnnouncementStore, Announcement } from "@/store/announcementStore";
import { useAcademyStore } from "@/store/academyStore";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

export default function AcademyAnnouncementsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isTablet } = useResponsive();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const academy = useAcademyStore((state) => state.academies.find((a) => a.id === id));
  const { posts, isLoading, fetchAnnouncements, addPost, removePost } = useAnnouncementStore();

  useFocusEffect(
    useCallback(() => {
      if (id) fetchAnnouncements(id);
    }, [id, fetchAnnouncements])
  );

  const handlePost = async () => {
    if (!id || !text.trim()) return;
    setPosting(true);
    try {
      await addPost(id, text.trim());
      setText("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not post announcement");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (announcement: Announcement) => {
    if (!id) return;
    Alert.alert("Delete Announcement", "Remove this update from the channel?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removePost(id, announcement.id).catch((err: any) =>
            Alert.alert("Error", err.message || "Could not remove announcement")
          );
        },
      },
    ]);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item, index }: { item: Announcement; index: number }) => (
    <FadeInView delay={Math.min(index, 8) * 40} className="bg-white rounded-2xl p-5 mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row items-start justify-between mb-3">
        <Text className="text-slate-900 font-bold text-sm">{academy?.academyName || "Academy"}</Text>
        <View className="flex-row items-center">
          <Text className="text-slate-400 text-xs font-medium mr-3">{formatDate(item.createdAt)}</Text>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={10}>
            <Ionicons name="trash-outline" size={16} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-slate-700 text-[15px] leading-6">{item.content}</Text>
    </FadeInView>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">Info Channel</Text>
          <Text className="text-xs text-slate-500">{academy?.academyName || "Loading..."}</Text>
        </View>
        {isLoading && <ActivityIndicator size="small" color="#2563eb" />}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ImageBackground
          source={require("@/assets/images/bgEnhancedCoverImage.png")}
          className="flex-1"
          resizeMode="cover"
        >
          <View className="flex-1 bg-slate-950/70">
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 20,
                flexGrow: 1,
                maxWidth: isTablet ? 768 : undefined,
                width: "100%",
                alignSelf: "center",
              }}
              ListHeaderComponent={
                <Text className="text-slate-300 text-xs font-bold mb-4 uppercase tracking-widest pl-1">
                  Broadcast updates to parents & students
                </Text>
              }
              ListEmptyComponent={
                !isLoading ? (
                  <View className="items-center justify-center py-16">
                    <Ionicons name="megaphone-outline" size={48} color="#94a3b8" />
                    <Text className="text-slate-300 mt-4 text-center">
                      No announcements yet.{"\n"}Post your first update below.
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        </ImageBackground>

        {/* COMPOSER */}
        <View className="bg-white border-t border-slate-100 px-4 py-3 flex-row items-center">
          <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 mr-2">
            <TextInput
              placeholder="Type an update for this academy..."
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={1000}
              value={text}
              onChangeText={setText}
              className="text-slate-900 text-base min-h-[44px] max-h-[120px]"
              textAlignVertical="top"
            />
          </View>
          <AnimatedPressable
            onPress={handlePost}
            disabled={posting || !text.trim()}
            className={`w-11 h-11 rounded-full items-center justify-center ${text.trim() ? "bg-blue-600" : "bg-slate-200"}`}
          >
            {posting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={18} color="white" />
            )}
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
