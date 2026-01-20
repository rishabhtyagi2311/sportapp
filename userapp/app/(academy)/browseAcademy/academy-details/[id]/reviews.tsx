import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";
import { useReviewsStore } from "@/store/academyReviewStore";
import { formatDistanceToNow } from "date-fns";

export default function ReviewsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const academyId = id as string;

  const { getAcademyById } = useAcademyStore();
  const academy = getAcademyById(academyId);

  const { getReviewsByAcademy, getAverageRatingForAcademy } = useReviewsStore();

  const reviews = getReviewsByAcademy(academyId);
  const averageRating = getAverageRatingForAcademy(academyId) || 0;

  if (!academy) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-slate-900 font-semibold">
          Academy not found.
        </Text>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const formatReviewDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#fbbf24" />);
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#fbbf24" />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#d1d5db"
        />
      );
    }
    return stars;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
     
     
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Rating Section */}
        <View
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="items-center">
            <Text className="text-slate-900 text-lg font-semibold mb-2">
              Overall Rating
            </Text>
            <Text className="text-5xl font-bold text-slate-900 mb-2">
              {averageRating > 0 ? averageRating.toFixed(1) : "-"}
            </Text>
            <View className="flex-row mb-2">
              {averageRating > 0 ? renderStars(averageRating) : null}
            </View>
            <Text className="text-gray-500 text-sm">
              {reviews.length > 0
                ? `Based on ${reviews.length} ${
                    reviews.length === 1 ? "review" : "reviews"
                  }`
                : "No reviews yet"}
            </Text>
          </View>
        </View>

        {/* Section Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-slate-900 text-base font-semibold">
            Parent Feedback
          </Text>
          {reviews.length > 0 && (
            <Text className="text-gray-500 text-xs">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </Text>
          )}
        </View>

        {/* Reviews List */}
        {reviews.map((review) => (
          <View
            key={review.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            {/* Top row: avatar + parent name + child name + rating */}
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-slate-900 rounded-xl items-center justify-center mr-3">
                  <Text className="text-white font-bold text-lg">
                    {review.reviewerName?.charAt(0) ?? "P"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-semibold text-sm">
                    {review.reviewerName || "Parent"}
                  </Text>
                  {review.childName ? (
                    <Text className="text-gray-500 text-xs mt-0.5">
                      Parent of {review.childName}
                    </Text>
                  ) : null}
                  {review.createdAt && (
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {formatReviewDate(review.createdAt)}
                    </Text>
                  )}
                </View>
              </View>

              <View className="items-end ml-2">
                <View className="flex-row items-center">
                  {renderStars(review.rating)}
                </View>
                <Text className="text-gray-600 text-xs font-semibold mt-1">
                  {review.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            {/* Optional title */}
            {review.title ? (
              <Text className="text-slate-900 font-semibold text-sm mb-1">
                {review.title}
              </Text>
            ) : null}

            {/* Comment */}
            <Text className="text-gray-700 text-sm leading-5">
              {review.comment}
            </Text>
          </View>
        ))}

        {/* Empty State */}
        {reviews.length === 0 && (
          <View
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center mt-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={40}
              color="#94a3b8"
            />
            <Text className="text-slate-900 font-semibold text-lg mt-3">
              No reviews yet
            </Text>
            <Text className="text-gray-500 text-center mt-2 text-sm">
              Once parents submit reviews from their academy screen,
              they’ll appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
