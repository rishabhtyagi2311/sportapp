import React, { useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";
import { useReviewsStore } from "@/store/academyReviewStore";
import ReviewForm from "@/components/academyReviewForm";
import { formatDistanceToNow } from "date-fns";

// Simple mock user for demonstration purposes
const MOCK_USER = {
  id: 'user-123',
  name: 'John Doe',
};

export default function ReviewsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const academyId = id as string;
  const { getAcademyById } = useAcademyStore();
  const academy = getAcademyById(academyId);
  
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  
  // Get reviews and functions from the store
  const { 
    getReviewsByAcademy, 
    getAverageRatingForAcademy,
    getUserReviewForAcademy,
    addReview,
    updateReview,
    deleteReview
  } = useReviewsStore();
  
  // Get reviews for this academy
  const reviews = getReviewsByAcademy(academyId);
  
  // Calculate the average rating
  const averageRating = getAverageRatingForAcademy(academyId) || 0;
  
  // Get the current user's review
  const userReview = getUserReviewForAcademy(MOCK_USER.id, academyId);

  if (!academy) return null;

  const formatReviewDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const handleSubmitReview = (rating: number, comment: string) => {
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      if (isEditingReview && userReview) {
        updateReview(userReview.id, { rating, comment });
      } else {
        addReview({
          academyId,
          userId: MOCK_USER.id,
          userName: MOCK_USER.name,
          rating,
          comment,
        });
      }
      
      setIsSubmitting(false);
      setReviewModalVisible(false);
    }, 500);
  };

  const handleEditReview = () => {
    setIsEditingReview(true);
    setReviewModalVisible(true);
  };

  const handleDeleteReview = () => {
    if (userReview) {
      deleteReview(userReview.id);
    }
  };

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
  
  const openReviewForm = () => {
    setIsEditingReview(false);
    setReviewModalVisible(true);
  };

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50 p-6">
        {/* Overall Rating Section */}
        <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <View className="items-center">
            <Text className="text-slate-900 text-xl font-bold mb-3">Overall Rating</Text>
            <Text className="text-5xl font-bold text-slate-900 mb-2">
              {averageRating > 0 ? averageRating.toFixed(1) : "-"}
            </Text>
            <View className="flex-row mb-2">
              {renderStars(averageRating)}
            </View>
            <Text className="text-gray-500 text-sm">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
          
          {/* Add Review Button */}
          <TouchableOpacity
            onPress={userReview ? handleEditReview : openReviewForm}
            className={`mt-5 py-3 px-6 rounded-xl ${userReview ? 'bg-blue-50' : 'bg-blue-600'}`}
            activeOpacity={0.7}
          >
            <View className="flex-row justify-center items-center">
              <Ionicons 
                name={userReview ? "create-outline" : "star-outline"} 
                size={18} 
                color={userReview ? "#3b82f6" : "#ffffff"} 
              />
              <Text 
                className={`ml-2 font-bold ${userReview ? 'text-blue-600' : 'text-white'}`}
              >
                {userReview ? 'Edit Your Review' : 'Write a Review'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Reviews Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-slate-900 text-xl font-bold">Student Reviews</Text>
          {reviews.length === 0 && (
            <Text className="text-gray-500">No reviews yet</Text>
          )}
        </View>
        
        {/* Individual Reviews */}
        {reviews.map((review : any) => {
          const isUserReview = review.userId === MOCK_USER.id;
          
          return (
            <View
              key={review.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-slate-900 rounded-xl items-center justify-center mr-3">
                    <Text className="text-white font-bold text-lg">
                      {review.userName.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-slate-900 font-bold text-base">
                        {review.userName}
                        {isUserReview && " (You)"}
                      </Text>
                      {review.verified && (
                        <View className="ml-2 bg-green-100 rounded-full p-1">
                          <Ionicons name="checkmark" size={12} color="#10b981" />
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-500 text-sm">
                      {formatReviewDate(review.date)}
                    </Text>
                  </View>
                </View>
                
                {/* Action buttons for user's own review */}
                {isUserReview && (
                  <View className="flex-row">
                    <TouchableOpacity 
                      onPress={handleEditReview}
                      className="p-2 rounded-full mr-2"
                    >
                      <Ionicons name="create-outline" size={18} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleDeleteReview}
                      className="p-2 rounded-full"
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              <View className="flex-row items-center mb-4">
                {renderStars(review.rating)}
                <Text className="text-gray-600 text-sm ml-2 font-semibold">
                  {review.rating}.0
                </Text>
              </View>
              
              <Text className="text-gray-700 leading-6 text-base">
                {review.comment}
              </Text>
            </View>
          );
        })}
        
        {/* Empty State */}
        {reviews.length === 0 && (
          <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center mt-2">
            <Ionicons name="chatbox-ellipses-outline" size={48} color="#94a3b8" />
            <Text className="text-slate-900 font-bold text-lg mt-4">No Reviews Yet</Text>
            <Text className="text-gray-500 text-center mt-2">
              Be the first to share your experience with this academy
            </Text>
            <TouchableOpacity
              onPress={openReviewForm}
              className="mt-5 bg-blue-600 py-3 px-6 rounded-xl"
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold">Write a Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Review Form Modal */}
      <ReviewForm
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        initialRating={userReview?.rating ?? 5}
        initialComment={userReview?.comment ?? ''}
        isEditing={isEditingReview}
      />
      
      {/* Loading indicator */}
      {isSubmitting && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 items-center justify-center">
          <View className="bg-white p-5 rounded-xl">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        </View>
      )}
    </>
  );
}