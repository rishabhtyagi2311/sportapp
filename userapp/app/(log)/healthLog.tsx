import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useHealthStore } from '@/store/HealthLogStore';
import { storageApiService } from '@/services/storage/storage';

export default function HealthFormScreen() {
  const router = useRouter();
  const addEntry = useHealthStore((state) => state.addEntry);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  // State for form
  const [weight, setWeight] = useState('');
  const [steps, setSteps] = useState('');
  const [water, setWater] = useState('');
  const [sleep, setSleep] = useState(8);
  const [energy, setEnergy] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [motivation, setMotivation] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // Measurements State
  const [measurements, setMeasurements] = useState({
    chest: '', abdominal: '', arms: '', hips: '', thighs: '', feet: '', neck: ''
  });

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to add a progress photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let photoUrl: string | undefined;

      if (photoUri) {
        setUploadingPhoto(true);
        const fileName = photoUri.split('/').pop() || `progress-${Date.now()}.jpg`;
        const fileType = 'image/jpeg';
        const { uploadUrl, publicUrl } = await storageApiService.getPresignedUrl(fileName, fileType);
        await storageApiService.uploadToS3(uploadUrl, photoUri, fileType);
        photoUrl = publicUrl;
        setUploadingPhoto(false);
      }

      await addEntry({
        date: new Date().toISOString(),
        weight, steps, water, sleep, energy, motivation, measurements, photoUrl,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save your health log.');
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  };

  const InputField = ({ label, placeholder, value, onChangeText, unit = "" }: any) => (
    <View className="mb-4">
      <Text className="text-slate-400 text-sm mb-2 ml-1">{label}</Text>
      <View className="flex-row items-center bg-slate-800 rounded-2xl px-4 border border-slate-700">
        <TextInput
          className="flex-1 h-12 text-white"
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeText}
        />
        {unit && <Text className="text-slate-500 ml-2">{unit}</Text>}
      </View>
    </View>
  );

  const Selector = ({ label, options, activeValue, onSelect }: any) => (
    <View className="mb-6">
      <Text className="text-slate-400 text-sm mb-3 ml-1">{label}</Text>
      <View className="flex-row gap-x-2">
        {options.map((opt: any) => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            className={`flex-1 py-3 rounded-xl border items-center ${activeValue === opt ? 'bg-blue-500 border-blue-400' : 'bg-slate-800 border-slate-700'}`}
          >
            <Text className={`font-bold ${activeValue === opt ? 'text-white' : 'text-slate-400'}`}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
    <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mt-4 mb-8">
        <View>
          <Text className="text-slate-400 text-sm font-medium">Today</Text>
          <Text className="text-white text-2xl font-bold">{today}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(log)/history')}
          className="bg-slate-800 p-3 rounded-full border border-slate-700"
        >
          <Ionicons name="time-outline" size={24} color="#60a5fa" />
        </TouchableOpacity>
      </View>

      {/* Main Fields */}
      <TouchableOpacity
        onPress={handlePickPhoto}
        className="w-full h-32 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 items-center justify-center mb-6 overflow-hidden"
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <>
            <Ionicons name="camera-outline" size={32} color="#94a3b8" />
            <Text className="text-slate-500 mt-2 font-medium">Add Progress Photo</Text>
          </>
        )}
      </TouchableOpacity>

      <InputField label="Weight" placeholder="0.0" unit="kg" value={weight} onChangeText={setWeight} />
      <InputField label="Steps" placeholder="10,000" value={steps} onChangeText={setSteps} />
      <InputField label="Water Intake" placeholder="0" unit="Liters" value={water} onChangeText={setWater} />

      <View className="mb-4">
        <Text className="text-slate-400 text-sm mb-2 ml-1">Sleep (Hours)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {[2,4,6,8,10,12,14].map((h) => (
            <TouchableOpacity
              key={h}
              onPress={() => setSleep(h)}
              className={`w-12 h-12 rounded-full items-center justify-center mr-3 border ${sleep === h ? 'bg-blue-500 border-blue-400' : 'bg-slate-800 border-slate-700'}`}
            >
              <Text className="text-white font-bold">{h}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Selector label="Energy Level" options={['Low', 'Medium', 'High']} activeValue={energy} onSelect={setEnergy} />
      <Selector label="Motivation" options={['Low', 'Medium', 'High']} activeValue={motivation} onSelect={setMotivation} />

      {/* Measurements Section */}
      <View className="mt-4 pt-6 border-t border-slate-800">
        <Text className="text-white text-xl font-bold mb-6">Body Measurements (Inches)</Text>
        <View className="flex-row flex-wrap justify-between">
          {Object.keys(measurements).map((key) => (
            <View key={key} className="w-[48%]">
              <InputField
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                placeholder="0.0"
                value={(measurements as any)[key]}
                onChangeText={(val: string) => setMeasurements({...measurements, [key]: val})}
              />
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className="bg-blue-500 w-full py-4 rounded-2xl items-center my-10 shadow-lg shadow-blue-500/30"
      >
        {saving ? (
          <View className="flex-row items-center">
            <ActivityIndicator color="white" />
            <Text className="text-white text-lg font-bold ml-2">
              {uploadingPhoto ? 'Uploading photo…' : 'Saving…'}
            </Text>
          </View>
        ) : (
          <Text className="text-white text-lg font-bold">Save Daily Log</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}
