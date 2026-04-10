import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Using 'as const' ensures TypeScript treats these as fixed tuples, 
// fixing the "No overload matches this call" error.
const FEATURES = [
  {
    id: 'scoring',
    title: 'Live Scoring',
    desc: 'Instant event logging.',
    icon: 'football',
    colors: ['#10b981', '#059669'] as const,
    route: '/(football)/landingScreen/matches',
  },
  {
    id: 'possession',
    title: 'Possession',
    desc: 'Live toggle system.',
    icon: 'analytics',
    colors: ['#3b82f6', '#2563eb'] as const,
    route: '/(football)/scoring',
  },
  {
    id: 'roster',
    title: 'Squad Mgmt',
    desc: 'Handle substitutions.',
    icon: 'people',
    colors: ['#6366f1', '#4f46e5'] as const,
    route: '/(football)/teams',
  },
  {
    id: 'stats',
    title: 'Deep Stats',
    desc: 'Automated match summaries.',
    icon: 'flash',
    colors: ['#f59e0b', '#d97706'] as const,
    route: '/(football)/history',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* --- HERO SECTION --- */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80' }}
          className="h-[420px]"
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.9)'] as const}
            className="absolute inset-0"
          />
          
          <View className="flex-1 justify-end p-6 pb-12">
            <View className="bg-blue-500 self-start px-3 py-1 rounded-lg mb-4 shadow-lg shadow-blue-500/50">
              <Text className="text-white text-[10px] font-black uppercase tracking-[2px]">Pro Dashboard</Text>
            </View>
            <Text className="text-white text-4xl font-black italic uppercase leading-[40px]">
              Master The{"\n"}Sports Logic.
            </Text>
            <View className="h-1.5 w-14 bg-blue-500 mt-4 rounded-full" />
          </View>
        </ImageBackground>

        {/* --- WELCOME FLOATING CARD --- */}
        <View className="px-6 -mt-10">
          <View 
            style={styles.glassCard}
            className="bg-white p-6 rounded-[32px] shadow-2xl shadow-blue-900/20 border border-white"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Partner</Text>
                <Text className="text-slate-900 text-2xl font-black italic uppercase">Sportify <Text className="text-blue-600">Pro</Text></Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.7}
                className="w-12 h-12 bg-slate-900 rounded-2xl items-center justify-center shadow-lg"
              >
                <Ionicons name="add" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- QUICK INSIGHTS TICKER --- */}
        <View className="mt-8 px-6">
           <Text className="text-slate-900 font-black text-lg uppercase italic mb-4 tracking-tight">Live Insights</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {[
                { label: 'Active Matches', val: '24', icon: 'timer-outline' },
                { label: 'Top Scorers', val: '182', icon: 'podium-outline' },
                { label: 'Venues Busy', val: '85%', icon: 'business-outline' }
              ].map((item, i) => (
                <View key={i} className="bg-white px-6 py-4 rounded-3xl mr-3 border border-slate-100 shadow-sm flex-row items-center">
                  <View className="mr-4 bg-slate-50 p-2 rounded-xl">
                    <Ionicons name={item.icon as any} size={20} color="#2563eb" />
                  </View>
                  <View>
                    <Text className="text-slate-900 font-black text-xl">{item.val}</Text>
                    <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-tighter">{item.label}</Text>
                  </View>
                </View>
              ))}
           </ScrollView>
        </View>

        {/* --- FEATURE GRID --- */}
        <View className="p-6 mt-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-slate-900 font-black text-lg uppercase italic tracking-tight">Core Modules</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-black text-[10px] uppercase tracking-[1.5px]">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {FEATURES.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => router.push(item.route as any)}
                style={{ width: width * 0.435 }}
                className="bg-white p-6 rounded-[35px] mb-5 border border-slate-50 shadow-sm"
              >
                <LinearGradient
                  colors={item.colors}
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-5"
                  style={{ 
                    shadowColor: item.colors[0], 
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3, 
                    shadowRadius: 8,
                    elevation: 5
                  }}
                >
                  <Ionicons name={item.icon as any} size={22} color="white" />
                </LinearGradient>
                <Text className="text-slate-900 font-black text-base mb-1">{item.title}</Text>
                <Text className="text-slate-400 text-[10px] font-bold leading-4 mb-4">{item.desc}</Text>
                
                <View className="flex-row items-center">
                   <Text className="text-blue-600 font-black text-[10px] uppercase">Initialize</Text>
                   <Ionicons name="chevron-forward" size={12} color="#2563eb" className="ml-1" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- CTA FOOTER CARD --- */}
        <View className="px-6 mb-12">
          <TouchableOpacity 
            activeOpacity={0.9}
            className="bg-slate-900 p-8 rounded-[45px] shadow-2xl shadow-blue-900/40 relative overflow-hidden"
          >
            <View className="z-10">
              <Text className="text-white text-2xl font-black italic uppercase leading-7">Launch New{"\n"}Game Engine</Text>
              <Text className="text-slate-400 text-xs mt-3 font-medium max-w-[210px] leading-4">
                Deploy live match tracking and analytical data capture for scheduled events.
              </Text>
              <View className="bg-blue-600 self-start px-6 py-3.5 rounded-2xl mt-6 shadow-xl shadow-blue-500/40">
                <Text className="text-white font-black uppercase tracking-[1.5px] text-[10px]">Start Tracking</Text>
              </View>
            </View>
            <View className="absolute -right-10 -bottom-10 opacity-10">
              <Ionicons name="football" size={220} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  }
});