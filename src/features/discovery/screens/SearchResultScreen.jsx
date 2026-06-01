import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { logout } from "../../auth/authSlice";

const results = [
    {
        id: 1,
        name: "Sân bóng Đại Nam",
        location: "Quận 7, TP. HCM",
        distance: "1.2 km",
        price: "350.000đ",
        rating: "4.8",
        status: "CÒN SÂN",
        statusColor: "bg-emerald-600",
        image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "ArenaS Central Park",
        location: "Bình Thạnh, TP. HCM",
        distance: "2.5 km",
        price: "420.000đ",
        rating: "4.9",
        status: "SẮP HẾT",
        statusColor: "bg-slate-600",
        image: "https://images.unsplash.com/photo-1518605368461-1ee7e53f1ff2?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Sân vận động K34",
        location: "Tân Bình, TP. HCM",
        distance: "3.8 km",
        price: "300.000đ",
        rating: "4.5",
        status: "CÒN SÂN",
        statusColor: "bg-emerald-600",
        image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1000&auto=format&fit=crop"
    }
];

const filters = ["Tất cả", "Gần đây", "Giá tốt nhất", "Đánh giá cao"];

export default function SearchResultScreen() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#FFFFFF" : "#000000";
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const sportName = route.params?.sport || "bóng đá";

    return (
        <SafeAreaView className="flex-1 bg-appBg">
            <View className="flex-1 pt-2">
                {/* Header */}
                <View className="flex-row items-center justify-between min-h-[48px] mb-2 px-4">
                    <View className="z-10">
                        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Trang chủ")} className="p-2 -ml-2">
                            <Ionicons name="arrow-back" size={24} color={iconColor} />
                        </TouchableOpacity>
                    </View>

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

            {/* Sub-header info */}
            <View className="px-4 mt-4">
                <Text className="text-sm text-appText/60">Tìm thấy 24 sân {sportName.toLowerCase()} tại</Text>
                <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="location-outline" size={16} color="#059669" />
                    <Text className="text-sm font-bold text-appText">TP. Hồ Chí Minh, VN</Text>
                </View>
            </View>

            {/* Filter chips */}
            <View className="mt-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-2 pb-1">
                    {filters.map((filter, index) => (
                        <TouchableOpacity 
                            key={filter} 
                            onPress={() => Alert.alert("Bộ lọc", `Đã chọn: ${filter}`)}
                            className={`rounded-full px-4 py-1.5 ${index === 0 ? "bg-emerald-500" : "bg-appSurface border border-appText/10"}`}
                        >
                            <Text className={`text-sm font-medium ${index === 0 ? "text-white" : "text-appText/70"}`}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Result List */}
            <ScrollView className="flex-1 mt-4" contentContainerClassName="px-4 pb-8 gap-4" showsVerticalScrollIndicator={false}>
                {results.map((venue) => (
                    <TouchableOpacity 
                        key={venue.id} 
                        className="rounded-2xl bg-appSurface shadow-sm shadow-black/10 overflow-hidden border border-appText/5"
                        onPress={() => navigation.navigate("Đặt lịch")}
                        activeOpacity={0.8}
                    >
                        {/* Image Section */}
                        <View className="relative h-40 w-full bg-slate-200 dark:bg-slate-800">
                            <Image 
                                source={{ uri: venue.image }} 
                                className="h-full w-full object-cover"
                            />
                            {/* Rating Badge */}
                            <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded bg-white px-1.5 py-0.5 shadow-sm">
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text className="text-[11px] font-bold text-slate-800">{venue.rating}</Text>
                            </View>
                            {/* Status Badge */}
                            <View className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 ${venue.statusColor}`}>
                                <Text className="text-[10px] font-bold tracking-wide text-white">{venue.status}</Text>
                            </View>
                        </View>

                        {/* Content Section */}
                        <View className="p-4">
                            <View className="flex-row items-start justify-between">
                                <Text className="text-base font-bold text-appText flex-1 mr-2">{venue.name}</Text>
                                <Text className="text-sm text-appText/50">{venue.distance}</Text>
                            </View>
                            
                            <View className="flex-row items-center gap-1 mt-1">
                                <Ionicons name="location-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className="text-xs text-appText/60">{venue.location}</Text>
                            </View>

                            {/* Divider line */}
                            <View className="h-px w-full bg-appText/5 my-3" />

                            <View className="flex-row items-end justify-between">
                                <View>
                                    <Text className="text-[10px] text-appText/50 uppercase tracking-wider font-semibold">Chỉ từ</Text>
                                    <View className="flex-row items-end gap-0.5 mt-0.5">
                                        <Text className="text-lg font-bold text-emerald-600">{venue.price}</Text>
                                        <Text className="text-xs font-bold text-appText/50 mb-0.5">/h</Text>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    className="rounded-lg bg-emerald-500 px-4 py-2"
                                    onPress={() => navigation.navigate("Đặt lịch")}
                                >
                                    <Text className="text-xs font-bold text-white">ĐẶT NGAY</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
        </SafeAreaView>
    );
}
