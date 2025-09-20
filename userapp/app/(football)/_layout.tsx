// app/(football)/_layout.tsx - FINAL OPTIMIZED VERSION
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const TopTabs = createMaterialTopTabNavigator();
export const Tabs = withLayoutContext(TopTabs.Navigator);

export default function FootballLandingLayout() {
    console.log('🏈 Football Layout with Optimized Tabs is rendering');
    
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Custom Header */}
            <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
                <TouchableOpacity
                    onPress={() => {
                        console.log('🔙 Back button pressed - going directly to sports');
                        // Use navigate to go directly to sports screen, bypassing tab history
                        router.navigate('/(homeScreenTabs)/sports');
                    }}
                    className="mr-4"
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Football</Text>
            </View>

            {/* Swipe-Only Tab Navigator - Clicks Disabled */}
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "#111827",
                    tabBarInactiveTintColor: "#6b7280",
                    tabBarLabelStyle: { 
                        fontWeight: "600", 
                        textTransform: "none",
                        fontSize: 14,
                        textAlign: 'center'
                    },
                    tabBarStyle: { 
                        backgroundColor: "white",
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 1,
                        borderBottomColor: "#e5e7eb",
                        height: 48,
                        pointerEvents: 'none' // Disable all clicks on the entire tab bar
                    },
                    tabBarIndicatorStyle: { 
                        backgroundColor: "#111827", 
                        height: 3,
                        borderRadius: 1.5,
                        marginBottom: 0
                    },
                    swipeEnabled: true, // Keep smooth swiping
                    
                    tabBarContentContainerStyle: {
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    tabBarItemStyle: {
                        paddingHorizontal: 16,
                        paddingVertical: 12
                    }
                }}
                initialRouteName="matches/index"
            >
                <Tabs.Screen
                    name="matches/index"
                    options={{ title: "Matches" }}
                />
                <Tabs.Screen
                    name="teams/index"
                    options={{ title: "Teams" }}
                />
                <Tabs.Screen
                    name="tournament/index"
                    options={{ title: "Tournament" }}
                />
            </Tabs>
        </SafeAreaView>
    )
}