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
            {/* Enhanced Custom Header */}
            <View className="bg-sky-100 px-4 py-4 flex-row items-center border-b-2 border-slate-700 shadow-lg">
                <TouchableOpacity
                    onPress={() => {
                        console.log('🔙 Back button pressed - going directly to sports');
                        router.navigate('/(homeScreenTabs)/sports');
                    }}
                    className="mr-4 p-2 rounded-full bg-slate-900/10"
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <View className="flex-row items-center flex-1">
                    
                    <Text className="text-2xl font-bold text-slate-900">Football</Text>
                </View>
            </View>

            {/* Enhanced Tab Navigator */}
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "#e0f2fe",
                    tabBarInactiveTintColor: "#64748b",
                    tabBarLabelStyle: { 
                        fontWeight: "700", 
                        textTransform: "none",
                        fontSize: 15,
                        textAlign: 'center'
                    },
                    tabBarStyle: { 
                        backgroundColor: "#0f172a",
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                        height: 52,
                        pointerEvents: 'none'
                    },
                    tabBarIndicatorStyle: { 
                        backgroundColor: "#87ceeb", 
                        height: 4,
                        borderRadius: 2,
                        marginBottom: 0,
                        shadowColor: "#87ceeb",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.6,
                        shadowRadius: 4,
                    },
                    swipeEnabled: true,
                    
                    tabBarContentContainerStyle: {
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    tabBarItemStyle: {
                        paddingHorizontal: 20,
                        paddingVertical: 14
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