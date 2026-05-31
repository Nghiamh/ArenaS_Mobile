import { ScrollView, Text, View } from "react-native";

import Button from "../../../components/Button";
import Input from "../../../components/Input";

export default function LoginScreen() {
    return (
        <ScrollView className="flex-1 bg-appBg" contentContainerClassName="flex-grow px-6 py-10">
            <View className="flex-1 justify-center gap-5">
                <View className="gap-2">
                    <Text className="text-3xl font-bold text-appText">Welcome back</Text>
                    <Text className="text-base text-appText/70">Sign in to manage bookings, venues, and availability.</Text>
                </View>

                <Input label="Email" placeholder="name@arenas.com" keyboardType="email-address" autoCapitalize="none" />
                <Input label="Password" placeholder="••••••••" secureTextEntry />

                <Button title="Sign in" onPress={() => { }} />
            </View>
        </ScrollView>
    );
}
