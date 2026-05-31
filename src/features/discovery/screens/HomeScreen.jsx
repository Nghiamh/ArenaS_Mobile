import { Text, View } from "react-native";

import Button from "../../../components/Button";
import { venueTypes } from "../../../constants/theme";

export default function HomeScreen() {
    return (
        <View className="flex-1 bg-appBg px-6 py-8">
            <Text className="text-3xl font-bold text-appText">ArenaS</Text>
            <Text className="mt-2 text-base text-appText/70">Book Football, Badminton, Tennis, and Pickleball venues in one flow.</Text>

            <View className="mt-8 gap-3 rounded-3xl bg-appSurface p-5">
                <Text className="text-lg font-semibold text-appText">Sports categories</Text>
                <View className="flex-row flex-wrap gap-2">
                    {venueTypes.map((item) => (
                        <View key={item} className="rounded-full bg-white/5 px-4 py-2">
                            <Text className="text-sm text-appText">{item}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <Button title="Explore venues" className="mt-6" onPress={() => { }} />
        </View>
    );
}
