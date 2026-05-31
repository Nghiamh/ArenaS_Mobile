import { ScrollView, Text, View } from "react-native";

import Button from "../../../components/Button";
import Input from "../../../components/Input";

export default function RegisterScreen() {
    return (
        <ScrollView className="flex-1 bg-appBg" contentContainerClassName="flex-grow px-6 py-10">
            <View className="flex-1 justify-center gap-5">
                <View className="gap-2">
                    <Text className="text-3xl font-bold text-appText">Create account</Text>
                    <Text className="text-base text-appText/70">Set up your ArenaS profile to start booking courts.</Text>
                </View>

                <Input label="Full name" placeholder="Nguyen Van A" />
                <Input label="Email" placeholder="name@arenas.com" keyboardType="email-address" autoCapitalize="none" />
                <Input label="Password" placeholder="Create a password" secureTextEntry />

                <Button title="Create account" onPress={() => { }} />
            </View>
        </ScrollView>
    );
}
