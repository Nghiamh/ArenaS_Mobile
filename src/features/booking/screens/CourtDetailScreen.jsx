import { Text, View } from "react-native";

import Button from "../../../components/Button";

export default function CourtDetailScreen() {
    return (
        <View className="flex-1 bg-appBg px-6 py-8">
            <Text className="text-2xl font-bold text-appText">Court details</Text>
            <Text className="mt-2 text-appText/70">Show venue info, images, amenities, policies, and real-time slot availability here.</Text>
            <Button title="Select time slot" className="mt-6" onPress={() => { }} />
        </View>
    );
}
