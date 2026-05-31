import { ScrollView, Text, View } from "react-native";
import { useDispatch } from "react-redux";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { setGuestMode } from "../authSlice";
import { setItem } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../constants/config";

export default function LoginScreen() {
    const dispatch = useDispatch();

    const handleSkipLogin = async () => {
        await setItem(STORAGE_KEYS.guestMode, "true");
        dispatch(setGuestMode());
    };

    return (
        <View className="flex-1 bg-appBg">
            <ScrollView className="flex-1" contentContainerClassName="flex-grow px-6 py-10">
                <View className="flex-1 justify-center gap-5">
                    <View className="gap-2">
                        <Text className="text-3xl font-bold text-appText">Welcome back</Text>
                        <Text className="text-base text-appText/70">Sign in to manage bookings, venues, and availability.</Text>
                    </View>

                    <Input label="Email" placeholder="name@arenas.com" keyboardType="email-address" autoCapitalize="none" />
                    <Input label="Password" placeholder="••••••••" secureTextEntry />

                    <Button title="Sign in" onPress={() => { }} />
                    <Button title="Continue as guest" variant="secondary" onPress={handleSkipLogin} />
                    <Text className="text-center text-xs text-appText/60">You can skip login and browse the home page immediately.</Text>
                </View>
            </ScrollView>
        </View>
    );
}
