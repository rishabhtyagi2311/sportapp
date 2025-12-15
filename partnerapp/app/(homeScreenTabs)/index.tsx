import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import signUpStore from "./../../store/signUpStore";

// ✅ FIX: Use Dimensions.get() instead of useWindowDimensions hook
const { width } = Dimensions.get("window");

// ✅ MOVED OUTSIDE - MetricCard
const MetricCard = ({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
}) => (
  <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm items-start justify-between min-h-[110px]">
    <View className="flex-row justify-between w-full mb-2">
      <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
        {icon}
      </View>
      {trend && (
        <View className="bg-green-100 px-2 py-1 rounded-full">
          <Text className="text-[10px] font-bold text-green-700">{trend}</Text>
        </View>
      )}
    </View>
    <View>
      <Text className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
        {label}
      </Text>
      <Text className="text-slate-900 font-bold text-2xl">{value}</Text>
    </View>
  </View>
);

// ✅ MOVED OUTSIDE - ActionCard
const ActionCard = ({
  title,
  subtitle,
  icon,
  gradientColors,
  borderColor,
  onPress,
  badgeCount,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradientColors: string;
  borderColor: string;
  onPress: () => void;
  badgeCount?: number;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className={`rounded-2xl overflow-hidden mb-4 border ${borderColor} bg-white shadow-sm`}
  >
    <View
      className={`p-5 flex-row items-center justify-between ${gradientColors} bg-opacity-30`}
    >
      <View className="flex-1 mr-4">
        <Text className="font-bold text-slate-800 text-lg mb-1">{title}</Text>
        <Text className="text-slate-500 text-sm leading-5">{subtitle}</Text>
      </View>

      <View className="relative">
        <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center shadow-sm">
          {icon}
        </View>
        {badgeCount ? (
          <View className="absolute -top-2 -right-2 bg-rose-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white shadow-sm">
            <Text className="text-white text-[10px] font-bold">
              {badgeCount}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  </TouchableOpacity>
);

export default function VenueOwnerDashboard() {
  // ✅ ALL HOOKS AT TOP - NO useWindowDimensions
  const router = useRouter();
  const { firstName, lastName } = signUpStore();

  // Logic
  const hasName = firstName || lastName;
  const displayName = hasName
    ? `${firstName} ${lastName}`.trim()
    : "Venue Manager";

  const getInitials = () => {
    if (hasName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return "VM";
  };

  const dashboardData = {
    totalVenues: 3,
    activeBookings: 12,
    totalSlots: 45,
    monthlyRevenue: "$4,250",
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* HEADER */}
      <View className="bg-slate-900 pt-12 pb-8 px-6 rounded-b-[32px] shadow-lg z-10">
        {/* Top Row: User & Notifications */}
        <View className="flex-row justify-between items-center mb-6 mt-12">
          <View className="flex-row items-center gap-3">
            {/* Dynamic Initials Avatar */}
            <View className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 items-center justify-center overflow-hidden">
              <Text className="text-white font-bold text-sm">
                {getInitials()}
              </Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs uppercase font-semibold tracking-wider">
                Welcome Back
              </Text>
              {/* Dynamic Name Display */}
              <Text className="text-white font-bold text-lg">
                {displayName}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center border border-slate-700">
            <MaterialIcons name="notifications-none" size={22} color="white" />
            <View className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
          </TouchableOpacity>
        </View>

        {/* Dashboard Title */}
        <View>
          <Text className="text-slate-400 text-sm">
            Here is what's happening at your venues today.
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 -mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
      >
        {/* Quick Metrics Grid */}
        <View className="px-5 mb-8">
          <View className="flex-row gap-3 mb-3">
            <MetricCard
              icon={<MaterialIcons name="store" size={22} color="#3b82f6" />}
              label="Active Venues"
              value={dashboardData.totalVenues.toString()}
            />
            <MetricCard
              icon={
                <MaterialIcons name="payments" size={22} color="#10b981" />
              }
              label="Revenue"
              value={dashboardData.monthlyRevenue}
              trend="+12%"
            />
          </View>
          <View className="flex-row gap-3">
            <MetricCard
              icon={
                <MaterialIcons
                  name="confirmation-number"
                  size={22}
                  color="#f59e0b"
                />
              }
              label="Bookings"
              value={dashboardData.activeBookings.toString()}
            />
            <MetricCard
              icon={
                <MaterialIcons name="schedule" size={22} color="#6366f1" />
              }
              label="Total Slots"
              value={dashboardData.totalSlots.toString()}
            />
          </View>
        </View>

        {/* Action Cards Section */}
        <View className="px-5">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">
            Management Console
          </Text>

          <ActionCard
            title="Manage Venues"
            subtitle={`${dashboardData.totalVenues} properties active • Update details`}
            icon={<MaterialIcons name="business" size={28} color="#0f172a" />}
            gradientColors="bg-slate-50"
            borderColor="border-slate-200"
            onPress={() =>
              router.push("/(venueManagement)/venueHandling/landingDashboard")
            }
          />

          <ActionCard
            title="Slot Configuration"
            subtitle={`${dashboardData.totalSlots} slots • Adjust timing & pricing`}
            icon={<MaterialIcons name="tune" size={28} color="#0e7490" />}
            gradientColors="bg-cyan-50"
            borderColor="border-cyan-100"
            onPress={() =>
              router.push("/(venueManagement)/slotHandling/venuePicker")
            }
          />

          <ActionCard
            title="Booking Requests"
            subtitle="Approve or manage incoming reservations"
            icon={
              <MaterialIcons
                name="bookmark-border"
                size={28}
                color="#b45309"
              />
            }
            gradientColors="bg-amber-50"
            borderColor="border-amber-100"
            badgeCount={3}
            onPress={() =>
              router.push("/(venueManagement)/bookingHandling/venuePicker")
            }
          />

          <ActionCard
            title="Financials"
            subtitle="Transaction history & payouts"
            icon={
              <MaterialIcons
                name="account-balance-wallet"
                size={28}
                color="#047857"
              />
            }
            gradientColors="bg-emerald-50"
            borderColor="border-emerald-100"
            onPress={() => router.push("/(homeScreenTabs)/profile")}
          />
        </View>
      </ScrollView>
    </View>
  );
}