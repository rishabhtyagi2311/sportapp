import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";

const TopTabs = createMaterialTopTabNavigator();
export const Tabs = withLayoutContext(TopTabs.Navigator);

export default function AcademyTabsLayout() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const handleBackPress = () => {
        router.navigate("./../../(homeScreenTabs)/academy");
    };


    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Header Section */}
            <View className="bg-slate-900 shadow-lg">
                <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={handleBackPress}
                        className="mr-3 p-2 rounded-lg "

                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Header Title */}
                    <View className="flex-1">
                        <Text className="text-white font-bold text-lg" numberOfLines={1}>
                            Manage Profiles
                        </Text>
                        <Text className="text-slate-400 text-xs mt-0.5">
                            Track your academies and profiles
                        </Text>
                    </View>


                </View>
            </View>

            {/* Material Top Tabs */}
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "#0f172a",
                    tabBarInactiveTintColor: "#94a3b8",
                    tabBarLabelStyle: {
                        fontWeight: "700",
                        textTransform: "none",
                        fontSize: 14,
                        letterSpacing: 0.3,
                    },
                    tabBarStyle: {
                        backgroundColor: "#ffffff",
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 1,
                        borderBottomColor: "#e2e8f0",
                    },
                    tabBarIndicatorStyle: {
                        backgroundColor: "#0f172a",
                        height: 3,
                        borderRadius: 2,
                    },
                    tabBarPressColor: "#f1f5f9",
                    tabBarItemStyle: {
                        paddingVertical: 8,
                    },
                }}
            >
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "My Profiles",
                    }}
                    initialParams={{ id }}
                />
                <Tabs.Screen
                    name="academies"
                    options={{
                        title: "Joined Academies",
                    }}
                    initialParams={{ id }}
                />

            </Tabs>
        </SafeAreaView>
    );
}