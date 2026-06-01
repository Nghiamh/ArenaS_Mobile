import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const courtImages = [
    "https://images.unsplash.com/photo-1622228514120-e7a9b708b7d4?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554068865-24cecd4e34f8?q=80&w=1000&auto=format&fit=crop"
];

export default function CourtDetailScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const navigation = useNavigation();
    const [activeIndex, setActiveIndex] = useState(0);

    const onScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveIndex(Math.round(index));
    };

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
                            <Text className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400">CẦU LÔNG</Text>
                        </View>
                        <View className="flex-row items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-900/30">
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text className="text-[11px] font-bold text-amber-600 dark:text-amber-400">4.9</Text>
                        </View>
                    </View>
                    <Text className="mt-3 text-2xl font-bold text-appText">ArenaS Premium Court B1</Text>
                    <View className="mt-2 flex-row items-start gap-1">
                        <Ionicons name="location-outline" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className="flex-1 text-sm text-appText/60">123 Đường Song Hành, Quận 2, TP. Hồ Chí Minh</Text>
                    </View>
                </View>

                {/* Tiện ích (Amenities) */}
                <View className="mt-8 px-4">
                    <Text className="text-lg font-bold text-appText">Tiện ích</Text>
                    <View className="mt-4 flex-row justify-between px-2">
                        <View className="items-center">
                            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-appSurface border border-appText/10 shadow-sm shadow-black/5">
                                <Text className="text-2xl font-bold text-emerald-600">P</Text>
                            </View>
                            <Text className="mt-2 text-[11px] text-appText/70">Gửi xe</Text>
                        </View>
                        <View className="items-center">
                            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-appSurface border border-appText/10 shadow-sm shadow-black/5">
                                <MaterialCommunityIcons name="cup-water" size={26} color="#059669" />
                            </View>
                            <Text className="mt-2 text-[11px] text-appText/70">Nước uống</Text>
                        </View>
                        <View className="items-center">
                            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-appSurface border border-appText/10 shadow-sm shadow-black/5">
                                <MaterialCommunityIcons name="locker" size={24} color="#059669" />
                            </View>
                            <Text className="mt-2 text-[11px] text-appText/70">Tủ đồ</Text>
                        </View>
                        <View className="items-center">
                            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-appSurface border border-appText/10 shadow-sm shadow-black/5">
                                <MaterialCommunityIcons name="shower" size={26} color="#059669" />
                            </View>
                            <Text className="mt-2 text-[11px] text-appText/70">Phòng tắm</Text>
                        </View>
                    </View>
                </View>

                {/* Bảng giá & Giờ trống */}
                <View className="mt-8 px-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-appText">Bảng giá & Giờ trống</Text>
                        <TouchableOpacity className="flex-row items-center gap-1">
                            <Text className="text-xs font-bold text-emerald-600">Thứ 2, 24 Thg 6</Text>
                            <Ionicons name="chevron-down" size={14} color="#059669" />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-4 gap-3">
                        {/* Card 1 */}
                        <TouchableOpacity className="overflow-hidden rounded-2xl bg-appSurface border border-appText/10 p-4 shadow-sm shadow-black/5">
                            <View className="absolute bottom-0 left-0 top-0 w-1.5 bg-emerald-600" />
                            <View className="flex-row items-center justify-between pl-3">
                                <View>
                                    <Text className="text-sm font-bold text-appText">05:00 - 08:00</Text>
                                    <Text className="mt-1 text-[11px] text-appText/60">Khung giờ sáng sớm</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-base font-bold text-emerald-600">80.000đ</Text>
                                    <Text className="text-[10px] font-medium text-appText/50">/Giờ</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Card 2 */}
                        <TouchableOpacity className="overflow-hidden rounded-2xl bg-appSurface border border-appText/10 p-4 shadow-sm shadow-black/5">
                            <View className="absolute bottom-0 left-0 top-0 w-1.5 bg-emerald-600" />
                            <View className="flex-row items-center justify-between pl-3">
                                <View>
                                    <Text className="text-sm font-bold text-appText">08:00 - 16:00</Text>
                                    <Text className="mt-1 text-[11px] text-appText/60">Giờ hành chính</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-base font-bold text-emerald-600">120.000đ</Text>
                                    <Text className="text-[10px] font-medium text-appText/50">/Giờ</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Card 3 (Hết sân) */}
                        <View className="overflow-hidden rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900 p-4 opacity-70">
                            <View className="absolute bottom-0 left-0 top-0 w-1.5 bg-emerald-600" />
                            <View className="flex-row items-center justify-between pl-3">
                                <View>
                                    <Text className="text-sm font-bold text-appText">17:00 - 22:00</Text>
                                    <Text className="mt-1 text-[11px] text-appText/60">Giờ cao điểm (Hết sân)</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-base font-bold text-emerald-600">180.000đ</Text>
                                    <View className="mt-1 rounded bg-red-600 px-1.5 py-0.5">
                                        <Text className="text-[9px] font-bold text-white">HẾT SÂN</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Giới thiệu */}
                <View className="mt-8 px-4">
                    <Text className="text-lg font-bold text-appText">Giới thiệu</Text>
                    <Text className="mt-2 text-sm text-appText/70 leading-relaxed">
                        ArenaS Premium Court tự hào mang đến không gian thi đấu cầu lông đẳng cấp quốc tế. Hệ thống thảm Yonex dày 5mm, độ bám cực tốt, giảm chấn tối ưu bảo vệ xương khớp cho vận động viên. Hệ thống đèn LED chống chói chuẩn thi đấu.
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Sticky Bar */}
            <View className="absolute bottom-0 left-0 right-0 border-t border-appText/10 bg-appSurface px-5 py-4 shadow-lg shadow-black/20" style={{ paddingBottom: 24 }}>
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-[10px] font-bold tracking-wider text-appText/50 uppercase">TỔNG CỘNG</Text>
                        <View className="flex-row items-end gap-1 mt-0.5">
                            <Text className="text-2xl font-black text-appText">120.000đ</Text>
                            <Text className="mb-1 text-xs font-bold text-appText/50">/ 1h</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("Thanh toán")}
                        className="rounded-xl bg-emerald-700 px-8 py-3.5 shadow-md shadow-emerald-900/20"
                    >
                        <Text className="text-base font-bold text-white text-center">Tiếp tục đặt{"\n"}sân</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
