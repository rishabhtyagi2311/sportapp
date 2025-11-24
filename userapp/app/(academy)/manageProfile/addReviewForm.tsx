import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useReviewsStore } from "@/store/academyReviewStore";
import { usechildStore } from "@/store/academyChildProfile";

export default function AddAcademyReviewScreen() {
  const router = useRouter();
  const { academyId, academyName, childId, childName } =
    useLocalSearchParams<{
      academyId: string;
      academyName: string;
      childId: string;
      childName: string;
    }>();

  const addReview = useReviewsStore((state) => state.addReview);
  const childProfiles = usechildStore((state) => state.childProfiles);

  const childProfile = childProfiles.find((c) => c.id === childId);
  const reviewerName = childProfile?.fatherName || "Parent";
  const resolvedChildName = childProfile?.childName || childName || "Child";

  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = () => {
    if (!academyId || !childId) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      return;
    }
    if (rating === 0) {
      Alert.alert("Rating required", "Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      Alert.alert("Feedback required", "Please add a short comment.");
      return;
    }

    try {
      setIsSubmitting(true);
      addReview({
        academyId,
        academyName: academyName || "",
        childId,
        childName: resolvedChildName,
        reviewerName,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });

      Alert.alert(
        "Review submitted",
        "Thank you for sharing your feedback.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header with slate-900, like other screens */}
      <View className="bg-slate-900 shadow-lg">
        <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
          <TouchableOpacity
            onPress={handleBack}
            className="mr-3 p-2 rounded-lg"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              Rate Academy
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
              Add rating and feedback
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Rating */}
          <View className="mb-8">
            <Text className="text-slate-900 font-semibold text-sm mb-2">
              Overall rating *
            </Text>
            <Text className="text-slate-500 text-xs mb-4">
              How would you rate this academy based on your child's experience?
            </Text>

            <View className="flex-row items-center mt-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setRating(value)}
                  activeOpacity={0.8}
                  className="mr-3"
                >
                  <Ionicons
                    name={value <= rating ? "star" : "star-outline"}
                    size={32}
                    color={value <= rating ? "#f59e0b" : "#d1d5db"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {rating > 0 && (
              <Text className="mt-3 text-xs text-slate-500">
                You rated{" "}
                <Text className="font-semibold text-slate-900">
                  {rating} / 5
                </Text>
              </Text>
            )}
          </View>

          {/* Title */}
          <View className="mb-6">
            <Text className="text-slate-900 font-semibold text-sm mb-2">
              Review title (optional)
            </Text>
            <View className="border border-gray-300 rounded-xl flex-row items-center px-3 bg-white">
              <Ionicons name="text-outline" size={18} color="#9ca3af" />
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Great coaching, flexible timings"
                placeholderTextColor="#9ca3af"
                className="flex-1 text-slate-900 px-2 py-3 text-base"
                autoCapitalize="sentences"
              />
            </View>
          </View>

          {/* Detailed feedback */}
          <View className="mb-8">
            <Text className="text-slate-900 font-semibold text-sm mb-2">
              Detailed feedback *
            </Text>
            <Text className="text-slate-500 text-xs mb-3">
              Share what you liked and what could be improved.
            </Text>
            <View className="border border-gray-300 rounded-xl bg-white px-3 py-3">
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Write your feedback here..."
                placeholderTextColor="#9ca3af"
                className="text-slate-900 text-base"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
              />
            </View>
          </View>

          {/* Single clean Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`w-full rounded-xl py-3 items-center ${
              isSubmitting ? "bg-slate-400" : "bg-slate-900"
            }`}
            activeOpacity={0.9}
          >
            <Text className="text-white font-semibold text-base">
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
