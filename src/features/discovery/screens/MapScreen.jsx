import { Text, View } from "react-native";

export default function MapScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-appBg px-6">
            <Text className="text-2xl font-bold text-appText">Map view</Text>
            <Text className="mt-2 text-center text-appText/70">Integrate a map provider here for venue discovery and distance sorting.</Text>
        </View>
    );
}
