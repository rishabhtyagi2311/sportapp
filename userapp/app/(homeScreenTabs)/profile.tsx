import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import signUpStore from '@/store/signUpStore'

export default function ProfileScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { firstName, lastName, email, contact, dob, city } = signUpStore()

  // Responsive sizing
  const isSmallScreen = width < 380
  const isMediumScreen = width >= 380 && width < 450
  const isLargeScreen = width >= 450

  const profilePicSize = isSmallScreen ? 100 : isMediumScreen ? 120 : 140
  const profileIconSize = isSmallScreen ? 50 : isMediumScreen ? 60 : 70

  // Calculate age from DOB
  const calculateAge = (dateString: string) => {
    if (!dateString) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateString)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age.toString()
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          signUpStore.setState({
            firstName: '',
            lastName: '',
            email: '',
            contact: '',
            city: '',
            dob: '',
          })
          router.replace('/(onboardingStack)/basicInfoRegisterOne')
        },
        style: 'destructive',
      },
    ])
  }

  const ProfileSection = ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <View className={`mb-6 ${isSmallScreen ? 'px-3' : isMediumScreen ? 'px-4' : 'px-6'}`}>
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        {title}
      </Text>
      <View className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
        {children}
      </View>
    </View>
  )

  const ActionItem = ({
    icon,
    label,
    value,
    onPress,
    isDestructive = false,
  }: {
    icon: React.ReactNode
    label: string
    value?: string
    onPress: () => void
    isDestructive?: boolean
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4 px-4 border-b border-slate-700 last:border-b-0"
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isDestructive ? 'bg-red-900/30' : 'bg-slate-700'
          }`}
        >
          {icon}
        </View>
        <View className="ml-4 flex-1">
          <Text
            className={`font-semibold ${
              isDestructive ? 'text-red-500' : 'text-white'
            } ${isSmallScreen ? 'text-sm' : 'text-base'}`}
          >
            {label}
          </Text>
          {value && (
            <Text className="text-xs text-slate-400 mt-1.5" numberOfLines={1}>
              {value}
            </Text>
          )}
        </View>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={isDestructive ? '#ef4444' : '#94a3b8'}
      />
    </TouchableOpacity>
  )

  const fullName = `${firstName} ${lastName}`.trim()
  const displayName = fullName || 'User Profile'
  const displayContact = contact || '+1 (555) 000-0000'
  const displayEmail = email || 'email@example.com'
  const displayCity = city || 'City not set'
  const userAge = calculateAge(dob)

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Top Spacing */}
        <View className="h-6" />

        {/* Hero Profile Section */}
        <View className="bg-gradient-to-b from-slate-800 to-slate-900 pt-4 pb-8">
          <View
            className={`${
              isSmallScreen ? 'px-4' : isMediumScreen ? 'px-5' : 'px-8'
            }`}
          >
            {/* Profile Picture */}
            <View className="items-center mb-6">
              <View
                style={{ width: profilePicSize, height: profilePicSize }}
                className="rounded-full bg-gradient-to-br from-slate-700 to-slate-800 items-center justify-center border-2 border-slate-600 shadow-lg"
              >
                <Ionicons
                  name="person"
                  size={profileIconSize}
                  color="#e2e8f0"
                />
              </View>
            </View>

            {/* User Info */}
            <View className="items-center mb-6">
              <Text
                className={`font-bold text-white text-center ${
                  isSmallScreen ? 'text-2xl' : isMediumScreen ? 'text-3xl' : 'text-4xl'
                }`}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <Text className="text-slate-400 mt-1.5 text-sm">
                {displayCity}
              </Text>
            </View>

            {/* Quick Stats */}
            <View className="flex-row justify-around gap-3">
              <View className="flex-1 bg-slate-700/50 rounded-xl py-3 px-4 border border-slate-600">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                  Age
                </Text>
                <Text className="text-white font-bold text-lg">{userAge}</Text>
              </View>
              <View className="flex-1 bg-slate-700/50 rounded-xl py-3 px-4 border border-slate-600">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                  Contact
                </Text>
                <Text className="text-white font-bold text-sm truncate">
                  {displayContact}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Details */}
        <View className={`mt-8 ${isSmallScreen ? 'px-4' : isMediumScreen ? 'px-5' : 'px-6'}`}>
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Contact Information
          </Text>
          <View className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 p-4 space-y-4">
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center flex-shrink-0 mt-0.5">
                <MaterialIcons name="phone" size={20} color="#94a3b8" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                  Phone
                </Text>
                <Text className="text-white font-medium text-sm">{displayContact}</Text>
              </View>
            </View>
            <View className="border-t border-slate-700" />
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center flex-shrink-0 mt-0.5">
                <MaterialIcons name="email" size={20} color="#94a3b8" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                  Email
                </Text>
                <Text className="text-white font-medium text-sm truncate">
                  {displayEmail}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Profile Section */}
        <ProfileSection title="Profile">
          <ActionItem
            icon={<MaterialIcons name="person" size={24} color="#e2e8f0" />}
            label="Edit Name"
            value={displayName}
            onPress={() => router.push('/(tabs)/profile/edit-name')}
          />
          <ActionItem
            icon={<MaterialIcons name="phone" size={24} color="#e2e8f0" />}
            label="Edit Contact"
            value={displayContact}
            onPress={() => router.push('/(tabs)/profile/edit-contact')}
          />
          <ActionItem
            icon={<MaterialIcons name="email" size={24} color="#e2e8f0" />}
            label="Edit Email"
            value={displayEmail}
            onPress={() => router.push('/(tabs)/profile/edit-email')}
          />
        </ProfileSection>

        {/* Account Section */}
        <ProfileSection title="Account">
          <ActionItem
            icon={<MaterialIcons name="vpn-key" size={24} color="#e2e8f0" />}
            label="Change Password"
            onPress={() => router.push('/(tabs)/profile/change-password')}
          />
        </ProfileSection>

        {/* Subscriptions & Features Section */}
        <ProfileSection title="Subscriptions & Features">
          <ActionItem
            icon={<MaterialIcons name="card-membership" size={24} color="#e2e8f0" />}
            label="Subscriptions"
            onPress={() => router.push('/(tabs)/profile/subscriptions')}
          />
          <ActionItem
            icon={<MaterialIcons name="event" size={24} color="#e2e8f0" />}
            label="Events"
            onPress={() => router.push('/(eventHandling)/eventManaging')}
          />
        </ProfileSection>

        {/* Support Section */}
        <ProfileSection title="Support">
          <ActionItem
            icon={<MaterialIcons name="help" size={24} color="#e2e8f0" />}
            label="Help & Support"
            onPress={() => {
              Alert.alert('Help', 'Support page would open here')
            }}
          />
          <ActionItem
            icon={<MaterialIcons name="info" size={24} color="#e2e8f0" />}
            label="About"
            onPress={() => {
              Alert.alert('About', 'App version 1.0.0')
            }}
          />
        </ProfileSection>

        {/* Danger Zone */}
        <ProfileSection title="Danger Zone">
          <ActionItem
            icon={<MaterialIcons name="logout" size={24} color="#ef4444" />}
            label="Logout"
            onPress={handleLogout}
            isDestructive
          />
        </ProfileSection>

      </ScrollView>
    </SafeAreaView>
  )
}