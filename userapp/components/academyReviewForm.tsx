import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

interface ReviewFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  initialRating?: number;
  initialComment?: string;
  isEditing?: boolean;
}

export default function ReviewForm({
  visible,
  onClose,
  onSubmit,
  initialRating = 5,
  initialComment = '',
  isEditing = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = () => {
    if (comment.trim().length < 10) {
      setError('Please write a review with at least 10 characters');
      return;
    }
    
    onSubmit(rating, comment);
    setRating(5);
    setComment('');
    setError(null);
  };
  
  const renderStarInput = () => {
    return (
      <View className="flex-row justify-center my-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => setRating(star)}
            className="mx-2"
          >
            <Ionicons 
              name={star <= rating ? "star" : "star-outline"} 
              size={32} 
              color={star <= rating ? "#fbbf24" : "#d1d5db"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pb-8">
            {/* Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close-outline" size={24} color="#0f172a" />
              </TouchableOpacity>
              <Text className="text-slate-900 font-bold text-lg">
                {isEditing ? 'Edit Your Review' : 'Write a Review'}
              </Text>
              <View className="w-10" />
            </View>
            
            <ScrollView className="p-5">
              {/* Rating Selection */}
              <Text className="text-slate-900 font-semibold text-base text-center mb-2">
                How would you rate this academy?
              </Text>
              {renderStarInput()}
              
              {/* Review Text Input */}
              <Text className="text-slate-900 font-semibold text-base mt-4 mb-2">
                Your Review
              </Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 min-h-[120px] text-slate-800 leading-5 bg-gray-50"
                placeholder="Share your experience with this academy..."
                multiline={true}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
              
              {error && (
                <Text className="text-red-500 mt-2">{error}</Text>
              )}
              
              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-blue-600 rounded-xl py-4 mt-6"
                activeOpacity={0.7}
              >
                <Text className="text-white text-center font-bold text-base">
                  {isEditing ? 'Update Review' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}