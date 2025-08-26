import React from "react";
import { useAcademyStore } from "@/store/academyStore";
import { Text, View } from "react-native";




export default function ManageAcademy()
{
const Academies = useAcademyStore((state) => state.academies)
console.log(Academies);
   return (
     <View>
        <Text>
            hello manage academy 
        </Text>
    </View>
   )

}