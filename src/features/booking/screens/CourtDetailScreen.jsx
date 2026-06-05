import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Dimensions, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourtById } from "../../discovery/venueSlice";

const { width } = Dimensions.get("window");

// Placeholder image
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000&auto=format&fit=crop";

// Mapping tên tiếng Việt cho sport
const SPORT_NAMES_VI = {
    "football": "Bóng đá",
    "football_5": "Bóng đá 5",
    "football_7": "Bóng đá 7",
    "football_11": "Bóng đá 11",
    "badminton": "Cầu lông",
    "tennis": "Tennis",
    "pickleball": "Pickleball",
    "basketball": "Bóng rổ",
    "volleyball": "Bóng chuyền",
};

// Mapping amenity → icon
const AMENITY_ICONS = {
    "bãi đỗ xe": { icon: "car", label: "Gửi xe" },
    "wifi": { icon: "wifi", label: "Wifi" },
    "nhà tắm": { icon: "shower", label: "Phòng tắm" },
    "phòng tắm": { icon: "shower", label: "Phòng tắm" },
    "phòng thay đồ": { icon: "hanger", label: "Thay đồ" },
    "tủ đồ": { icon: "locker", label: "Tủ đồ" },
    "căng tin": { icon: "food", label: "Căng tin" },
    "trà đá miễn phí": { icon: "cup-water", label: "Nước uống" },
    "nước uống": { icon: "cup-water", label: "Nước uống" },
};

function getSportNameVI(key) {
    if (!key) return "Khác";
    return SPORT_NAMES_VI[key.toLowerCase()] || key;
}

function formatPrice(price) {
    if (!price && price !== 0) return "Liên hệ";
    const num = typeof price === "string" ? parseInt(price, 10) : price;
    if (isNaN(num)) return price;
    return num.toLocaleString("vi-VN") + "đ";
}

function getAmenityIcon(amenity) {
    const key = amenity.toLowerCase();
    return AMENITY_ICONS[key] || { icon: "check-circle-outline", label: amenity };
}

export default function CourtDetailScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const [activeIndex, setActiveIndex] = useState(0);

    const courtId = route.params?.courtId;
    const { selectedVenue: court, status, error } = useSelector((state) => state.venue);
    const isLoading = status === "loading";

    // Fetch court detail khi có courtId
    useEffect(() => {
        if (courtId) {
            dispatch(fetchCourtById(courtId));
        }
    }, [courtId, dispatch]);

    const onScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveIndex(Math.round(index));
    };

    // Loading state
    if (isLoading || (!court && courtId)) {
        return (
            <View className="flex-1 bg-appBg items-center justify-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="mt-3 text-sm text-appText/60">Đang tải thông tin sân...</Text>
            </View>
        );
    }

    // Error state
    if (error && !court) {
        return (
            <View className="flex-1 bg-appBg items-center justify-center px-6">
                <Ionicons name="cloud-offline-outline" size={48} color={isDark ? "#475569" : "#94A3B8"} />
                <Text className="mt-3 text-sm text-appText/60 text-center">{error}</Text>
                <TouchableOpacity
                    onPress={() => courtId && dispatch(fetchCourtById(courtId))}
                    className="mt-4 rounded-full bg-emerald-700 px-6 py-2"
                >
                    <Text className="text-sm font-bold text-white">Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // No courtId passed (e.g. tapped bottom tab directly)
    if (!court) {
        return (
            <View className="flex-1 bg-appBg items-center justify-center px-6">
                <Ionicons name="tennisball-outline" size={48} color={isDark ? "#475569" : "#94A3B8"} />
                <Text className="mt-3 text-sm text-appText/60 text-center">
                    Chọn một sân từ trang chủ để xem chi tiết.
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Trang chủ")}
                    className="mt-4 rounded-full bg-emerald-700 px-6 py-2"
                >
                    <Text className="text-sm font-bold text-white">Về trang chủ</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Data from API
    const courtImages = court.images && court.images.length > 0 ? court.images : [PLACEHOLDER_IMAGE];
    const sportLabel = (court.sports || []).map(getSportNameVI).join(", ") || "Thể thao";
    const amenities = court.amenities || [];
    const subCourts = court.sub_courts || [];
    const minPrice = subCourts.length > 0
        ? Math.min(...subCourts.map((s) => s.price_per_hour || Infinity))
        : court.price_per_hour || 0;

    return (
        <View className="flex-1 bg-appBg">
            <ScrollView className="flex-1" contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
                {/* Header Image Gallery */}
                <View className="relative h-72 w-full bg-slate-900">
                    <ScrollView 
                        horizontal 
                        pagingEnabled 
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        className="h-full w-full"
                    >
                        {courtImages.map((uri, index) => (
                            <Image 
                                key={index}
                                source={{ uri }} 
                                style={{ width, height: 288 }} 
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View pointerEvents="none" className="absolute bottom-16 left-0 right-0 flex-row justify-center gap-1.5 z-10">
                        {courtImages.map((_, index) => (
                            <View 
                                key={index} 
                                className={`h-1.5 rounded-full ${activeIndex === index ? 'w-5 bg-emerald-500' : 'w-1.5 bg-white/70'}`}
                            />
                        ))}
                    </View>

                    {/* Top Bar Actions */}
                    <View pointerEvents="box-none" className="absolute left-4 right-4 top-12 flex-row justify-between z-10">
                        <TouchableOpacity 
                            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Trang chủ")}
                            className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
                        >
                            <Ionicons name="arrow-back" size={20} color="black" />
                        </TouchableOpacity>
                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                onPress={() => Alert.alert("Chia sẻ", "Tính năng chia sẻ đang phát triển.")}
                                className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
                            >
                                <Ionicons name="share-social" size={20} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => Alert.alert("Yêu thích", "Đã thêm vào danh sách yêu thích!")}
                                className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
                            >
                                <Ionicons name="heart-outline" size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Title Card (Overlapping image) */}
                <View className="-mt-12 mx-4 rounded-2xl bg-appSurface p-5 shadow-lg shadow-black/10 border border-appText/5">
                    <View className="flex-row items-center justify-between">
                        <View className="rounded-full bg-emerald-100 px-2.5 py-1 dark:bg-emerald-900/50">
                            <Text className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                                {sportLabel.toUpperCase()}
                            </Text>
                        </View>
                        {court.avg_rating ? (
                            <View className="flex-row items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-900/30">
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{court.avg_rating}</Text>
                            </View>
                        ) : null}
                    </View>
                    <Text className="mt-3 text-2xl font-bold text-appText">{court.name}</Text>
                    <View className="mt-2 flex-row items-start gap-1">
                        <Ionicons name="location-outline" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className="flex-1 text-sm text-appText/60">{court.location || ""}</Text>
                    </View>
                    {court.open_time && court.close_time ? (
                        <View className="mt-2 flex-row items-center gap-1">
                            <Ionicons name="time-outline" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                            <Text className="text-sm text-appText/60">{court.open_time} - {court.close_time}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Tiện ích (Amenities) */}
                {amenities.length > 0 ? (
                    <View className="mt-8 px-4">
                        <Text className="text-lg font-bold text-appText">Tiện ích</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerClassName="gap-4 px-2">
                            {amenities.map((amenity) => {
                                const { icon, label } = getAmenityIcon(amenity);
                                return (
                                    <View key={amenity} className="items-center">
                                        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-appSurface border border-appText/10 shadow-sm shadow-black/5">
                                            <MaterialCommunityIcons name={icon} size={24} color="#059669" />
                                        </View>
                                        <Text className="mt-2 text-[11px] text-appText/70 text-center" numberOfLines={1}>{label}</Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                ) : null}

                {/* Danh sách sân con (Sub-courts) */}
                {subCourts.length > 0 ? (
                    <View className="mt-8 px-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-bold text-appText">Sân & Bảng giá</Text>
                            <Text className="text-xs text-appText/50">{subCourts.length} sân</Text>
                        </View>

                        <View className="mt-4 gap-3">
                            {subCourts.map((sub) => {
                                const isOpen = sub.status === "open";
                                return (
                                    <TouchableOpacity
                                        key={sub._id}
                                        disabled={!isOpen}
                                        className={`overflow-hidden rounded-2xl border p-4 shadow-sm shadow-black/5 ${
                                            isOpen
                                                ? "bg-appSurface border-appText/10"
                                                : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900 opacity-70"
                                        }`}
                                    >
                                        <View className="absolute bottom-0 left-0 top-0 w-1.5 bg-emerald-600" />
                                        <View className="flex-row items-center justify-between pl-3">
                                            <View className="flex-1">
                                                <Text className="text-sm font-bold text-appText">{sub.name}</Text>
                                                <Text className="mt-1 text-[11px] text-appText/60">
                                                    {getSportNameVI(sub.type)}{sub.surface ? ` • ${sub.surface}` : ""}
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-base font-bold text-emerald-600">
                                                    {formatPrice(sub.price_per_hour)}
                                                </Text>
                                                {isOpen ? (
                                                    <Text className="text-[10px] font-medium text-appText/50">/Giờ</Text>
                                                ) : (
                                                    <View className="mt-1 rounded bg-red-600 px-1.5 py-0.5">
                                                        <Text className="text-[9px] font-bold text-white">HẾT SÂN</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ) : null}

                {/* Giới thiệu */}
                <View className="mt-8 px-4">
                    <Text className="text-lg font-bold text-appText">Giới thiệu</Text>
                    <Text className="mt-2 text-sm text-appText/70 leading-relaxed">
                        {court.name} mở cửa từ {court.open_time || "06:00"} đến {court.close_time || "22:00"}.
                        {court.number_of_courts ? ` Tổng cộng ${court.number_of_courts} sân.` : ""}
                        {amenities.length > 0 ? ` Tiện ích: ${amenities.join(", ")}.` : ""}
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Sticky Bar */}
            <View className="absolute bottom-0 left-0 right-0 border-t border-appText/10 bg-appSurface px-5 py-4 shadow-lg shadow-black/20" style={{ paddingBottom: 24 }}>
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-[10px] font-bold tracking-wider text-appText/50 uppercase">CHỈ TỪ</Text>
                        <View className="flex-row items-end gap-1 mt-0.5">
                            <Text className="text-2xl font-black text-appText">
                                {formatPrice(minPrice || court.price_per_hour)}
                            </Text>
                            <Text className="mb-1 text-xs font-bold text-appText/50">/ 1h</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("Thanh toán", { courtId: court.id || court._id })}
                        className="rounded-xl bg-emerald-700 px-8 py-3.5 shadow-md shadow-emerald-900/20"
                    >
                        <Text className="text-base font-bold text-white text-center">Tiếp tục đặt{"\n"}sân</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
