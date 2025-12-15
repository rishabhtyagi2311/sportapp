// screens/RoleSelectionScreen.tsx

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const RoleSelectionScreen: React.FC = () => {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<
    'user' | 'organizer' | null
  >(null)

  const handleContinue = () => {
    if (!selectedRole) return

    if (selectedRole === 'user') {
      router.replace('/(tabs)/explore')
    } else {
      router.push('/(EventManagement)/organizerDashboard')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require('@/assets/images/bgEnhancedCoverImage.png')}
        className="flex-1"
        resizeMode="cover"
      >
        {/* ---------- Dark Overlay ---------- */}
        <View className="flex-1 bg-black/60">
          {/* ---------- Top Header ---------- */}
          <View className="px-4 pt-2 pb-4 bg-white">
            <View className="flex-row items-center justify-between">
              {/* Back */}
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.8}
                className="p-2 rounded-full bg-black"
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* Title */}
              <View className='flex flex-col'>
                <Text className="text-black text-2xl font-semibold">
                  Choose your Role
                </Text>
                <Text className="text-black text-sm font-semibold">
                  Continue with the role that fits you best
                </Text>
              </View>

              {/* Spacer for symmetry */}
              <View className="w-10" />
            </View>
          </View>

          {/* ---------- Content ---------- */}
          <View className="flex-1 px-6 mt-14 justify-between">
           

            {/* ---------- Role Cards ---------- */}
            <View className="mt-44">
              {/* Player */}
              <TouchableOpacity
                onPress={() => setSelectedRole('user')}
                activeOpacity={0.9}
                className={`rounded-2xl border mb-4 ${selectedRole === 'user'
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-white/10 border-white/20'
                  }`}
              >
                <View className="p-6 flex-row items-center">
                  <View
                    className={`p-4 rounded-xl mr-4 ${selectedRole === 'user'
                        ? 'bg-green-500/30'
                        : 'bg-white/20'
                      }`}
                  >
                    <Ionicons
                      name="person-outline"
                      size={28}
                      color="#fff"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-white text-xl font-bold mb-1">
                      Player / Participant
                    </Text>
                    <Text className="text-slate-300 text-sm">
                      Book venues, join events, manage bookings
                    </Text>
                  </View>

                  {selectedRole === 'user' && (
                    <Ionicons
                      name="checkmark-circle"
                      size={26}
                      color="#22c55e"
                    />
                  )}
                </View>
              </TouchableOpacity>

              {/* Organizer */}
              <TouchableOpacity
                onPress={() => setSelectedRole('organizer')}
                activeOpacity={0.9}
                className={`rounded-2xl border ${selectedRole === 'organizer'
                    ? 'bg-blue-500/20 border-blue-400'
                    : 'bg-white/10 border-white/20'
                  }`}
              >
                <View className="p-6 flex-row items-center">
                  <View
                    className={`p-4 rounded-xl mr-4 ${selectedRole === 'organizer'
                        ? 'bg-blue-500/30'
                        : 'bg-white/20'
                      }`}
                  >
                    <Ionicons
                      name="clipboard-outline"
                      size={28}
                      color="#fff"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-white text-xl font-bold mb-1">
                      Event Organizer
                    </Text>
                    <Text className="text-slate-300 text-sm">
                      Create events, manage players, track activity
                    </Text>
                  </View>

                  {selectedRole === 'organizer' && (
                    <Ionicons
                      name="checkmark-circle"
                      size={26}
                      color="#3b82f6"
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* ---------- Continue ---------- */}
            <View className="pb-8 mb-6">
              <TouchableOpacity
                onPress={handleContinue}
                disabled={!selectedRole}
                activeOpacity={0.85}
                className={`py-4 rounded-xl items-center ${selectedRole ? 'bg-green-600' : 'bg-white/20'
                  }`}
              >
                <Text
                  className={`text-lg font-bold ${selectedRole ? 'text-white' : 'text-slate-300'
                    }`}
                >
                  Continue
                </Text>
              </TouchableOpacity>

              <Text className="text-center text-slate-400 text-xs mt-3">
                You can change this later from settings
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  )
}

export default RoleSelectionScreen
