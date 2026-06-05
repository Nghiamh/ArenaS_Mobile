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
    const iconColor = isDark ? "#FFFFFF" : "#000000";
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
    const subCourts = court.sub_courts && court.sub_courts.length > 0 
        ? court.sub_courts 
        : [{ _id: '1', name: 'Sân 1', price_per_hour: court.price_per_hour || 190000, type: getCourtSport(court) }, { _id: '2', name: 'Sân 2', price_per_hour: court.price_per_hour || 190000, type: getCourtSport(court) }]; // Fallback data
    const minPrice = subCourts.length > 0
        ? Math.min(...subCourts.map((s) => s.price_per_hour || Infinity))
        : court.price_per_hour || 190000;

    const handleDirections = () => {
        navigation.navigate("Bản đồ", { 
            latitude: court.coordinates?.latitude, 
            longitude: court.coordinates?.longitude, 
            venueName: court.name 
        });
    };

    return (
        <View className="flex-1 bg-appBg">
            <ScrollView className="flex-1" contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
                {/* Header Image Gallery */}
                <View className="relative h-64 w-full bg-slate-200 dark:bg-slate-900">
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
                                style={{ width, height: 256 }} 
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View pointerEvents="none" className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5 z-10">
                        {courtImages.map((_, index) => (
                            <View 
                                key={index} 
                                className={`h-1.5 rounded-full ${activeIndex === index ? 'w-5 bg-emerald-500 dark:bg-white' : 'w-1.5 bg-white/70 dark:bg-white/50'}`}
                            />
                        ))}
                    </View>

                    {/* Top Bar Actions */}
                    <View pointerEvents="box-none" className="absolute left-4 right-4 top-12 flex-row justify-between z-10">
                        <TouchableOpacity 
                            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Trang chủ")}
                            className="h-10 w-10 items-center justify-center rounded-full bg-white/70 dark:bg-black/40"
                        >
                            <Ionicons name="arrow-back" size={20} color={isDark ? "white" : "black"} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => Alert.alert("Yêu thích", "Đã thêm vào danh sách yêu thích!")}
                            className="h-10 w-10 items-center justify-center rounded-full bg-white/70 dark:bg-black/40"
                        >
                            <Ionicons name="heart-outline" size={20} color={isDark ? "white" : "black"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Title & Directions */}
                <View className="px-4 pt-4">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 mr-4">
                            <Text className="text-xl font-bold text-appText">{court.name}</Text>
                            <View className="mt-2 flex-row items-start gap-1">
                                <Ionicons name="location-outline" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className="flex-1 text-xs text-appText/70 leading-tight">
                                    {court.location || court.address || "Chưa cập nhật địa chỉ"}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            onPress={handleDirections}
                            className="flex-row items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2"
                        >
                            <Ionicons name="navigate" size={16} color="white" />
                            <Text className="text-xs font-bold text-white">Chỉ đường</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tiện ích (Amenities) */}
                <View className="mt-5 px-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
                        {amenities.length > 0 ? amenities.map((amenity) => {
                            const { icon, label } = getAmenityIcon(amenity);
                            return (
                                <View key={amenity} className="flex-row items-center gap-2 rounded-xl border border-appText/10 bg-appSurface px-3 py-2">
                                    <MaterialCommunityIcons name={icon} size={16} color="#059669" />
                                    <Text className="text-xs font-medium text-appText">{label}</Text>
                                </View>
                            );
                        }) : (
                            // Fake amenities if empty to match design
                            <>
                                <View className="flex-row items-center gap-2 rounded-xl border border-appText/10 bg-appSurface px-3 py-2">
                                    <MaterialCommunityIcons name="car" size={16} color="#059669" />
                                    <Text className="text-xs font-medium text-appText">Gửi xe</Text>
                                </View>
                                <View className="flex-row items-center gap-2 rounded-xl border border-appText/10 bg-appSurface px-3 py-2">
                                    <MaterialCommunityIcons name="food" size={16} color="#059669" />
                                    <Text className="text-xs font-medium text-appText">Căng tin</Text>
                                </View>
                                <View className="flex-row items-center gap-2 rounded-xl border border-appText/10 bg-appSurface px-3 py-2">
                                    <MaterialCommunityIcons name="locker" size={16} color="#059669" />
                                    <Text className="text-xs font-medium text-appText">Tủ đồ</Text>
                                </View>
                                <View className="flex-row items-center gap-2 rounded-xl border border-appText/10 bg-appSurface px-3 py-2">
                                    <MaterialCommunityIcons name="cup-water" size={16} color="#059669" />
                                    <Text className="text-xs font-medium text-appText">Trà đá</Text>
                                </View>
                            </>
                        )}
                    </ScrollView>
                </View>

                {/* Date Selector */}
                <View className="mt-6 flex-row items-center justify-between px-4">
                    <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-lg border border-appText/10 bg-appSurface">
                        <Ionicons name="chevron-back" size={16} color={iconColor} />
                    </TouchableOpacity>
                    <Text className="text-sm font-semibold text-appText">Thứ 7, 06/07</Text>
                    <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-lg border border-appText/10 bg-appSurface">
                        <Ionicons name="chevron-forward" size={16} color={iconColor} />
                    </TouchableOpacity>
                </View>

                {/* Danh sách sân con & Lịch (Time Slots) */}
                <View className="mt-4 px-4 gap-3">
                    {subCourts.map((sub, idx) => (
                        <View key={sub._id || idx} className="rounded-xl border border-appText/10 bg-appSurface p-3 flex-row items-center shadow-sm shadow-black/5">
                            <Text className="w-14 text-sm font-bold text-appText">{sub.name}</Text>
                            
                            {/* Fake time slots matching the design */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
                                {/* Slot 1 */}
                                <TouchableOpacity className="items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 min-w-[64px]">
                                    <Text className="text-xs font-bold text-white">14:00</Text>
                                    <Text className="text-[9px] text-emerald-100">Available</Text>
                                </TouchableOpacity>
                                {/* Slot 2 */}
                                <TouchableOpacity className="items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 min-w-[64px]">
                                    <Text className="text-xs font-bold text-white">15:00</Text>
                                    <Text className="text-[9px] text-emerald-100">Available</Text>
                                </TouchableOpacity>
                                {/* Slot 3 */}
                                <TouchableOpacity className={`items-center justify-center rounded-lg px-3 py-1.5 min-w-[64px] ${idx % 2 !== 0 ? 'bg-red-600' : 'bg-emerald-600'}`}>
                                    <Text className="text-xs font-bold text-white">16:00</Text>
                                    <Text className={`text-[9px] ${idx % 2 !== 0 ? 'text-red-100' : 'text-emerald-100'}`}>{idx % 2 !== 0 ? 'Booked' : 'Available'}</Text>
                                </TouchableOpacity>
                                {/* Slot 4 */}
                                <TouchableOpacity className={`items-center justify-center rounded-lg px-3 py-1.5 min-w-[64px] ${idx > 0 ? 'bg-slate-400 dark:bg-slate-600' : 'bg-emerald-600'}`}>
                                    <Text className={`text-xs font-bold ${idx > 0 ? 'text-slate-100' : 'text-white'}`}>17:00</Text>
                                    <Text className={`text-[9px] ${idx > 0 ? 'text-slate-200' : 'text-emerald-100'}`}>{idx > 0 ? 'Locked' : 'Available'}</Text>
                                </TouchableOpacity>
                                {/* Slot 5 */}
                                <TouchableOpacity className={`items-center justify-center rounded-lg px-3 py-1.5 min-w-[64px] ${idx > 0 ? 'bg-slate-400 dark:bg-slate-600' : 'bg-emerald-600'}`}>
                                    <Text className={`text-xs font-bold ${idx > 0 ? 'text-slate-100' : 'text-white'}`}>18:00</Text>
                                    <Text className={`text-[9px] ${idx > 0 ? 'text-slate-200' : 'text-emerald-100'}`}>{idx > 0 ? 'Locked' : 'Available'}</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Sticky Bar */}
            <View className="absolute bottom-0 left-0 right-0 border-t border-appText/10 bg-appSurface px-5 py-4 flex-row items-center justify-between shadow-lg shadow-black/20" style={{ paddingBottom: 24 }}>
                <View>
                    <Text className="text-xs font-medium text-appText/60">
                        Giờ hoạt động: <Text className="font-bold text-appText">{court.open_time || "06:00"} - {court.close_time || "22:00"}</Text>
                    </Text>
                    <Text className="mt-1 text-xs font-medium text-appText/60">
                        Giá: <Text className="text-sm font-bold text-emerald-600">{formatPrice(minPrice)}/h</Text>
                    </Text>
                </View>
                <TouchableOpacity 
                    onPress={() => navigation.navigate("Thanh toán", { courtId: court.id || court._id })}
                    className="rounded-xl bg-emerald-600 px-8 py-3.5 shadow-md shadow-emerald-900/20"
                >
                    <Text className="text-sm font-bold text-white text-center">Đặt sân ngay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
