import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardTypeOptions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import uuid from 'react-native-uuid';
import { KeyboardAvoidingView, Platform } from 'react-native';


import { Event } from '@/types/booking';
import { useEventManagerStore } from '@/store/eventManagerStore';
import { CURRENT_USER } from './usercontext';

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */
type TournamentFormat = 'league' | 'knockout';
type FeeType = 'per_team' | 'total';

interface FormState {
    name: string;
    description: string;
    venueId: string;
    tournamentFormat: TournamentFormat;
    teamSize: string;
    maxTeams: string;
    maxRegistrations: string;
    date: string;
    time: string;
    duration: string;
    feeAmount: string;
    feeType: FeeType | '';
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT */
/* -------------------------------------------------------------------------- */
export default function CreateFootballTournamentEventScreen() {
    const { createEvent } = useEventManagerStore();

    const [formData, setFormData] = useState<FormState>({
        name: '',
        description: '',
        venueId: '',
        tournamentFormat: 'league',
        teamSize: '11',
        maxTeams: '',
        maxRegistrations: '',
        date: '',
        time: '',
        duration: '2',
        feeAmount: '',
        feeType: '',
    });

    /* ----------------------------- HELPERS -------------------------------- */
    const updateForm = (key: keyof FormState, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleDateChange = (text: string) => {
        const sanitized = text.replace(/[^\d-]/g, '');
        let formatted = sanitized;
        if (sanitized.length > 4 && !sanitized.includes('-')) {
            formatted = sanitized.slice(0, 4) + '-' + sanitized.slice(4);
        }
        if (sanitized.length > 7 && sanitized.split('-').length === 2) {
            const p = formatted.split('-');
            formatted = p[0] + '-' + p[1].slice(0, 2) + '-' + p[1].slice(2);
        }
        if (formatted.length <= 10) updateForm('date', formatted);
    };

    const handleTimeChange = (text: string) => {
        const sanitized = text.replace(/[^\d:]/g, '');
        let formatted = sanitized;
        if (sanitized.length > 2 && !sanitized.includes(':')) {
            formatted = sanitized.slice(0, 2) + ':' + sanitized.slice(2);
        }
        if (formatted.length <= 5) updateForm('time', formatted);
    };

    /* ----------------------------- VALIDATION -------------------------------- */
    const validateForm = (): boolean => {
        if (!formData.name.trim()) return Alert.alert('Error', 'Enter name'), false;
        if (!formData.venueId.trim()) return Alert.alert('Error', 'Enter venue'), false;
        if (!formData.maxRegistrations) return Alert.alert('Error', 'Enter max registrations'), false;
        if (!formData.maxTeams) return Alert.alert('Error', 'Enter max teams'), false;
        if (!formData.date.match(/^\d{4}-\d{2}-\d{2}$/)) return Alert.alert('Error', 'Invalid date'), false;
        if (!formData.time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) return Alert.alert('Error', 'Invalid time'), false;
        if (!formData.feeAmount) return Alert.alert('Error', 'Enter fee'), false;
        if (!formData.feeType) return Alert.alert('Error', 'Select fee type'), false;
        return true;
    };

    /* ----------------------------- SUBMIT ------------------------------------ */
    const handleSubmit = () => {
        if (!validateForm()) return;

        // ✅ THE ONLY REQUIRED FIX
        if (!formData.feeType) return;
        const feeType: FeeType = formData.feeType;

        const [y, m, d] = formData.date.split('-').map(Number);
        const [h, min] = formData.time.split(':').map(Number);
        const dateTime = new Date(y, m - 1, d, h, min);

        const deadline = new Date(dateTime);
        deadline.setDate(deadline.getDate() - 7);

        const event: Event = {
            id: uuid.v4().toString(),
            creatorId: CURRENT_USER.id,
            venueId: formData.venueId,
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,

            eventType: 'tournament',
            tournamentFormat: formData.tournamentFormat,
            maxRegistrations: parseInt(formData.maxRegistrations, 10),

            sport: {
                id: 'football',
                name: 'Football',
                category: 'outdoor',
                varieties: [],
            },

            participationType: 'team',
            teamSize: parseInt(formData.teamSize, 10),
            maxParticipants: parseInt(formData.maxTeams, 10),
            currentParticipants: 0,

            dateTime: dateTime.toISOString(),
            duration: parseFloat(formData.duration),

            fees: {
                amount: parseFloat(formData.feeAmount),
                currency: 'INR',
                type: feeType,
            },

            organizer: {
                name: CURRENT_USER.name,
                contact: CURRENT_USER.phone,
            },

            status: 'upcoming',
            isPublic: true,
            registrationDeadline: deadline.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        createEvent(event);
        router.navigate("(EventManagement)/organizerDahboard");
    };

    /* ----------------------------- UI ---------------------------------------- */
    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <View className="flex-1 bg-slate-900">
                    <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">Create Football Tournament</Text>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 24 }}>
                        <FormInput label="Tournament Name *" icon="trophy-outline" value={formData.name} onChange={(v) => updateForm('name', v)} />
                        <FormInput label="Venue *" icon="location-outline" value={formData.venueId} onChange={(v) => updateForm('venueId', v)} />

                        {/* Tournament Format */}
                        <View className="mb-6">
                            <Text className="text-white font-semibold mb-2">Tournament Format *</Text>
                            <View className="flex-row">
                                {(['league', 'knockout'] as TournamentFormat[]).map((f) => (
                                    <TouchableOpacity
                                        key={f}
                                        onPress={() => updateForm('tournamentFormat', f)}
                                        className={`flex-1 py-3 mr-2 rounded-lg border ${formData.tournamentFormat === f
                                                ? 'bg-green-600 border-green-500'
                                                : 'bg-sky-100 border-gray-300'
                                            }`}
                                    >
                                        <Text className={`text-center font-semibold ${formData.tournamentFormat === f ? 'text-white' : 'text-gray-700'}`}>
                                            {f.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <FormInput label="Team Size *" icon="people-outline" value={formData.teamSize} keyboard="numeric" onChange={(v) => updateForm('teamSize', v)} />
                        <FormInput label="Max Registrations Allowed *" icon="people-outline" value={formData.maxRegistrations} keyboard="numeric" onChange={(v) => updateForm('maxRegistrations', v)} />
                        <FormInput label="Maximum Teams (Final) *" icon="people-circle-outline" value={formData.maxTeams} keyboard="numeric" onChange={(v) => updateForm('maxTeams', v)} />

                        <View className="mb-6">
                            <Text className="text-white font-semibold mb-2">Date & Time *</Text>
                            <View className="flex-row space-x-2">
                                <DateTimeInput icon="calendar-outline" value={formData.date} placeholder="YYYY-MM-DD" onChange={handleDateChange} />
                                <DateTimeInput icon="time-outline" value={formData.time} placeholder="HH:MM" onChange={handleTimeChange} />
                            </View>
                        </View>

                        <FormInput label="Entry Fee *" icon="cash-outline" value={formData.feeAmount} keyboard="numeric" onChange={(v) => updateForm('feeAmount', v)} />

                        <View className="mb-6">
                            <Text className="text-white font-semibold mb-2">Fee Type *</Text>
                            <View className="flex-row">
                                {(['per_team', 'total'] as FeeType[]).map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => updateForm('feeType', type)}
                                        className={`px-4 py-2 mr-2 rounded-lg border ${formData.feeType === type ? 'bg-green-600 border-green-500' : 'bg-sky-100 border-gray-300'
                                            }`}
                                    >
                                        <Text className={formData.feeType === type ? 'text-white font-semibold' : 'text-gray-700'}>
                                            {type === 'per_team' ? 'Per Team' : 'Total'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity onPress={handleSubmit} className="bg-blue-300 rounded-xl py-4">
                            <Text className="text-center font-bold text-lg text-black">Create Tournament Event</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            /</KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/* -------------------------------------------------------------------------- */
/* REUSABLE INPUTS */
/* -------------------------------------------------------------------------- */

interface FormInputProps {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    keyboard?: KeyboardTypeOptions;
}

function FormInput({ label, icon, value, onChange, placeholder, keyboard = 'default' }: FormInputProps) {
    return (
        <View className="mb-6">
            <Text className="text-white font-semibold mb-2">{label}</Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name={icon} size={20} color="#374151" />
                <TextInput
                    className="flex-1 text-black py-4 px-3 text-base"
                    placeholder={placeholder}
                    placeholderTextColor="#6b7280"
                    value={value}
                    onChangeText={onChange}
                    keyboardType={keyboard}
                />
            </View>
        </View>
    );
}

interface DateTimeInputProps {
    icon: 'calendar-outline' | 'time-outline';
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
}

function DateTimeInput({ icon, value, placeholder, onChange }: DateTimeInputProps) {
    return (
        <View className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
            <Ionicons name={icon} size={20} color="#374151" />
            <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder={placeholder}
                placeholderTextColor="#6b7280"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                maxLength={icon === 'calendar-outline' ? 10 : 5}
            />
        </View>
    );
}
