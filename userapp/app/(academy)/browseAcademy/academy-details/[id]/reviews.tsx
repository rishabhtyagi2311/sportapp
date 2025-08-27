import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams();
  const { getAcademyById } = useAcademyStore();
  const academy = getAcademyById(id as string);

  if (!academy) return null;

  // Generate consistent rating for this academy
  const generateRating = (academyName: string): number => {
    const hash = academyName.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 3.5 + (Math.abs(hash) % 15) / 10;
  };

  const academyRating = generateRating(academy.academyName);

  const mockReviews = [
    {
      name: 'Priya Sharma',
      rating: 5,
      comment: 'Excellent coaching and facilities. My child has improved tremendously under their guidance!',
      date: '2 weeks ago',
      verified: true,
    },
    {
      name: 'Rajesh Kumar', 
      rating: 4,
      comment: 'Good academy with professional coaches. The facilities are well-maintained and worth the investment.',
      date: '1 month ago',
      verified: true,
    },
    {
      name: 'Anita Patel',
      rating: 5,
      comment: 'Best academy in the area. Highly recommend for serious training and skill development.',
      date: '2 months ago',
      verified: false,
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color="#fbbf24" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#fbbf24" />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#d1d5db" />
      );
    }
    return stars;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      {/* Overall Rating Section */}
      <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
        <View className="items-center">
          <Text className="text-slate-900 text-xl font-bold mb-3">Overall Rating</Text>
          <Text className="text-5xl font-bold text-slate-900 mb-2">{academyRating.toFixed(1)}</Text>
          <View className="flex-row mb-2">
            {renderStars(academyRating)}
          </View>
          <Text className="text-gray-500 text-sm">Based on {mockReviews.length} reviews</Text>
        </View>
      </View>

      {/* Reviews Header */}
      <Text className="text-slate-900 text-xl font-bold mb-4">Student Reviews</Text>
      
      {/* Individual Reviews */}
      {mockReviews.map((review, index) => (
        <View
          key={index}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-slate-900 rounded-xl items-center justify-center mr-3">
                <Text className="text-white font-bold text-lg">
                  {review.name.charAt(0)}
                </Text>
              </View>
              <View>
                <View className="flex-row items-center">
                  <Text className="text-slate-900 font-bold text-base">{review.name}</Text>
                  {review.verified && (
                    <View className="ml-2 bg-green-100 rounded-full p-1">
                      <Ionicons name="checkmark" size={12} color="#10b981" />
                    </View>
                  )}
                </View>
                <Text className="text-gray-500 text-sm">{review.date}</Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center mb-4">
            {renderStars(review.rating)}
            <Text className="text-gray-600 text-sm ml-2 font-semibold">{review.rating}.0</Text>
          </View>
          
          <Text className="text-gray-700 leading-6 text-base">{review.comment}</Text>
        </View>
      ))}
    </ScrollView>
  );
}