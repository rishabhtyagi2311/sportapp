import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import signUpStore from '@/store/signUpStore'

export default function ProfileScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()

  const {
    firstName,
    lastName,
    email,
    contact,
    dob,
    city,
    profileImage,
    setProfileImage,
  } = signUpStore()

  /* ---------------- Responsive sizing ---------------- */
  const isSmallScreen = width < 380
  const isMediumScreen = width >= 380 && width < 450

  const profilePicSize = isSmallScreen ? 100 : isMediumScreen ? 120 : 140
  const profileIconSize = isSmallScreen ? 48 : isMediumScreen ? 60 : 72

  /* ---------------- Helpers ---------------- */
  const calculateAge = (dateString: string) => {
    if (!dateString) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateString)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age.toString()
  }

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          signUpStore.setState({
            firstName: '',
            lastName: '',
            email: '',
            contact: '',
            city: '',
            dob: '',
            profileImage: '',
          })
          router.replace('/(onboardingStack)/basicInfoRegisterOne')
        },
      },
    ])
  }

  /* ---------------- UI helpers ---------------- */
  const ProfileSection = ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <View className="mb-6 px-5">
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        {title}
      </Text>
      <View className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
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
            }`}
          >
            {label}
          </Text>
          {value && (
            <Text className="text-xs text-slate-400 mt-1" numberOfLines={1}>
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

  /* ---------------- Display values ---------------- */
  const fullName = `${firstName} ${lastName}`.trim() || 'User Profile'
  const displayEmail = email || 'email@example.com'
  const displayContact = contact || 'Not provided'
  const displayCity = city || 'City not set'
  const age = calculateAge(dob)

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ---------------- Header ---------------- */}
        <View className="pt-6 pb-8 px-5 bg-slate-800">
          {/* Profile Image */}
          <View className="items-center mb-5">
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85}>
              <View
                style={{ width: profilePicSize, height: profilePicSize }}
                className="rounded-full border-2 border-slate-600 bg-slate-700 overflow-hidden items-center justify-center"
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={profileIconSize}
                    color="#e2e8f0"
                  />
                )}
              </View>

              <View className="absolute bottom-1 right-1 bg-slate-900 p-2 rounded-full border border-slate-700">
                <MaterialIcons name="photo-camera" size={18} color="#e2e8f0" />
              </View>
            </TouchableOpacity>

            <Text className="text-slate-400 text-xs mt-2">
              Tap to change profile photo
            </Text>
          </View>

          {/* Name & City */}
          <View className="items-center">
            <Text className="text-white text-3xl font-bold" numberOfLines={1}>
              {fullName}
            </Text>
            <Text className="text-slate-400 mt-1 text-sm">{displayCity}</Text>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3 mt-6">
            <View className="flex-1 bg-slate-700/50 rounded-xl p-4 border border-slate-600">
              <Text className="text-slate-400 text-xs uppercase">Age</Text>
              <Text className="text-white font-bold text-lg mt-1">{age}</Text>
            </View>
            <View className="flex-1 bg-slate-700/50 rounded-xl p-4 border border-slate-600">
              <Text className="text-slate-400 text-xs uppercase">Contact</Text>
              <Text className="text-white font-bold text-sm mt-1" numberOfLines={1}>
                {displayContact}
              </Text>
            </View>
          </View>
        </View>

        {/* ---------------- Contact Info ---------------- */}
        <ProfileSection title="Contact Information">
          <View className="p-4 space-y-4">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="email" size={20} color="#94a3b8" />
              <Text className="text-white text-sm">{displayEmail}</Text>
            </View>
            <View className="h-px bg-slate-700" />
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="phone" size={20} color="#94a3b8" />
              <Text className="text-white text-sm">{displayContact}</Text>
            </View>
          </View>
        </ProfileSection>

        {/* ---------------- Profile ---------------- */}
        <ProfileSection title="Profile">
          <ActionItem
            icon={<MaterialIcons name="edit" size={24} color="#e2e8f0" />}
            label="Edit Personal Details"
            value="Name, email, phone, city"
            onPress={() =>
              router.push('/(tabs)/profile/edit-personal-details')
            }
          />
        </ProfileSection>

        {/* ---------------- Account ---------------- */}
        <ProfileSection title="Account">
          <ActionItem
            icon={<MaterialIcons name="vpn-key" size={24} color="#e2e8f0" />}
            label="Change Password"
            onPress={() =>
              router.push('/(tabs)/profile/change-password')
            }
          />
        </ProfileSection>

        {/* ---------------- Support ---------------- */}
        <ProfileSection title="Support">
          <ActionItem
            icon={<MaterialIcons name="help" size={24} color="#e2e8f0" />}
            label="Help & Support"
            onPress={() => Alert.alert('Support', 'Support page')}
          />
          <ActionItem
            icon={<MaterialIcons name="info" size={24} color="#e2e8f0" />}
            label="About"
            onPress={() => Alert.alert('About', 'App version 1.0.0')}
          />
        </ProfileSection>

        {/* ---------------- Danger Zone ---------------- */}
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
