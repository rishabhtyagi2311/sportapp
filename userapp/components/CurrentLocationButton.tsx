// components/CurrentLocationButton.tsx
// "Use Current Location" button — detects GPS position, reverse-geocodes it,
// and hands the resolved address/city back to the caller to fill into its own
// (still freely editable) form fields. Mirrors the pattern already used in
// partnerapp's registerAcademy / createVenue location steps.
import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface DetectedLocation {
  address: string;
  city: string;
}

interface CurrentLocationButtonProps {
  onDetected: (location: DetectedLocation) => void;
  label?: string;
  className?: string;
}

export default function CurrentLocationButton({
  onDetected,
  label = 'Use Current Location',
  className = 'flex-row items-center justify-center bg-blue-600 rounded-xl py-3 mb-3',
}: CurrentLocationButtonProps) {
  const [locating, setLocating] = useState(false);

  const handleDetectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Location permission was denied.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = position.coords;

      const response = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (response && response.length > 0) {
        const geoCode = response[0];
        const street = geoCode.name || geoCode.street || '';
        const district = geoCode.district ? `, ${geoCode.district}` : '';
        onDetected({
          address: `${street}${district}`.trim(),
          city: geoCode.city || geoCode.district || '',
        });
      } else {
        Alert.alert('Not Found', 'Could not resolve an address for your current location.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not fetch location. Ensure GPS is enabled.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleDetectLocation} disabled={locating} activeOpacity={0.7} className={className}>
      {locating ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <FontAwesome5 name="location-arrow" size={13} color="white" />
          <Text className="text-white font-bold ml-2">{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
