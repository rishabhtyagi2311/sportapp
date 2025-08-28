import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAcademyStore } from '@/store/academyStore';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // 16px margin on each side

type Academy = {
  id : string;
  academyName: string;
  sportType: string;
  address: string;
  coachName: string;
  contactNumber: string;
  facilities: string;
  feeStructure: string;
  Fee: string;
  city: string;
};

type FilterType = 'all' | 'sport' | 'city';

export default function BrowseAcademies() {
  const { academies } = useAcademyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  // Generate random ratings for now
  const generateRating = (academyName: string): number => {
    const hash = academyName.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 3.5 + (Math.abs(hash) % 15) / 10; // Rating between 3.5-5.0
  };

  // Get unique values for filters
  const uniqueSports = [...new Set(academies.map(academy => academy.sportType))];
  const uniqueCities = [...new Set(academies.map(academy => academy.city))];

  // Filter and search academies
  const filteredAcademies = useMemo(() => {
    let filtered = academies;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(academy =>
        academy.academyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterType === 'sport' && selectedFilter) {
      filtered = filtered.filter(academy => academy.sportType === selectedFilter);
    } else if (filterType === 'city' && selectedFilter) {
      filtered = filtered.filter(academy => academy.city === selectedFilter);
    }

    return filtered;
  }, [academies, searchQuery, filterType, selectedFilter]);

  const handleFilterSelect = (type: FilterType, value?: string) => {
    setFilterType(type);
    setSelectedFilter(value || '');
    setShowFilter(false);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#fbbf24" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#fbbf24" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#d1d5db" />
      );
    }

    return stars;
  };

  const AcademyCard = ({ academy }: { academy: Academy }) => {
    const rating = generateRating(academy.academyName);
    
    return (
      <TouchableOpacity 
       onPress={() => router.push(`/browseAcademy/academy-details/${academy.id}`)}

        className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden border border-gray-100"
        style={{ width: cardWidth }}
        activeOpacity={0.9}
      >
        {/* Cover Image Placeholder */}
        <View className="relative">
          <View className="h-48 bg-gray-200 items-center justify-center">
            <View className="bg-gray-300 rounded-full p-4 mb-2">
              <Ionicons name="image-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-sm font-medium">No Cover Photo</Text>
           
          </View>
          
          {/* Sport Badge */}
          <View className="absolute top-3 left-3 bg-slate-900 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">{academy.sportType}</Text>
          </View>

          {/* Fee Badge */}
          <View className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-sm">
            <Text className="text-slate-900 text-xs font-bold">
              ₹{academy.Fee}
              /{academy.feeStructure === 'monthly' ? 'mo' : academy.feeStructure === 'quarterly' ? 'qtr' : 'yr'}
            </Text>
          </View>
        </View>

        {/* Academy Details */}
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-slate-900 text-lg font-bold flex-1 pr-2" numberOfLines={2}>
              {academy.academyName}
            </Text>
            
            {/* Rating */}
            <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-lg">
              <View className="flex-row mr-1">
                {renderStars(rating)}
              </View>
              <Text className="text-slate-700 text-xs font-semibold">
                {rating.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1 flex-1" numberOfLines={1}>
              {academy.address}, {academy.city}
            </Text>
          </View>

          {/* Coach */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="person-outline" size={16} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1">
              Coach: {academy.coachName}
            </Text>
          </View>

          {/* Facilities */}
          <View className="flex-row items-start">
            <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" style={{ marginTop: 2 }} />
            <Text className="text-gray-500 text-xs ml-1 flex-1 leading-4" numberOfLines={2}>
              {academy.facilities.split(',').slice(0, 3).join(', ')}
              {academy.facilities.split(',').length > 3 && '...'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200 bg-slate-900">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 p-2" 
          onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff"  />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">Browse Academies</Text>
            <Text className="text-gray-400 text-sm">
              {filteredAcademies.length} academies 
            </Text>
          </View>
        </View>
      </View>

      {/* Search and Filter */}
      <View className="px-4 py-4 bg-gray-400 ">
        <View className="flex-row items-center">
          {/* Search Bar */}
          <View className="flex-1 bg-white rounded-xl border border-gray-300 flex-row items-center px-4 mr-3">
            <Ionicons name="search-outline" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 text-slate-900 py-3 px-3 text-base"
              placeholder="Search academies..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilter(true)}
            className="bg-slate-900 rounded-xl p-3 shadow-sm"
          >
            <Ionicons name="options-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Active Filter Display */}
        {(filterType !== 'all' && selectedFilter) && (
          <View className="flex-row items-center mt-3">
            <View className="bg-slate-900 px-3 py-2 rounded-full flex-row items-center">
              <Text className="text-white text-sm font-medium mr-2">
                {filterType}: {selectedFilter}
              </Text>
              <TouchableOpacity onPress={() => handleFilterSelect('all')}>
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Academies List */}
      <ScrollView 
        className="flex-1 bg-gray-400" 
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredAcademies.length > 0 ? (
          filteredAcademies.map((academy, index) => (
            <AcademyCard key={index} academy={academy} />
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-16">
            <Ionicons name="search-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-medium mt-4 mb-2">No academies found</Text>
            <Text className="text-gray-400 text-center px-8">
              Try adjusting your search terms or filters to find more academies.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-96">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-slate-900 text-xl font-bold">Filter Academies</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* All Academies */}
              <TouchableOpacity
                onPress={() => handleFilterSelect('all')}
                className={`flex-row items-center justify-between py-3 px-4 rounded-xl mb-2 ${
                  filterType === 'all' ? 'bg-slate-900' : 'bg-gray-50'
                }`}
              >
                <Text className={`font-semibold ${
                  filterType === 'all' ? 'text-white' : 'text-slate-900'
                }`}>
                  All Academies
                </Text>
                {filterType === 'all' && (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </TouchableOpacity>

              {/* Filter by Sport */}
              <Text className="text-gray-600 font-semibold mb-2 mt-4">Filter by Sport</Text>
              {uniqueSports.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  onPress={() => handleFilterSelect('sport', sport)}
                  className={`flex-row items-center justify-between py-3 px-4 rounded-xl mb-2 ${
                    filterType === 'sport' && selectedFilter === sport ? 'bg-slate-900' : 'bg-gray-50'
                  }`}
                >
                  <Text className={`font-medium ${
                    filterType === 'sport' && selectedFilter === sport ? 'text-white' : 'text-slate-900'
                  }`}>
                    {sport}
                  </Text>
                  {filterType === 'sport' && selectedFilter === sport && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}

              {/* Filter by City */}
              <Text className="text-gray-600 font-semibold mb-2 mt-4">Filter by City</Text>
              {uniqueCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => handleFilterSelect('city', city)}
                  className={`flex-row items-center justify-between py-3 px-4 rounded-xl mb-2 ${
                    filterType === 'city' && selectedFilter === city ? 'bg-slate-900' : 'bg-gray-50'
                  }`}
                >
                  <Text className={`font-medium ${
                    filterType === 'city' && selectedFilter === city ? 'text-white' : 'text-slate-900'
                  }`}>
                    {city}
                  </Text>
                  {filterType === 'city' && selectedFilter === city && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}