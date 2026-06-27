import { useEffect } from "react";
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";
import { fetchCourts } from "../../../store/slices/venueSlice";

const filters = ["Tất cả", "Gần đây", "Giá tốt nhất", "Đánh giá cao"];

// Placeholder image
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000&auto=format&fit=crop";

function getCourtImage(court) {
    if (court.image) return court.image;
    if (court.images && court.images.length > 0) return court.images[0];
    if (court.photos && court.photos.length > 0) return court.photos[0];
    if (court.thumbnail) return court.thumbnail;
    return PLACEHOLDER_IMAGE;
}

function getCourtSport(court) {
    if (court.sports && court.sports.length > 0) return court.sports[0];
    return court.sport || court.sportType || court.type || court.category || "";
}

function formatPrice(price) {
    if (!price && price !== 0) return "Liên hệ";
    const num = typeof price === "string" ? parseInt(price, 10) : price;
    if (isNaN(num)) return price;
    return num.toLocaleString("vi-VN") + "đ";
}

export default function SearchResultScreen() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#FFFFFF" : "#000000";
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const sportName = route.params?.sport || "";
    const query = route.params?.query || "";
    const matchId = route.params?.matchId || null;

    const { token, isGuest, user } = useSelector((state) => state.auth);
    const isLoggedIn = !!token && !isGuest;

    const { venues: courts, status, error } = useSelector((state) => state.venue);
    const isLoading = status === "loading";

    // Fetch courts khi vào screen (hoặc dùng data đã có)
    useEffect(() => {
        if (courts.length === 0) {
            dispatch(fetchCourts());
        }
    }, [dispatch, courts.length]);

    // Lọc theo sport hoặc query nếu có
    const filteredCourts = courts.filter((c) => {
        let matchesSport = true;
        let matchesQuery = true;

        if (sportName) {
            const sports = c.sports || [];
            matchesSport = sports.some((s) => s.toLowerCase().includes(sportName.toLowerCase()));
        }

        if (query) {
            const q = query.toLowerCase();
            const nameMatch = (c.name || "").toLowerCase().includes(q);
            const addressMatch = (c.location || c.address || "").toLowerCase().includes(q);
            const sportMatch = (c.sports || []).some(s => s.toLowerCase().includes(q));
            matchesQuery = nameMatch || addressMatch || sportMatch;
        }

        return matchesSport && matchesQuery;
    });

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
                        {!isLoggedIn && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Đăng nhập")}
                                className="h-9 px-3 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800"
                            >
                                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Đăng nhập</Text>
                            </TouchableOpacity>
                        )}
                        {isLoggedIn ? (
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Thông báo")}
                                className="h-9 w-9 items-center justify-center rounded-full bg-appSurface border border-appText/10 relative"
                            >
                                <Ionicons name="notifications-outline" size={18} color={iconColor} />
                                {/* Giả lập có thông báo */}
                                <View className="absolute top-1.5 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border border-appSurface" />
                            </TouchableOpacity>
                        ) : null}
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

                {/* Split-pay banner when coming from Chat */}
                {matchId && (
                    <View className="mx-4 mt-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-xl flex-row items-center gap-3">
                        <Ionicons name="people-outline" size={20} color="#059669" />
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Đặt sân chia tiền 50/50</Text>
                            <Text className="text-[11px] text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">Chọn sân bên dưới — mỗi người trả một nửa.</Text>
                        </View>
                    </View>
                )}

                {/* Sub-header info */}
                <View className="px-4 mt-4">
                    <Text className="text-sm text-appText/60">
                        Tìm thấy {filteredCourts.length} kết quả cho {query ? `"${query}"` : sportName ? `sân ${sportName.toLowerCase()}` : "tất cả sân"}
                    </Text>
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
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#059669" />
                        <Text className="mt-3 text-sm text-appText/60">Đang tải danh sách sân...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <Ionicons name="cloud-offline-outline" size={48} color={isDark ? "#475569" : "#94A3B8"} />
                        <Text className="mt-3 text-sm text-appText/60 text-center">{error}</Text>
                        <TouchableOpacity
                            onPress={() => dispatch(fetchCourts())}
                            className="mt-4 rounded-full bg-emerald-700 px-6 py-2"
                        >
                            <Text className="text-sm font-bold text-white">Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView className="flex-1 mt-4" contentContainerClassName="px-4 pb-8 gap-4" showsVerticalScrollIndicator={false}>
                        {filteredCourts.length === 0 ? (
                            <View className="items-center py-16">
                                <Ionicons name="search-outline" size={48} color={isDark ? "#475569" : "#94A3B8"} />
                                <Text className="mt-3 text-sm text-appText/60 text-center">
                                    Không tìm thấy sân phù hợp với "{query || sportName}".
                                </Text>
                            </View>
                        ) : (
                            filteredCourts.map((court) => (
                                <TouchableOpacity 
                                    key={court._id || court.id} 
                                    className="rounded-2xl bg-appSurface shadow-sm shadow-black/10 overflow-hidden border border-appText/5"
                                    onPress={() => navigation.navigate("Đặt lịch", { courtId: court._id || court.id, matchId })}
                                    activeOpacity={0.8}
                                >
                                    {/* Image Section */}
                                    <View className="relative h-40 w-full bg-slate-200 dark:bg-slate-800">
                                        <Image 
                                            source={{ uri: getCourtImage(court) }} 
                                            className="h-full w-full object-cover"
                                        />
                                        {/* Rating Badge */}
                                        {court.avg_rating || court.rating ? (
                                            <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded bg-white px-1.5 py-0.5 shadow-sm">
                                                <Ionicons name="star" size={12} color="#F59E0B" />
                                                <Text className="text-[11px] font-bold text-slate-800">{court.avg_rating || court.rating}</Text>
                                            </View>
                                        ) : null}
                                        {/* Status Badge */}
                                        <View className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 ${court.status === "unavailable" ? "bg-slate-600" : "bg-emerald-600"}`}>
                                            <Text className="text-[10px] font-bold tracking-wide text-white">
                                                {court.status === "unavailable" ? "HẾT SÂN" : "CÒN SÂN"}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Content Section */}
                                    <View className="p-4">
                                        <View className="flex-row items-start justify-between">
                                            <Text className="text-base font-bold text-appText flex-1 mr-2">{court.name || "Sân không tên"}</Text>
                                        </View>
                                        
                                        <View className="flex-row items-center gap-1 mt-1">
                                            <Ionicons name="location-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                            <Text className="text-xs text-appText/60">{court.location || court.address || ""}</Text>
                                        </View>

                                        {/* Divider line */}
                                        <View className="h-px w-full bg-appText/5 my-3" />

                                        <View className="flex-row items-end justify-between">
                                            <View>
                                                <Text className="text-[10px] text-appText/50 uppercase tracking-wider font-semibold">Chỉ từ</Text>
                                                <View className="flex-row items-end gap-0.5 mt-0.5">
                                                    <Text className="text-lg font-bold text-emerald-600">
                                                        {formatPrice(court.price_per_hour || court.price || court.pricePerHour)}
                                                    </Text>
                                                    <Text className="text-xs font-bold text-appText/50 mb-0.5">/h</Text>
                                                </View>
                                            </View>
                                            
                                            <TouchableOpacity 
                                                className="rounded-lg px-4 py-2"
                                                style={{ backgroundColor: matchId ? '#D97706' : '#10B981' }}
                                                onPress={() => navigation.navigate("Đặt lịch", { courtId: court._id || court.id, matchId })}
                                            >
                                                <Text className="text-xs font-bold text-white">{matchId ? 'CHIA TIỀN' : 'ĐẶT NGAY'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}
