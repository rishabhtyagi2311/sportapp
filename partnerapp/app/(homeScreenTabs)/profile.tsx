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
    city,
    profileImage,
    setProfileImage,
  } = signUpStore()

  const isSmallScreen = width < 380
  const profilePicSize = isSmallScreen ? 110 : 140
  const profileIconSize = isSmallScreen ? 50 : 70

  /* ---------------- Image Picker ---------------- */
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
      quality: 0.85,
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
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
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
      activeOpacity={0.75}
      className="flex-row items-center justify-between px-4 py-4 border-b border-slate-700 last:border-b-0"
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`w-12 h-12 rounded-xl items-center justify-center ${
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

  const fullName = `${firstName} ${lastName}`.trim() || 'User Profile'
  const displayCity = city || 'City not set'
  const displayEmail = email || 'email@example.com'
  const displayContact = contact || 'Not provided'

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ---------------- Decorative Header ---------------- */}
        <View className="pt-10 pb-8 px-5 bg-slate-900">
          <View className="items-center">
            {/* Profile Image */}
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85}>
              <View
                style={{ width: profilePicSize, height: profilePicSize }}
                className="rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden items-center justify-center"
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
                    color="#e5e7eb"
                  />
                )}
              </View>

              <View className="absolute bottom-1 right-1 bg-green-600 p-2 rounded-full">
                <MaterialIcons name="edit" size={16} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text className="text-white text-3xl font-bold mt-4">
              {fullName}
            </Text>
            <Text className="text-slate-400 text-sm mt-1">
              {displayCity}
            </Text>
          </View>
        </View>

        {/* ---------------- Quick Access ---------------- */}
        {/* <View className="px-5 mt-4 mb-6 flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push('./')}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4 items-center"
          >
            <MaterialIcons name="card-membership" size={26} color="#22c55e" />
            <Text className="text-white text-sm mt-2">Subscriptions</Text>
          </TouchableOpacity>

        

          <TouchableOpacity
            onPress={() => Alert.alert('Stats', 'Coming soon')}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4 items-center"
          >
            <MaterialIcons name="bar-chart" size={26} color="#22c55e" />
            <Text className="text-white text-sm mt-2">Stats</Text>
          </TouchableOpacity>
        </View> */}

        {/* ---------------- Contact ---------------- */}
        <ProfileSection title="Contact Information">
          <View className="p-4 space-y-4">
            <View className="flex-row items-center gap-3 mb-2">
              <MaterialIcons name="email" size={20} color="#9ca3af" />
              <Text className="text-white">{displayEmail}</Text>
            </View>
            <View className="h-px bg-slate-700" />
            <View className="flex-row items-center gap-3 mt-2">
              <MaterialIcons name="phone" size={20} color="#9ca3af" />
              <Text className="text-white">{displayContact}</Text>
            </View>
          </View>
        </ProfileSection>

        {/* ---------------- Profile ---------------- */}
        <ProfileSection title="Profile">
          <ActionItem
            icon={<MaterialIcons name="edit" size={24} color="#22c55e" />}
            label="Edit Personal Details"
            value="Name, email, phone, city"
            onPress={() =>
              router.push('./')
            }
          />
        </ProfileSection>

        {/* ---------------- Account ---------------- */}
        <ProfileSection title="Account">
          <ActionItem
            icon={<MaterialIcons name="vpn-key" size={24} color="#e5e7eb" />}
            label="Change Password"
            onPress={() =>
              router.push('./')
            }
          />
        </ProfileSection>

        {/* ---------------- Support ---------------- */}
        <ProfileSection title="Support">
          <ActionItem
            icon={<MaterialIcons name="help" size={24} color="#e5e7eb" />}
            label="Help & Support"
            onPress={() => Alert.alert('Support', 'Support page')}
          />
          <ActionItem
            icon={<MaterialIcons name="info" size={24} color="#e5e7eb" />}
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