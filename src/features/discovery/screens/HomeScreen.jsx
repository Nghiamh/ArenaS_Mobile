import { ScrollView, Text, TextInput, View } from "react-native";

const sports = [
    { name: "Bóng đá", sessions: "24 sân", tone: "bg-[#1A4D63]" },
    { name: "Cầu lông", sessions: "18 sân", tone: "bg-[#5B3D77]" },
    { name: "Tennis", sessions: "12 sân", tone: "bg-[#14532D]" },
    { name: "Pickleball", sessions: "9 sân", tone: "bg-[#1D4ED8]" },
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
    return (
        <ScrollView className="flex-1 bg-appBg" contentContainerClassName="px-4 pb-10 pt-12">
            <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                    <Text className="text-sm font-medium text-emerald-300">Chào buổi sáng 👋</Text>
                    <Text className="mt-1 text-3xl font-extrabold tracking-tight text-appText">ArenaS</Text>
                    <View className="mt-2 flex-row items-center gap-2">
                        <View className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <Text className="text-sm text-appText/75">TP. Hồ Chí Minh, VN</Text>
                    </View>
                </View>

                <View className="h-11 w-11 items-center justify-center rounded-full bg-appSurface border border-white/10">
                    <Text className="text-lg">🔔</Text>
                </View>
            </View>

            <View className="mt-5 flex-row items-center gap-3">
                <View className="flex-1 flex-row items-center rounded-2xl border border-white/8 bg-appSurface px-4 py-3">
                    <Text className="mr-2 text-base text-appText/50">⌕</Text>
                    <TextInput
                        placeholder="Tìm sân, môn thể thao..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 text-base text-appText"
                    />
                </View>
                <View className="rounded-2xl bg-emerald-700 px-4 py-3">
                    <Text className="font-semibold text-white">Lọc</Text>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5" contentContainerClassName="gap-3 pr-4">
                {['Tất cả', 'Gần đây', 'Nổi bật', 'Mới'].map((item, index) => (
                    <View
                        key={item}
                        className={`rounded-full px-4 py-2 ${index === 0 ? 'bg-emerald-700' : 'bg-appSurface border border-white/8'}`}
                    >
                        <Text className={`text-sm font-semibold ${index === 0 ? 'text-white' : 'text-appText/80'}`}>{item}</Text>
                    </View>
                ))}
            </ScrollView>

            <View className="mt-7 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-appText">Môn thể thao</Text>
                <Text className="text-sm font-semibold text-emerald-300">Xem tất cả ›</Text>
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between gap-3">
                {sports.map((item) => (
                    <View key={item.name} className={`w-[48%] overflow-hidden rounded-2xl p-3 shadow-lg shadow-black/20 ${item.tone}`}>
                        <View className="mb-10 h-8 w-8 rounded-full bg-white/95" />
                        <Text className="text-lg font-bold text-white">{item.name}</Text>
                        <Text className="mt-1 text-sm text-white/85">{item.sessions}</Text>
                    </View>
                ))}
            </View>

            <View className="mt-8 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-appText">Sân gần bạn</Text>
                <Text className="text-sm font-semibold text-emerald-300">Xem tất cả</Text>
            </View>

            <View className="mt-4 gap-4">
                {venues.map((venue) => (
                    <View key={venue.name} className="rounded-3xl bg-appSurface p-3 border border-white/8">
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
                                        <View key={tag} className="rounded-full bg-white/5 px-2.5 py-1">
                                            <Text className="text-[11px] text-appText/75">{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                                <View className="mt-3 flex-row items-center justify-between">
                                    <Text className="text-base font-bold text-emerald-300">{venue.price}</Text>
                                    <View className="rounded-full bg-emerald-600 px-3 py-2">
                                        <Text className="text-xs font-bold text-white">Đặt ngay</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}
