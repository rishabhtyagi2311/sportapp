import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ViewCertificateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        academyName: string;
        recipientName: string;
        achievementText: string;
        date: string;
        headCoachName: string;
    }>();

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" />

            {/* Header Navigation */}
            <View className="px-6 py-4 flex-row items-center ">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="h-10 w-10 bg-white/10 rounded-full items-center justify-center"
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>


            </View>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* The Certificate Card */}
                <View className="bg-[#FFFDF5] rounded-xl overflow-hidden shadow-2xl shadow-black">

                    {/* Ornamental Border Inner */}
                    <View className="m-2 border-2 border-[#D4AF37] p-6 items-center rounded-sm">

                        {/* Top Row: Academy & Logo */}
                        <View className="flex flex-col   w-full mb-8">



                            <View className="self-end">
                                <Image
                                    source={require("@/assets/images/sportify_name.png")}
                                    style={{ width: 100, height: 50, resizeMode: 'contain' }}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#1a1a1a] font-black text-xs uppercase tracking-tighter">
                                    {params.academyName}
                                </Text>
                                <View className="h-0.5 w-12 bg-[#D4AF37] mt-1" />

                            </View>

                        </View>

                        {/* Certificate Body */}
                        <Text className="text-[#D4AF37] text-3xl mb-4" style={{ fontFamily: 'serif' }}>
                            Certificate
                        </Text>
                        <Text className="text-slate-500 text-[10px] uppercase tracking-[4px] font-bold mb-8">
                            Of Achievement
                        </Text>

                        <Text className="text-slate-400 italic text-sm mb-2">This is to certify that</Text>

                        <Text className="text-slate-900 text-3xl font-black mb-1 text-center" style={{ fontFamily: 'serif' }}>
                            {params.recipientName}
                        </Text>
                        <View className="h-[1px] w-48 bg-slate-200 mb-6" />

                        <Text className="text-slate-500 text-center text-sm leading-6 px-4 mb-8">
                            has been recognized for their exceptional performance and dedication, resulting in the title of{" "}
                            <Text className="text-slate-900 font-bold italic">"{params.achievementText}"</Text>
                        </Text>

                        {/* Footer: Date & Signatures */}
                        <View className="flex-row justify-between items-end w-full mt-4">
                            <View className="items-center">
                                <Text className="text-slate-900 font-bold text-xs">{params.date}</Text>
                                <View className="h-[1px] w-24 bg-slate-300 my-1" />
                                <Text className="text-slate-400 text-[8px] uppercase font-bold">Date Issued</Text>
                            </View>

                            {/* Central Seal Icon */}
                            <View className="items-center justify-center">
                                <View className="bg-[#D4AF37] h-12 w-12 rounded-full items-center justify-center border-2 border-white shadow-sm">
                                    <Ionicons name="ribbon" size={24} color="white" />
                                </View>
                            </View>

                            <View className="items-center">
                                <Text className="text-slate-900 font-bold text-xs" style={{ fontFamily: 'serif' }}>
                                    {params.headCoachName}
                                </Text>
                                <View className="h-[1px] w-24 bg-slate-300 my-1" />
                                <Text className="text-slate-400 text-[8px] uppercase font-bold">Head Coach</Text>
                            </View>
                        </View>

                    </View>
                </View>

                {/* Action Button */}
              
            </ScrollView>
        </SafeAreaView>
    );
}