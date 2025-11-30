import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function VenueOwnerDashboard() {
  const router = useRouter()
  const { width } = useWindowDimensions()

  // Responsive sizing
  const isSmallScreen = width < 380
  const isMediumScreen = width >= 380 && width < 450

  // Dummy data
  const dashboardData = {
    totalVenues: 3,
    activeBookings: 12,
    totalSlots: 45,
    monthlyRevenue: '$4,250',
  }

  const MetricCard = ({
    icon,
    label,
    value,
    bgColor,
  }: {
    icon: React.ReactNode
    label: string
    value: string
    bgColor: string
  }) => (
    <View className={`flex-1 ${bgColor} rounded-xl p-4 border border-slate-200 items-center shadow-sm`}>
      <View className="w-12 h-12 rounded-full bg-white items-center justify-center mb-2">
        {icon}
      </View>
      <Text className="text-slate-600 text-xs font-semibold uppercase tracking-wide text-center mb-1">
        {label}
      </Text>
      <Text className="text-slate-900 font-bold text-lg text-center">{value}</Text>
    </View>
  )

  const QuickStat = ({
    title,
    value,
    change,
    icon,
    bgColor,
  }: {
    title: string
    value: string
    change: string
    icon: React.ReactNode
    bgColor: string
  }) => (
    <View className={`${bgColor} rounded-xl p-4 border border-slate-200 flex-1 shadow-sm`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-600 text-xs font-semibold">{title}</Text>
        {icon}
      </View>
      <Text className="text-slate-900 font-bold text-xl">{value}</Text>
      <Text className="text-green-600 text-xs font-semibold mt-1">{change}</Text>
    </View>
  )

  const QuickLink = ({
    icon,
    label,
    onPress,
    bgColor,
    borderColor,
  }: {
    icon: React.ReactNode
    label: string
    onPress: () => void
    bgColor: string
    borderColor: string
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-1 ${bgColor} border-2 ${borderColor} rounded-xl p-3 items-center`}
    >
      {icon}
      <Text className="text-slate-700 text-xs font-semibold mt-2 text-center">{label}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Top Spacing */}
        <View className="h-6" />

        {/* Header */}
        <View className={`${isSmallScreen ? 'px-4' : isMediumScreen ? 'px-5' : 'px-6'} mb-8`}>
          <Text className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">
            Welcome Back
          </Text>
          <Text
            className={`text-slate-900 font-bold ${
              isSmallScreen ? 'text-2xl' : isMediumScreen ? 'text-3xl' : 'text-4xl'
            } mb-1`}
          >
            Venue Manager
          </Text>
          <Text className="text-slate-500 text-sm">Manage your venues and bookings</Text>
        </View>

        {/* Quick Metrics */}
        <View className={`${isSmallScreen ? 'px-4' : isMediumScreen ? 'px-5' : 'px-6'} mb-8`}>
          <View className="flex-row gap-2.5 mb-2.5">
            <MetricCard
              icon={<MaterialIcons name="location-on" size={20} color="#3b82f6" />}
              label="Venues"
              value={dashboardData.totalVenues.toString()}
              bgColor="bg-blue-50"
            />
            <MetricCard
              icon={<MaterialIcons name="event-available" size={20} color="#10b981" />}
              label="Bookings"
              value={dashboardData.activeBookings.toString()}
              bgColor="bg-green-50"
            />
          </View>
          <View className="flex-row gap-2.5">
            <MetricCard
              icon={<MaterialIcons name="schedule" size={20} color="#06b6d4" />}
              label="Slots"
              value={dashboardData.totalSlots.toString()}
              bgColor="bg-cyan-50"
            />
            <MetricCard
              icon={<MaterialIcons name="trending-up" size={20} color="#22c55e" />}
              label="Revenue"
              value={dashboardData.monthlyRevenue}
              bgColor="bg-green-50"
            />
          </View>
        </View>

        {/* Revenue Overview */}
        <View className={`${isSmallScreen ? 'px-4' : isMediumScreen ? 'px-5' : 'px-6'} mb-8`}>
          <Text className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
            Performance
          </Text>
          <View className="flex-row gap-2.5">
            <QuickStat
              title="This Month"
              value="$4,250"
              change="↑ 12% from last month"
              bgColor="bg-green-50"
              icon={<MaterialIcons name="trending-up" size={16} color="#22c55e" />}
            />
            <QuickStat
              title="Active"
              value="12"
              change="3 pending bookings"
              bgColor="bg-blue-50"
              icon={<MaterialIcons name="check-circle" size={16} color="#3b82f6" />}
            />
          </View>
        </View>

        {/* Action Cards Section */}
        <View className={`${isSmallScreen ? 'px-4' : isMediumScreen ? 'px-5' : 'px-6'} mb-8`}>
          <Text className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">
            Core Actions
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(homeScreenTabs)/profile')}
            activeOpacity={0.8}
            className="rounded-2xl overflow-hidden mb-4 border-2 border-blue-200"
          >
            <View className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-bold text-blue-900 text-lg mb-1">Add New Venue</Text>
                <Text className="text-blue-700 text-sm leading-5">Create and list a new venue</Text>
              </View>
              <View className="ml-4 w-16 h-16 rounded-full bg-blue-100 items-center justify-center">
                <MaterialIcons name="add-location-alt" size={32} color="#1e40af" />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(homeScreenTabs)/profile')}
            activeOpacity={0.8}
            className="rounded-2xl overflow-hidden mb-4 border-2 border-green-200"
          >
            <View className="bg-gradient-to-br from-green-50 to-green-100 p-5 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-bold text-green-900 text-lg mb-1">Manage Venues</Text>
                <Text className="text-green-700 text-sm">{dashboardData.totalVenues} venues active</Text>
              </View>
              <View className="ml-4 w-16 h-16 rounded-full bg-green-100 items-center justify-center">
                <MaterialIcons name="store" size={32} color="#166534" />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(homeScreenTabs)/profile')}
            activeOpacity={0.8}
            className="rounded-2xl overflow-hidden mb-4 border-2 border-cyan-200"
          >
            <View className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-bold text-cyan-900 text-lg mb-1">Manage Slots</Text>
                <Text className="text-cyan-700 text-sm">{dashboardData.totalSlots} slots available</Text>
              </View>
              <View className="ml-4 w-16 h-16 rounded-full bg-cyan-100 items-center justify-center">
                <MaterialIcons name="calendar-today" size={32} color="#0c4a6e" />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(homeScreenTabs)/profile')}
            activeOpacity={0.8}
            className="rounded-2xl overflow-hidden mb-4 border-2 border-amber-200"
          >
            <View className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-bold text-amber-900 text-lg mb-1">Manage Bookings</Text>
                <Text className="text-amber-700 text-sm">{dashboardData.activeBookings} active bookings</Text>
              </View>
              <View className="ml-4 items-center justify-center relative">
                <View className="w-16 h-16 rounded-full bg-amber-100 items-center justify-center">
                  <MaterialIcons name="event-note" size={32} color="#92400e" />
                </View>
                <View className="absolute top-0 right-0 bg-red-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white">
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(homeScreenTabs)/profile')}
            activeOpacity={0.8}
            className="rounded-2xl overflow-hidden mb-4 border-2 border-green-300"
          >
            <View className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-bold text-emerald-900 text-lg mb-1">Payment History</Text>
                <Text className="text-emerald-700 text-sm">View earnings and transactions</Text>
              </View>
              <View className="ml-4 w-16 h-16 rounded-full bg-emerald-100 items-center justify-center">
                <MaterialIcons name="receipt-long" size={32} color="#065f46" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Links Section */}
        <View className={`${isSmallScreen ? 'px-4' : isMediumScreen ? 'px-5' : 'px-6'} mb-4`}>
          <Text className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
            Quick Access
          </Text>
          <View className="flex-row gap-3 mb-12">
            <QuickLink
              icon={<MaterialIcons name="help" size={24} color="#3b82f6" />}
              label="Support"
              bgColor="bg-blue-50"
              borderColor="border-blue-300"
              onPress={() => router.push('/(homeScreenTabs)/profile')}
            />
            <QuickLink
              icon={<MaterialIcons name="analytics" size={24} color="#10b981" />}
              label="Analytics"
              bgColor="bg-green-50"
              borderColor="border-green-300"
              onPress={() => router.push('/(homeScreenTabs)/profile')}
            />
            <QuickLink
              icon={<MaterialIcons name="settings" size={24} color="#06b6d4" />}
              label="Settings"
              bgColor="bg-cyan-50"
              borderColor="border-cyan-300"
              onPress={() => router.push('/(homeScreenTabs)/profile')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}