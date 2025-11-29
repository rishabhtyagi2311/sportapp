import React from "react";
import { View, Text } from "react-native";

interface AttendanceCalendarProps {
  year: number;
  month: number; // 0-based (0=Jan, 11=Dec)
  attendance: Record<string, boolean>;
}

export default function AttendanceCalendar({
  year,
  month,
  attendance,
}: AttendanceCalendarProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDayStatus = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return attendance[dateKey];
  };

  return (
    <View className="bg-white rounded-xl p-4 shadow border border-gray-200">
      <Text className="text-lg font-bold text-slate-900 mb-3 text-center">
        {new Date(year, month).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </Text>

      <View className="flex-row flex-wrap justify-center">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          let bgColor = "bg-gray-200";
          let textColor = "text-gray-600";

          if (status === true) {
            bgColor = "bg-green-500";
            textColor = "text-white";
          } else if (status === false) {
            bgColor = "bg-gray-400";
            textColor = "text-white";
          }

          return (
            <View
              key={day}
              className={`w-10 h-10 m-1 rounded-full justify-center items-center ${bgColor}`}
            >
              <Text className={`font-bold ${textColor}`}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
