import { SafeAreaView, ScrollView, Text, TextInput, View, TouchableOpacity, Alert, Image, ImageBackground } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { logout } from "../../auth/authSlice";

const sports = [
    { name: "Bóng đá", sessions: "24 sân", tone: "bg-[#1A4D63]", icon: "soccer", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=400&auto=format&fit=crop" },
    { name: "Cầu lông", sessions: "18 sân", tone: "bg-[#5B3D77]", icon: "badminton", image: "https://maythongdich.com/uploads/images/vi/news/cau-long-tieng-anh-la-gi.jpg" },
    { name: "Tennis", sessions: "12 sân", tone: "bg-[#14532D]", icon: "tennis", image: "https://t4.ftcdn.net/jpg/08/29/43/35/360_F_829433527_Hesay9bs9UBS9gHNdpgIvZPCkgBOm3WK.jpg" },
    { name: "Pickleball", sessions: "9 sân", tone: "bg-[#1D4ED8]", icon: "table-tennis", image: "https://img.freepik.com/premium-photo/orange-pickleball-ball-with-paddle-closeup-pickleball-court-with-space-text_600978-7575.jpg" },
];

const venues = [
    {
        name: "Arena Football",
        address: "Quận 9, TP. Thủ Đức, TP. HCM",
        price: "250.000đ/giờ",
        rating: "4.8",
        tags: ["Bóng đá"],
        image: "https://media.istockphoto.com/id/2167969183/photo/ev-arena-kelab-sultan-sulaiman-at-night.jpg?s=612x612&w=0&k=20&c=kLbnsbeKQy5sTs99dmY82ktY28_TMZDe7wLj0PO42YI="
    },
    {
        name: "Badminton Pro",
        address: "Quận 9, TP. Thủ Đức, TP. HCM",
        price: "180.000đ/giờ",
        rating: "4.9",
        tags: ["Cầu lông", "Pickleball"],
        image: "https://sportnet.vn/uploads/venue/608/-album--1721641826.jpeg"
    },
];

export default function HomeScreen() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#FFFFFF" : "#000000";
    const navigation = useNavigation();
    const dispatch = useDispatch();

    return (
        <SafeAreaView className="flex-1 bg-appBg">
            <ScrollView className="flex-1" contentContainerClassName="px-4 pb-10 pt-2">
                <View className="flex-row items-center justify-end min-h-[48px] mb-2">
                    <View className="absolute inset-0 items-center justify-center z-0" pointerEvents="none">
                        <Image 
                            source={require('../../../../assets/Img/bannerNoBg.JPG.png')} 
                            className="h-28 w-64"
                            resizeMode="contain"
                        />
                    </View>

                    <View className="flex-row items-center gap-2 z-10">
                        <TouchableOpacity
                            onPress={() => dispatch(logout())}
                            className="h-9 px-3 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800"
                        >
                            <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Đăng nhập</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={toggleColorScheme}
                            className="h-9 w-9 items-center justify-center rounded-full bg-appSurface border border-appText/10"
                        >
                            <MaterialCommunityIcons
                                name={isDark ? "weather-sunny" : "weather-night"}
                                size={18}
                                color={iconColor}
                            />
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
                <TouchableOpacity onPress={() => navigation.navigate("Tìm Sân")}>
                    <Text className="text-sm font-semibold text-emerald-300">Xem tất cả ›</Text>
                </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between gap-3">
                {sports.map((item) => (
                    <TouchableOpacity
                        key={item.name}
                        onPress={() => navigation.navigate("Tìm Sân", { sport: item.name })}
                        activeOpacity={0.8}
                        className={`w-[48%] overflow-hidden rounded-3xl shadow-lg shadow-black/20 ${item.tone} min-h-[140px]`}
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
                            className="opacity-50"
                            resizeMode="cover"
                        />
                        <View className="flex-1 justify-between z-10 p-4">
                            <View className="h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm">
                                <MaterialCommunityIcons name={item.icon} size={22} color="#000000" />
                            </View>
                            <View className="mt-8">
                                <Text className="text-xl font-bold text-white shadow-sm">{item.name}</Text>
                                <Text className="mt-1 text-sm font-medium text-white/90">{item.sessions}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="mt-8 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-appText">Sân gần bạn</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Tìm Sân")}>
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
                            <Image
                                source={{ uri: venue.image }}
                                className="h-20 w-20 rounded-2xl bg-slate-200"
                                resizeMode="cover"
                            />
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
        </SafeAreaView>
    );
}
