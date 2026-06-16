import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Dimensions, ActivityIndicator, Modal, FlatList } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourtById } from "../../../store/slices/venueSlice";
import { setCheckoutDraft } from "../../../store/slices/bookingSlice";
import bookingApi from "../../../api/bookingApi";

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

function formatLocalYYYYMMDD(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function CourtDetailScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#FFFFFF" : "#000000";
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const [activeIndex, setActiveIndex] = useState(0);
    const [showCalendar, setShowCalendar] = useState(false);

    const [selectedDate, setSelectedDate] = useState(formatLocalYYYYMMDD(new Date()));
    const [slotsData, setSlotsData] = useState([]);
    const [isFetchingSlots, setIsFetchingSlots] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    
    const [selectedSubCourt, setSelectedSubCourt] = useState(null);
    const [selectedSlotIndices, setSelectedSlotIndices] = useState([]);

    const courtId = route.params?.courtId;
    const { selectedVenue: court, status, error } = useSelector((state) => state.venue);
    const isLoading = status === "loading";

    // Helper: Tạo slots client-side dựa trên giờ mở/đóng cửa (giống BE)
    const generateClientSlots = (openTime = "06:00", closeTime = "22:00") => {
        const slots = [];
        const [startH, startM] = openTime.split(":").map(Number);
        const [endH, endM] = closeTime.split(":").map(Number);
        let current = startH * 60 + startM;
        const end = endH * 60 + endM;
        while (current + 30 <= end) {
            const h1 = String(Math.floor(current / 60)).padStart(2, "0");
            const m1 = String(current % 60).padStart(2, "0");
            const next = current + 30;
            const h2 = String(Math.floor(next / 60)).padStart(2, "0");
            const m2 = String(next % 60).padStart(2, "0");
            slots.push({ start: `${h1}:${m1}`, end: `${h2}:${m2}`, status: "available" });
            current = next;
        }
        return slots;
    };

    // Lấy mảng slots hiển thị cho 1 sub_court (ưu tiên BE data, fallback client-side)
    const getSlotsForSubCourt = (subCourtId) => {
        const doc = slotsData.find(s => s.sub_court_id === subCourtId);
        if (doc && doc.slots && doc.slots.length > 0) return doc.slots;
        // BE chưa generate → hiển thị tất cả "available" dựa trên giờ mở cửa
        if (court) return generateClientSlots(court.open_time, court.close_time);
        return [];
    };

    // Fetch court detail khi có courtId
    useEffect(() => {
        if (courtId) {
            dispatch(fetchCourtById(courtId));
        }
    }, [courtId, dispatch]);

    // Fetch slots khi đổi ngày; reset selection
    useEffect(() => {
        setSelectedSubCourt(null);
        setSelectedSlotIndices([]);
        if (courtId && selectedDate) {
            setIsFetchingSlots(true);
            bookingApi.getCourtSlots(courtId, selectedDate)
                .then(res => setSlotsData(res.data || []))
                .catch(err => console.log("Lỗi lấy slots:", err))
                .finally(() => setIsFetchingSlots(false));
        }
    }, [courtId, selectedDate]);

    const handleSlotClick = (subCourtId, index, slot) => {
        if (slot.status !== "available") return;
        
        if (selectedSubCourt !== subCourtId) {
            setSelectedSubCourt(subCourtId);
            setSelectedSlotIndices([index]);
        } else {
            if (selectedSlotIndices.includes(index)) {
                setSelectedSlotIndices(prev => prev.filter(i => i !== index));
            } else {
                setSelectedSlotIndices(prev => [...prev, index].sort((a, b) => a - b));
            }
        }
    };

    const handleBookNow = async () => {
        if (!selectedSubCourt || selectedSlotIndices.length === 0) {
            Alert.alert("Lỗi", "Vui lòng chọn ít nhất 1 khung giờ.");
            return;
        }

        // Check if contiguous
        for (let i = 0; i < selectedSlotIndices.length - 1; i++) {
            if (selectedSlotIndices[i + 1] - selectedSlotIndices[i] !== 1) {
                Alert.alert("Lỗi", "Vui lòng chọn các khung giờ liền kề nhau.");
                return;
            }
        }

        const sub = subCourts.find(s => s._id === selectedSubCourt);
        const slots = getSlotsForSubCourt(selectedSubCourt);
        const selectedSlots = selectedSlotIndices.map(i => slots[i]);
        
        const startTime = selectedSlots[0].start;
        const endTime = selectedSlots[selectedSlots.length - 1].end;
        const price = (sub.price_per_hour || court.price_per_hour || 0) / 2 * selectedSlotIndices.length;

        // ── Bước 1: Lock slots trước khi chuyển sang thanh toán ──
        try {
            setIsLocking(true);
            await bookingApi.lockSlots({
                court_id: court._id || court.id,
                sub_court_id: sub._id,
                date: selectedDate,
                start_time: startTime,
                end_time: endTime,
            });
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || "Không thể giữ chỗ. Khung giờ có thể đã được đặt.";
            Alert.alert("Lỗi", msg);
            // Refresh lại slots
            bookingApi.getCourtSlots(courtId, selectedDate)
                .then(res => setSlotsData(res.data || []))
                .catch(() => {});
            setSelectedSlotIndices([]);
            setIsLocking(false);
            return;
        } finally {
            setIsLocking(false);
        }

        // ── Bước 2: Lưu thông tin vào Redux và chuyển sang Thanh toán ──
        dispatch(setCheckoutDraft({
            courtId: court._id || court.id,
            courtName: court.name,
            subCourtId: sub._id,
            subCourtName: sub.name,
            date: selectedDate,
            startTime,
            endTime,
            totalPrice: price
        }));

        navigation.navigate("Thanh toán");
    };

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
                    <TouchableOpacity 
                        onPress={() => {
                            const d = new Date(selectedDate + 'T00:00:00');
                            d.setDate(d.getDate() - 1);
                            const todayStr = formatLocalYYYYMMDD(new Date());
                            const newDateStr = formatLocalYYYYMMDD(d);
                            if (newDateStr >= todayStr) setSelectedDate(newDateStr);
                        }}
                        className="h-8 w-8 items-center justify-center rounded-lg border border-appText/10 bg-appSurface">
                        <Ionicons name="chevron-back" size={16} color={iconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowCalendar(true)} className="flex-row items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                        <Ionicons name="calendar-outline" size={16} color="#059669" />
                        <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{new Date(selectedDate + 'T00:00:00').toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => {
                            const d = new Date(selectedDate + 'T00:00:00');
                            d.setDate(d.getDate() + 1);
                            setSelectedDate(formatLocalYYYYMMDD(d));
                        }}
                        className="h-8 w-8 items-center justify-center rounded-lg border border-appText/10 bg-appSurface">
                        <Ionicons name="chevron-forward" size={16} color={iconColor} />
                    </TouchableOpacity>
                </View>

                {/* Calendar Modal */}
                <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setShowCalendar(false)} className="flex-1 bg-black/50 justify-center items-center px-6">
                        <TouchableOpacity activeOpacity={1} className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full">
                            {(() => {
                                const current = new Date(selectedDate + 'T00:00:00');
                                const year = current.getFullYear();
                                const month = current.getMonth();
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const firstDay = new Date(year, month, 1).getDay();
                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                const days = [];
                                for (let i = 0; i < firstDay; i++) days.push(null);
                                for (let i = 1; i <= daysInMonth; i++) days.push(i);
                                const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
                                return (
                                    <>
                                        <View className="flex-row items-center justify-between mb-4">
                                            <TouchableOpacity onPress={() => {
                                                const prev = new Date(year, month - 1, 1);
                                                setSelectedDate(formatLocalYYYYMMDD(prev));
                                            }}>
                                                <Ionicons name="chevron-back" size={22} color={isDark ? '#fff' : '#333'} />
                                            </TouchableOpacity>
                                            <Text className="text-base font-bold text-appText">{monthNames[month]} {year}</Text>
                                            <TouchableOpacity onPress={() => {
                                                const next = new Date(year, month + 1, 1);
                                                setSelectedDate(formatLocalYYYYMMDD(next));
                                            }}>
                                                <Ionicons name="chevron-forward" size={22} color={isDark ? '#fff' : '#333'} />
                                            </TouchableOpacity>
                                        </View>
                                        <View className="flex-row justify-between mb-2">
                                            {['CN','T2','T3','T4','T5','T6','T7'].map(d => (
                                                <Text key={d} className="w-[14%] text-center text-xs font-bold text-appText/50">{d}</Text>
                                            ))}
                                        </View>
                                        <View className="flex-row flex-wrap">
                                            {days.map((day, idx) => {
                                                if (day === null) return <View key={`e${idx}`} style={{width:'14.28%',height:40}} />;
                                                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                                const dateObj = new Date(dateStr + 'T00:00:00');
                                                const isPast = dateObj < today;
                                                const isSelected = dateStr === selectedDate;
                                                const isToday = dateStr === today.toISOString().split('T')[0];
                                                return (
                                                    <TouchableOpacity
                                                        key={day}
                                                        disabled={isPast}
                                                        onPress={() => { setSelectedDate(dateStr); setShowCalendar(false); }}
                                                        style={{width:'14.28%',height:40,alignItems:'center',justifyContent:'center'}}
                                                    >
                                                        <View className={`h-8 w-8 rounded-full items-center justify-center ${isSelected ? 'bg-emerald-600' : isToday ? 'border border-emerald-500' : ''}`}>
                                                            <Text className={`text-sm font-semibold ${isPast ? 'text-appText/20' : isSelected ? 'text-white' : 'text-appText'}`}>{day}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </>
                                );
                            })()}
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>

                {/* Danh sách sân con & Lịch (Time Slots) */}
                <View className="mt-4 px-4 gap-3">
                    {isFetchingSlots ? (
                        <ActivityIndicator size="small" color="#059669" />
                    ) : (
                        subCourts.map((sub, idx) => {
                            const slots = getSlotsForSubCourt(sub._id);

                            return (
                                <View key={sub._id || idx} className="rounded-xl border border-appText/10 bg-appSurface p-3 flex-row items-center shadow-sm shadow-black/5">
                                    <Text className="w-14 text-sm font-bold text-appText">{sub.name}</Text>
                                    
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
                                        {slots.length === 0 ? (
                                            <Text className="text-xs text-appText/50 italic">Không có lịch</Text>
                                        ) : (
                                            slots.map((slot, sIdx) => {
                                                const isAvailable = slot.status === "available";
                                                const isLocked = slot.status === "locked";
                                                const isBooked = slot.status === "booked";
                                                const isSelected = selectedSubCourt === sub._id && selectedSlotIndices.includes(sIdx);
                                                
                                                let bgColor = "bg-red-100 dark:bg-red-900/30";
                                                let textColor = "text-red-500 dark:text-red-400";
                                                let subTextColor = "text-red-400 dark:text-red-500";
                                                let label = "Đã đặt";
                                                
                                                if (isLocked) {
                                                    bgColor = "bg-amber-100 dark:bg-amber-900/30";
                                                    textColor = "text-amber-600 dark:text-amber-400";
                                                    subTextColor = "text-amber-500 dark:text-amber-500";
                                                    label = "Đang giữ";
                                                } else if (isAvailable) {
                                                    bgColor = isSelected ? "bg-emerald-700" : "bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800";
                                                    textColor = isSelected ? "text-white" : "text-emerald-700 dark:text-emerald-400";
                                                    subTextColor = isSelected ? "text-emerald-100" : "text-emerald-600/70 dark:text-emerald-500/70";
                                                    label = "Trống";
                                                }

                                                return (
                                                    <TouchableOpacity 
                                                        key={sIdx}
                                                        onPress={() => handleSlotClick(sub._id, sIdx, slot)}
                                                        activeOpacity={isAvailable ? 0.7 : 1}
                                                        className={`items-center justify-center rounded-lg px-3 py-1.5 min-w-[64px] ${bgColor}`}
                                                    >
                                                        <Text className={`text-xs font-bold ${textColor}`}>{slot.start}</Text>
                                                        <Text className={`text-[9px] ${subTextColor}`}>{label}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        )}
                                    </ScrollView>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Bottom Sticky Bar */}
            <View className="absolute bottom-0 left-0 right-0 border-t border-appText/10 bg-appSurface px-5 py-4 flex-row items-center justify-between shadow-lg shadow-black/20" style={{ paddingBottom: 24 }}>
                <View>
                    <Text className="text-xs font-medium text-appText/60">
                        {selectedSlotIndices.length > 0 ? `${selectedSlotIndices.length} slot đã chọn` : `Giờ hoạt động: ${court.open_time || "06:00"} - ${court.close_time || "22:00"}`}
                    </Text>
                    <Text className="mt-1 text-xs font-medium text-appText/60">
                        Giá: <Text className="text-sm font-bold text-emerald-600">
                            {selectedSlotIndices.length > 0 
                                ? formatPrice((subCourts.find(s => s._id === selectedSubCourt)?.price_per_hour || minPrice) / 2 * selectedSlotIndices.length)
                                : formatPrice(minPrice) + "/h"}
                        </Text>
                    </Text>
                </View>
                <TouchableOpacity 
                    onPress={handleBookNow}
                    className={`rounded-xl px-8 py-3.5 shadow-md flex-row items-center gap-2 ${selectedSlotIndices.length > 0 && !isLocking ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-appText/20'}`}
                    disabled={selectedSlotIndices.length === 0 || isLocking}
                >
                    {isLocking ? <ActivityIndicator size="small" color="white" /> : null}
                    <Text className="text-sm font-bold text-white text-center">{isLocking ? "Đang giữ chỗ..." : "Đặt sân ngay"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
