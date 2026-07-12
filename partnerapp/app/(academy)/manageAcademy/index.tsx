import React, { useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAcademyStore } from '@/store/academyStore';
import AcademyCard from '@/components/AcademyCard';
import { useResponsive } from '@/hooks/useResponsive';
import FadeInView from '@/components/animated/FadeInView';

export default function AcademyListScreen() {
  const { isTablet } = useResponsive();
  const { academies, isLoading, fetchMyAcademies, deleteAcademy } = useAcademyStore();

  const handleDelete = (academyId: string, academyName: string) => {
    Alert.alert('Delete Academy', `Remove "${academyName}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteAcademy(academyId).catch((err: any) =>
            Alert.alert('Error', err.message || 'Could not delete academy')
          );
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyAcademies();
    }, [fetchMyAcademies])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Custom Header */}
      <View className="flex-row items-center px-4 py-3 mt-2 mb-4 bg-slate-900 shadow-sm border-b border-gray-200">
        <TouchableOpacity onPress={() => router.navigate("/(homeScreenTabs)/academy")} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white flex-1">My Academies</Text>
        {isLoading && <ActivityIndicator color="white" size="small" />}
      </View>

      {/* List Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMyAcademies} />}
      >
        <View className={isTablet ? 'self-center w-full max-w-3xl' : 'w-full'}>
          {academies.length === 0 && !isLoading && (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-gray-500">No academies registered yet.</Text>
            </View>
          )}
          {academies.map((academy, index) => (
            <FadeInView key={academy.id} delay={Math.min(index, 6) * 60}>
              <AcademyCard
                academy={academy}
                onPress={() => router.push(`/manageAcademy/${academy.id}`)}
                onDelete={() => handleDelete(academy.id, academy.academyName)}
              />
            </FadeInView>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
