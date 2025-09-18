// app/venue-details/[venueId].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Venue, Sport, SportVariety } from '@/types/booking';
import { dummyVenues } from '@/constants/venueData';

const { width } = Dimensions.get('window');

const VenueDetailsScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const venueId = params.venueId as string;
  const autoSelectBooking = params.autoSelectBooking as string;
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<SportVariety | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'main' | 'amenities'>('main');

  useEffect(() => {
    const foundVenue = dummyVenues.find(v => v.id === venueId);
    if (foundVenue) {
      setVenue(foundVenue);
    }
  }, [venueId]);

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">Venue not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSportSelect = (sport: Sport) => {
    if (selectedSport?.id === sport.id) {
      // If the same sport is clicked, collapse it
      setSelectedSport(null);
      setSelectedVariety(null);
    } else {
      // If a different sport is clicked, expand it
      setSelectedSport(sport);
      setSelectedVariety(null);
    }
  };

  const handleVarietySelect = (variety: SportVariety) => {
    setSelectedVariety(variety);
  };

  const handleProceedToBooking = () => {
    if (!selectedSport || !selectedVariety) {
      Alert.alert(
        'Selection Required',
        'Please select both a sport and variety before proceeding to booking.'
      );
      return;
    }

    router.push({
      pathname: './../slotSelection/[venueId]',
      params: {
        venueId: venue.id,
        sportId: selectedSport.id,
        sportVarietyId: selectedVariety.id,
      }
    });
  };

  const renderImageCarousel = () => {
    const placeholderImages = [
      { id: '1', title: 'Main View' },
      { id: '2', title: 'Sports Area' },
      { id: '3', title: 'Facilities' },
      { id: '4', title: 'Amenities' },
    ];

    const handleScroll = (event : any) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / width);
      setCurrentImageIndex(index);
    };

    return (
      <View style={{ height: 288 }}>
        <FlatList
          data={placeholderImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View 
              className="bg-slate-200 items-center justify-center" 
              style={{ width }}
            >
              <Ionicons name="image-outline" size={72} color="#64748b" />
              <Text className="text-slate-500 text-lg mt-3 font-medium">
                No photos uploaded yet
              </Text>
              <Text className="text-slate-400 text-sm mt-1">{item.title}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
        
        <View className="absolute bottom-4 right-4 bg-black/70 rounded-lg px-3 py-2">
          <Text className="text-white text-sm font-medium">
            {currentImageIndex + 1} / {placeholderImages.length}
          </Text>
        </View>
      </View>
    );
  };

  const renderMainContent = () => (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Venue Information */}
      <View className="bg-white">
        <View className="px-6 pt-8 pb-6">
          <Text className="text-3xl font-bold text-slate-900 leading-tight mb-4">
            {venue.name}
          </Text>
          
          <View className="flex-row items-start mb-4">
            <Ionicons name="location" size={22} color="#64748b" className="mt-1" />
            <View className="ml-3 flex-1">
              <Text className="text-slate-700 text-base leading-relaxed">
                {venue.address.street}
              </Text>
              <Text className="text-slate-700 text-base">
                {venue.address.city}, {venue.address.state} - {venue.address.pincode}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-6">
            <Ionicons name="call" size={22} color="#64748b" />
            <Text className="text-slate-700 text-base ml-3 font-medium">
              {venue.contactInfo.phone}
            </Text>
          </View>
        </View>
      </View>

      {/* Booking Section */}
      <View className="bg-white mt-2">
        <View className="px-6 py-8">
          <Text className="text-2xl font-bold text-slate-900 mb-3">
            Book Your Session
          </Text>
          <Text className="text-slate-600 text-base mb-8 leading-relaxed">
            Select your preferred sport and format to check availability and proceed with booking
          </Text>

          {venue.sports.map((sport) => (
            <View key={sport.id} style={{ marginBottom: 32 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  borderWidth: 2,
                  borderColor: selectedSport?.id === sport.id ? '#16a34a' : '#374151',
                  borderRadius: 16,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => handleSportSelect(sport)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: selectedSport?.id === sport.id ? '#16a34a' : '#374151',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      <Ionicons 
                        name="american-football" 
                        size={24} 
                        color="white"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 }}>
                        {sport.name}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: '#374151',
                        textTransform: 'capitalize'
                      }}>
                        {sport.category} Sport • {sport.varieties?.length || 0} formats available
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selectedSport?.id === sport.id ? '#16a34a' : '#374151',
                      backgroundColor: selectedSport?.id === sport.id ? '#16a34a' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8
                    }}>
                      {selectedSport?.id === sport.id && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                    <Ionicons 
                      name={selectedSport?.id === sport.id ? "chevron-up" : "chevron-down"}
                      size={20} 
                      color={selectedSport?.id === sport.id ? "#16a34a" : "#374151"}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {selectedSport?.id === sport.id && sport.varieties && (
                <View style={{ marginTop: 16, paddingHorizontal: 8 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#1e293b', 
                    marginBottom: 12,
                    marginLeft: 8 
                  }}>
                    Choose Format:
                  </Text>
                  
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {sport.varieties.map((variety) => (
                      <TouchableOpacity
                        key={variety.id}
                        style={{
                          backgroundColor: selectedVariety?.id === variety.id ? '#16a34a' : 'white',
                          borderWidth: 2,
                          borderColor: selectedVariety?.id === variety.id ? '#16a34a' : '#e5e7eb',
                          borderRadius: 25,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          marginBottom: 8,
                        }}
                        onPress={() => handleVarietySelect(variety)}
                      >
                        <Text style={{
                          color: selectedVariety?.id === variety.id ? 'white' : '#374151',
                          fontSize: 14,
                          fontWeight: '600'
                        }}>
                          {variety.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}

          {selectedSport && selectedVariety && (
            <TouchableOpacity
              style={{
                backgroundColor: '#16a34a',
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 24,
                shadowColor: '#16a34a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleProceedToBooking}
            >
              <Text style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 18,
                textAlign: 'center'
              }}>
                Check Available Slots
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Policies Section */}
      <View className="bg-white mt-2">
        <View className="px-6 py-8">
          <Text className="text-xl font-bold text-slate-900 mb-6">
            Booking Policies
          </Text>
          
          <View className="space-y-6">
            <View className="border-l-4 border-red-500 pl-4">
              <Text className="font-semibold text-slate-900 mb-2 text-base">
                Cancellation Policy
              </Text>
              <Text className="text-slate-700 leading-relaxed">
                {venue.policies.cancellationPolicy}
              </Text>
            </View>
            
            <View className="border-l-4 border-blue-500 pl-4">
              <Text className="font-semibold text-slate-900 mb-2 text-base">
                Advance Booking
              </Text>
              <Text className="text-slate-700">
                Bookings can be made up to {venue.policies.advanceBookingDays} days in advance
              </Text>
            </View>
            
            <View className="border-l-4 border-orange-500 pl-4">
              <Text className="font-semibold text-slate-900 mb-2 text-base">
                Minimum Booking Duration
              </Text>
              <Text className="text-slate-700">
                Minimum booking duration is {venue.policies.minimumBookingHours} hour(s)
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderAmenities = () => (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-slate-900 mb-6">
          Amenities & Features
        </Text>
        
        {['basic', 'facilities', 'sports_equipment', 'services'].map((category) => {
          const categoryAmenities = venue.amenities.filter(a => a.category === category);
          if (categoryAmenities.length === 0) return null;

          return (
            <View key={category} className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <Text className="text-lg font-bold text-slate-900 mb-4 capitalize">
                {category.replace('_', ' ')}
              </Text>
              
              <View className="flex-row flex-wrap gap-3">
                {categoryAmenities.map((amenity) => (
                  <View
                    key={amenity.id}
                    className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex-row items-center"
                  >
                    <Text className="text-lg mr-2">{amenity.icon}</Text>
                    <Text className="text-green-800 font-medium">
                      {amenity.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center shadow-sm border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
            {venue.name}
          </Text>
          <Text className="text-sm text-slate-600">
            {venue.address.city}, {venue.address.state}
          </Text>
        </View>
      </View>

      {/* Image Carousel */}
      {renderImageCarousel()}
      
      {/* Tab Navigation */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row px-6">
          {[
            { key: 'main', label: 'Overview & Booking' },
            { key: 'amenities', label: 'Amenities' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`py-4 mr-8 border-b-3 ${
                activeTab === tab.key 
                  ? 'border-green-600' 
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text className={`font-bold text-base ${
                activeTab === tab.key 
                  ? 'text-green-700' 
                  : 'text-slate-500'
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {activeTab === 'main' && renderMainContent()}
      {activeTab === 'amenities' && renderAmenities()}
    </SafeAreaView>
  );
};

export default VenueDetailsScreen;