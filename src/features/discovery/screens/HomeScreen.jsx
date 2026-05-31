import { ScrollView, Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

const sports = [
    { name: "Bóng đá", sessions: "24 sân", tone: "bg-[#1A4D63]", icon: "soccer" },
    { name: "Cầu lông", sessions: "18 sân", tone: "bg-[#5B3D77]", icon: "badminton" },
    { name: "Tennis", sessions: "12 sân", tone: "bg-[#14532D]", icon: "tennis" },
    { name: "Pickleball", sessions: "9 sân", tone: "bg-[#1D4ED8]", icon: "table-tennis" },
];

const venues = [
    {
        name: "Arena Center Q1",
        address: "12 Lê Lợi, Quận 1, TP. HCM",
        price: "250.000đ/giờ",
        rating: "4.8",
        tags: ["Bóng đá", "Tennis"],
    },
    {
        name: "Badminton Pro Hub",
        address: "78 Tạ Hiện, Quận 5, TP. HCM",
        price: "180.000đ/giờ",
        rating: "4.9",
        tags: ["Cầu lông", "Pickleball"],
    },
];

export default function HomeScreen() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#FFFFFF" : "#000000";
    const navigation = useNavigation();

    return (
        <ScrollView className="flex-1 bg-appBg" contentContainerClassName="px-4 pb-10 pt-12">
            <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                    <Text className="mt-1 text-3xl font-extrabold tracking-tight text-appText">ArenaS</Text>
                    <View className="mt-2 flex-row items-center gap-2">
                        <View className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <Text className="text-sm text-appText/75">TP. Hồ Chí Minh, VN</Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-2">
                    <TouchableOpacity 
                        onPress={toggleColorScheme}
                        className="h-11 w-11 items-center justify-center rounded-full bg-appSurface border border-appText/10"
                    >
                        <MaterialCommunityIcons 
                            name={isDark ? "weather-sunny" : "weather-night"} 
                            size={20} 
                            color={iconColor} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => Alert.alert("Thông báo", "Bạn không có thông báo mới.")}
                        className="h-11 w-11 items-center justify-center rounded-full bg-appSurface border border-appText/10"
                    >
                        <Ionicons name="notifications-outline" size={20} color={iconColor} />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mt-5 flex-row items-center gap-3">
                <View className="flex-1 flex-row items-center rounded-2xl border border-appText/10 bg-appSurface px-4 py-3">
                    <Ionicons name="search-outline" size={20} color={isDark ? "#94A3B8" : "#64748B"} style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Tìm sân, môn thể thao..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 text-base text-appText"
                    />
                </View>
                <TouchableOpacity 
                    onPress={() => Alert.alert("Bộ lọc", "Tính năng lọc nâng cao đang phát triển.")}
                    className="rounded-2xl bg-emerald-700 px-4 py-3"
                >
                    <Text className="font-semibold text-white">Lọc</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5" contentContainerClassName="gap-3 pr-4">
                {['Tất cả', 'Gần đây', 'Nổi bật', 'Mới'].map((item, index) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => Alert.alert("Danh mục", `Đã chọn: ${item}`)}
                        className={`rounded-full px-4 py-2 ${index === 0 ? 'bg-emerald-700' : 'bg-appSurface border border-appText/10'}`}
                    >
                        <Text className={`text-sm font-semibold ${index === 0 ? 'text-white' : 'text-appText/80'}`}>{item}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View className="mt-7 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-appText">Môn thể thao</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Sân đấu")}>
                    <Text className="text-sm font-semibold text-emerald-300">Xem tất cả ›</Text>
                </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between gap-3">
                {sports.map((item) => (
                    <TouchableOpacity 
                        key={item.name} 
                        onPress={() => navigation.navigate("Sân đấu")}
                        activeOpacity={0.8}
                        className={`w-[48%] overflow-hidden rounded-2xl p-3 shadow-lg shadow-black/20 ${item.tone}`}
                    >
                        <View className="mb-10 h-8 w-8 items-center justify-center rounded-full bg-white/95">
                            <MaterialCommunityIcons name={item.icon} size={20} color="#000000" />
                        </View>
                        <Text className="text-lg font-bold text-white">{item.name}</Text>
                        <Text className="mt-1 text-sm text-white/85">{item.sessions}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="mt-8 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-appText">Sân gần bạn</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Sân đấu")}>
                    <Text className="text-sm font-semibold text-emerald-300">Xem tất cả</Text>
                </TouchableOpacity>
            </View>

            <View className="mt-4 gap-4">
                {venues.map((venue) => (
                    <TouchableOpacity 
                        key={venue.name} 
                        className="rounded-3xl bg-appSurface p-3 border border-appText/10"
                        onPress={() => navigation.navigate("Đặt lịch")}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row gap-3">
                            <View className="h-20 w-20 rounded-2xl bg-[#0B1B31]" />
                            <View className="flex-1">
                                <View className="flex-row items-start justify-between gap-2">
                                    <Text className="flex-1 text-base font-bold text-appText">{venue.name}</Text>
                                    <Text className="text-sm font-semibold text-amber-300">★ {venue.rating}</Text>
                                </View>
                                <Text className="mt-1 text-xs text-appText/65">{venue.address}</Text>
                                <View className="mt-2 flex-row flex-wrap gap-2">
                                    {venue.tags.map((tag) => (
                                        <View key={tag} className="rounded-full bg-appText/5 px-2.5 py-1">
                                            <Text className="text-[11px] text-appText/75">{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                                <View className="mt-3 flex-row items-center justify-between gap-2">
                                    <Text className="flex-1 text-sm font-bold text-emerald-400" numberOfLines={1}>{venue.price}</Text>
                                    <View className="rounded-full bg-emerald-600 px-4 py-1.5 justify-center items-center">
                                        <Text className="text-[13px] font-bold text-white">Đặt</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}
