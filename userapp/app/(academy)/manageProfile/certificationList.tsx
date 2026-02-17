import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCertificateStore, Certificate } from "@/store/academyCertifications";

export default function CertificationsScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  
  // Dummy Data (Filtering by childId to simulate real behavior)
  const allDummyCertificates: Certificate[] = [
    {
      id: '1',
      childId: 'child_01',
      academyName: 'Star Cricket Academy',
      recipientName: 'Rahul Kumar',
      achievementText: 'Best Bowler of the Month',
      date: 'Feb 15, 2026',
      headCoachName: 'Coach Vikram Singh',
    },
    {
      id: '2',
      childId: 'child_01',
      academyName: 'Star Cricket Academy',
      recipientName: 'Rahul Kumar',
      achievementText: 'Outstanding Discipline Award',
      date: 'Jan 20, 2026',
      headCoachName: 'Coach Vikram Singh',
    },
    {
      id: '3',
      childId: 'child_01',
      academyName: 'Elite Tennis Club',
      recipientName: 'Rahul Kumar',
      achievementText: 'Inter-Academy Runner Up',
      date: 'Dec 12, 2025',
      headCoachName: 'Sania Mirza',
    },
    {
      id: '4',
      childId: 'child_02',
      academyName: 'Global Football Academy',
      recipientName: 'Sneha Kapoor',
      achievementText: 'Most Improved Player',
      date: 'Feb 05, 2026',
      headCoachName: 'Coach Ricardo',
    },
    {
      id: '5',
      childId: 'child_02',
      academyName: 'Global Football Academy',
      recipientName: 'Sneha Kapoor',
      achievementText: 'Top Scorer - Winter League',
      date: 'Jan 15, 2026',
      headCoachName: 'Coach Ricardo',
    }
  ];

  // Filter based on the child profile being viewed
  const certificates = allDummyCertificates

  const handleViewCertificate = (cert: Certificate) => {
    router.push({
      pathname: "/(academy)/manageProfile/certificates",
      params: { 
        id: cert.id,
        academyName: cert.academyName,
        recipientName: cert.recipientName,
        achievementText: cert.achievementText,
        date: cert.date,
        headCoachName: cert.headCoachName
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 ml-2">Certifications</Text>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 px-1">
          Achievements ({certificates.length})
        </Text>

        {certificates.length > 0 ? (
          certificates.map((cert) => (
            <TouchableOpacity
              key={cert.id}
              activeOpacity={0.8}
              onPress={() => handleViewCertificate(cert)}
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm"
            >
              <View className="flex-row items-center">
                {/* Achievement Badge Icon */}
                <View className="h-12 w-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="ribbon" size={24} color="#4f46e5" />
                </View>

                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-lg leading-6" numberOfLines={2}>
                    {cert.achievementText}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-xs ml-1 font-medium">
                      {cert.date}
                    </Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-slate-100 p-6 rounded-full mb-4">
              <Ionicons name="medal-outline" size={40} color="#94a3b8" />
            </View>
            <Text className="text-slate-900 font-bold text-lg">No certificates yet</Text>
            <Text className="text-slate-400 text-center mt-2 px-10">
              Certificates awarded for this child will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}