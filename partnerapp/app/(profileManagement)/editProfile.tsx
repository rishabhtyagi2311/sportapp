import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import { useResponsive } from '@/hooks/useResponsive'
import FadeInView from '@/components/animated/FadeInView'
import AnimatedPressable from '@/components/animated/AnimatedPressable'

type FormData = {
  firstName: string
  lastName: string
  email: string
  city: string
  dob: string
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
    {children}
  </Text>
)

export default function EditProfileScreen() {
  const router = useRouter()
  const { isTablet } = useResponsive()
  const partner = useAuthStore((state) => state.partner)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const [submitting, setSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: partner?.firstName || '',
      lastName: partner?.lastName || '',
      email: partner?.email || '',
      city: partner?.city || '',
      dob: partner?.dob || '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim() || undefined,
        city: data.city.trim() || undefined,
        dob: data.dob.trim() || undefined,
      })
      router.back()
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update your profile.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        {/* HEADER */}
        <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Edit Personal Details</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View className={isTablet ? 'self-center w-full max-w-xl' : 'w-full'}>
            <FadeInView className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <FieldLabel>First Name</FieldLabel>
                <Controller
                  control={control}
                  name="firstName"
                  rules={{ required: 'Required' }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="words"
                      className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-medium"
                      placeholderTextColor="#64748b"
                    />
                  )}
                />
                {errors.firstName && (
                  <Text className="text-red-400 text-xs mt-1 ml-1">{errors.firstName.message}</Text>
                )}
              </View>

              <View className="flex-1">
                <FieldLabel>Last Name</FieldLabel>
                <Controller
                  control={control}
                  name="lastName"
                  rules={{ required: 'Required' }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="words"
                      className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-medium"
                      placeholderTextColor="#64748b"
                    />
                  )}
                />
                {errors.lastName && (
                  <Text className="text-red-400 text-xs mt-1 ml-1">{errors.lastName.message}</Text>
                )}
              </View>
            </FadeInView>

            <FadeInView delay={50} className="mb-4">
              <FieldLabel>Email</FieldLabel>
              <Controller
                control={control}
                name="email"
                rules={{
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="you@example.com"
                    className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-medium"
                    placeholderTextColor="#64748b"
                  />
                )}
              />
              {errors.email && <Text className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</Text>}
            </FadeInView>

            <FadeInView delay={90} className="mb-4">
              <FieldLabel>City</FieldLabel>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                    className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-medium"
                    placeholderTextColor="#64748b"
                  />
                )}
              />
            </FadeInView>

            <FadeInView delay={130} className="mb-8">
              <FieldLabel>Date of Birth</FieldLabel>
              <Controller
                control={control}
                name="dob"
                rules={{
                  pattern: { value: /^\d{2}-\d{2}-\d{4}$/, message: 'Use dd-mm-yyyy' },
                }}
                render={({ field: { onChange, value } }) => {
                  const handleInput = (text: string) => {
                    const digits = text.replace(/\D/g, '')
                    let formatted = digits
                    if (digits.length > 2) formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`
                    if (digits.length > 4) formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`
                    onChange(formatted)
                  }
                  return (
                    <TextInput
                      value={value}
                      onChangeText={handleInput}
                      placeholder="dd-mm-yyyy"
                      keyboardType="numeric"
                      maxLength={10}
                      className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-medium"
                      placeholderTextColor="#64748b"
                    />
                  )
                }}
              />
              {errors.dob && <Text className="text-red-400 text-xs mt-1 ml-1">{errors.dob.message}</Text>}
            </FadeInView>

            <FadeInView delay={170}>
              <AnimatedPressable
                onPress={handleSubmit(onSubmit)}
                disabled={submitting}
                className="bg-blue-600 py-4 rounded-2xl items-center"
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">Save Changes</Text>
                )}
              </AnimatedPressable>
            </FadeInView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
