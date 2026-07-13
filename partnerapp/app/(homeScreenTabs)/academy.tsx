import React, { useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

// Defined outside the component so identity is stable across renders —
// declaring these inline in the render body causes React to treat them as a
// brand-new component type on every render, forcing a full unmount/remount.
const StatPill = ({
  icon,
  value,
  label,
  delay = 0,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  delay?: number;
}) => (
  <FadeInView delay={delay} className="flex-1">
    <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm items-center">
      <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100 mb-2">
        {icon}
      </View>
      <Text className="text-slate-900 font-black text-xl">{value}</Text>
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
        {label}
      </Text>
    </View>
  </FadeInView>
);

const ActionRow = ({
  title,
  subtitle,
  icon,
  gradientColors,
  borderColor,
  onPress,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradientColors: string;
  borderColor: string;
  onPress: () => void;
  delay?: number;
}) => (
  <FadeInView delay={delay}>
    <AnimatedPressable
      onPress={onPress}
      className={`rounded-2xl overflow-hidden mb-4 border ${borderColor} bg-white shadow-sm`}
    >
      <View className={`p-5 flex-row items-center justify-between ${gradientColors}`}>
        <View className="flex-1 mr-4">
          <Text className="font-bold text-slate-800 text-lg mb-1">{title}</Text>
          <Text className="text-slate-500 text-sm leading-5">{subtitle}</Text>
        </View>
        <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center shadow-sm">
          {icon}
        </View>
      </View>
    </AnimatedPressable>
  </FadeInView>
);

const FeatureChip = ({ label }: { label: string }) => (
  <View className="bg-white/10 border border-white/10 rounded-full px-3 py-1.5 mr-2 mb-2">
    <Text className="text-slate-200 text-[11px] font-bold">{label}</Text>
  </View>
);

export default function AcademyMainScreen() {
  const { isTablet } = useResponsive();

  const academies = useAcademyStore((state) => state.academies);
  const fetchMyAcademies = useAcademyStore((state) => state.fetchMyAcademies);

  useFocusEffect(
    useCallback(() => {
      fetchMyAcademies();
    }, [fetchMyAcademies])
  );

  const totalAcademies = academies.length;
  const totalStudents = academies.reduce((sum, a) => sum + (a.studentCount || 0), 0);
  const activeAcademies = academies.filter((a) => a.isActive !== false).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="bg-slate-900 pt-6 pb-8 px-6 rounded-b-[32px] shadow-lg">
          <View className={isTablet ? "self-center w-full max-w-2xl" : "w-full"}>
            <FadeInView direction="none" className="flex-row items-center mb-4">
              <View className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 items-center justify-center mr-4">
                <MaterialCommunityIcons name="whistle-outline" size={28} color="#60a5fa" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-black">Academy Center</Text>
                <Text className="text-slate-400 text-xs font-medium mt-0.5">
                  Coaching, batches & student growth — all in one place
                </Text>
              </View>
            </FadeInView>

            <FadeInView delay={60} direction="none" className="flex-row flex-wrap mb-1">
              <FeatureChip label="Coaches" />
              <FeatureChip label="Students" />
              <FeatureChip label="Attendance" />
              <FeatureChip label="Photos" />
              <FeatureChip label="Certificates" />
            </FadeInView>
          </View>
        </View>

        <View className="px-6 -mt-5">
          <View className={isTablet ? "self-center w-full max-w-2xl" : "w-full"}>
            {/* STATS */}
            <FadeInView delay={100} className="flex-row gap-3 mb-8">
              <StatPill
                icon={<Ionicons name="business-outline" size={18} color="#2563eb" />}
                value={totalAcademies}
                label="Academies"
              />
              <StatPill
                icon={<Ionicons name="people-outline" size={18} color="#16a34a" />}
                value={totalStudents}
                label="Students"
              />
              <StatPill
                icon={<Ionicons name="checkmark-circle-outline" size={18} color="#9333ea" />}
                value={activeAcademies}
                label="Active"
              />
            </FadeInView>

            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
              What would you like to do?
            </Text>

            <ActionRow
              delay={140}
              title="Register Academy"
              subtitle="List a new academy and start onboarding coaches & students"
              icon={<Ionicons name="add-circle-outline" size={26} color="#2563eb" />}
              gradientColors="bg-blue-50/60"
              borderColor="border-blue-100"
              onPress={() => router.navigate("./../(academy)/registerAcademy")}
            />

            <ActionRow
              delay={190}
              title="Manage Academies"
              subtitle="Coaches, students, attendance, photos, certificates & info channel"
              icon={<Ionicons name="trophy-outline" size={26} color="#ca8a04" />}
              gradientColors="bg-amber-50/60"
              borderColor="border-amber-100"
              onPress={() => router.navigate("./../manageAcademy")}
            />

            {totalAcademies === 0 && (
              <FadeInView delay={290} className="items-center mt-6 px-4">
                <Text className="text-slate-400 text-xs text-center leading-5">
                  You haven't registered an academy yet. Once you do, its
                  student count, coaches and activity will show up here.
                </Text>
              </FadeInView>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
