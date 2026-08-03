import React, { useCallback, useMemo } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";
import { Review } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";

function StarRow({ rating }: { rating: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= rating ? "star" : "star-outline"}
          size={14}
          color="#f59e0b"
        />
      ))}
    </View>
  );
}

export default function AcademyReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isTablet } = useResponsive();

  const academy = useAcademyStore((state) => state.academies.find((a) => a.id === id));
  const isLoading = useAcademyStore((state) => state.isLoading);
  const allReviews = useAcademyStore((state) => state.reviews);
  const fetchReviews = useAcademyStore((state) => state.fetchReviews);
  const reviews = useMemo(() => allReviews.filter((r) => r.academyId === id), [allReviews, id]);

  useFocusEffect(
    useCallback(() => {
      if (id) fetchReviews(id);
    }, [id, fetchReviews])
  );

  if (!academy) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Academy not found</Text>
      </SafeAreaView>
    );
  }

  const renderReview = ({ item, index }: { item: Review; index: number }) => (
    <FadeInView delay={Math.min(index, 8) * 50} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <StarRow rating={item.rating} />
        <Text className="text-xs text-slate-400">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {item.title ? (
        <Text className="text-base font-bold text-slate-900 mb-1">{item.title}</Text>
      ) : null}
      <Text className="text-sm text-slate-600 mb-2">{item.comment}</Text>
      {item.childName ? (
        <Text className="text-xs text-slate-400">— {item.childName}'s parent</Text>
      ) : null}
    </FadeInView>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-white">Reviews</Text>
          <Text className="text-slate-300 text-xs">
            {academy.averageRating?.toFixed(1) ?? '0.0'} average · {academy.reviewCount ?? reviews.length} review{(academy.reviewCount ?? reviews.length) === 1 ? '' : 's'}
          </Text>
        </View>
        {isLoading && <ActivityIndicator color="white" size="small" />}
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={{ padding: 16, maxWidth: isTablet ? 768 : undefined, width: '100%', alignSelf: 'center' }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="star-outline" size={56} color="#cbd5e1" />
              <Text className="text-slate-400 mt-4 text-center">
                No reviews yet.{"\n"}Reviews from parents will show up here.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
