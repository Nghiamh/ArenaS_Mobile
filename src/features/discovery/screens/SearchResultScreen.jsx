import { Text, View } from "react-native";

export default function SearchResultScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-appBg px-6">
            <Text className="text-2xl font-bold text-appText">Search results</Text>
            <Text className="mt-2 text-center text-appText/70">Filter and sort venues by sport, location, and availability.</Text>
        </View>
    );
}
