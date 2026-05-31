import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#FFFFFF" : "#000000";
    const navigation = useNavigation();

    return (
        <ScrollView className="flex-1 bg-appBg" contentContainerClassName="px-4 pt-12 pb-10">
            {/* Header */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={24} color="#059669" />
                    <Text className="text-2xl font-bold text-emerald-600">ArenaS</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => Alert.alert("Thông báo", "Bạn không có thông báo mới.")}
                    className="h-10 w-10 items-center justify-center rounded-full bg-appSurface border border-appText/10"
                >
                    <Ionicons name="notifications-outline" size={20} color={iconColor} />
                </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View className="mt-6 flex-row items-center">
                <View className="relative">
                    <Image 
                        source={{ uri: "https://i.pravatar.cc/150?img=11" }} 
                        className="h-16 w-16 rounded-full"
                    />
                    <View className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-0.5 border-2 border-appBg">
                        <MaterialCommunityIcons name="check-decagram" size={14} color="white" />
                    </View>
                </View>
                <View className="ml-4 flex-1">
                    <Text className="text-xl font-bold text-appText">Nguyễn Minh Quân</Text>
                    <Text className="text-sm text-appText/60">Hội viên Vàng • ID: #AS2024</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => Alert.alert("Cài đặt", "Chuyển đến trang cài đặt tài khoản.")}
                    className="h-10 w-10 items-center justify-center rounded-xl bg-appSurface border border-appText/10"
                >
                    <Ionicons name="settings-outline" size={20} color={iconColor} />
                </TouchableOpacity>
            </View>

            {/* Stats Card */}
            <View className="mt-6 flex-row rounded-2xl bg-appSurface p-4 border border-appText/10 shadow-sm shadow-black/5">
                <View className="flex-1 items-center border-r border-appText/10">
                    <Text className="text-xs font-medium text-appText/60">ĐIỂM TÍCH LŨY</Text>
                    <Text className="mt-1 text-lg font-bold text-emerald-600">2,450 pts</Text>
                </View>
                <View className="flex-1 items-center">
                    <Text className="text-xs font-medium text-appText/60">ĐÃ ĐẶT SÂN</Text>
                    <Text className="mt-1 text-lg font-bold text-appText">18 buổi</Text>
                </View>
            </View>

            {/* Bookings Section */}
            <View className="mt-8 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-appText">Đơn đặt của tôi</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity 
                        onPress={() => Alert.alert("Đơn đặt", "Hiển thị tất cả đơn đặt")}
                        className="rounded-full bg-emerald-700 px-4 py-1.5"
                    >
                        <Text className="text-xs font-semibold text-white">Tất cả</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => Alert.alert("Đơn đặt", "Hiển thị đơn đặt sắp tới")}
                        className="rounded-full bg-appSurface border border-appText/10 px-4 py-1.5"
                    >
                        <Text className="text-xs font-semibold text-appText/70">Sắp tới</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bookings List */}
            <View className="mt-4 gap-4">
                {/* Upcoming */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate("Đặt lịch")}
                    activeOpacity={0.8}
                    className="overflow-hidden rounded-2xl bg-appSurface border border-appText/10 shadow-sm shadow-black/5"
                >
                    <View className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                    <View className="p-4 pl-5">
                        <View className="flex-row justify-between">
                            <View className="flex-row gap-3">
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                                    <MaterialCommunityIcons name="soccer" size={20} color="#059669" />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-appText">Sân bóng Đại học Y</Text>
                                    <Text className="text-xs text-appText/60">Sân 7 • Khu A</Text>
                                </View>
                            </View>
                            <View className="rounded bg-emerald-500/10 px-2 py-1 self-start">
                                <Text className="text-[10px] font-bold text-emerald-600">SẮP TỚI</Text>
                            </View>
                        </View>
                        <View className="mt-4 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-4">
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="calendar-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                    <Text className="text-xs text-appText/70">15/05/2024</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="time-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                    <Text className="text-xs text-appText/70">18:00 - 19:30</Text>
                                </View>
                            </View>
                            <Text className="text-base font-bold text-emerald-600">250k</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Completed */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate("Đặt lịch")}
                    activeOpacity={0.8}
                    className="rounded-2xl bg-appSurface p-4 border border-appText/10 shadow-sm shadow-black/5"
                >
                    <View className="flex-row justify-between">
                        <View className="flex-row gap-3">
                            <View className="h-10 w-10 items-center justify-center rounded-full bg-appText/5">
                                <MaterialCommunityIcons name="tennis" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-appText">Tennis Phú Thọ</Text>
                                <Text className="text-xs text-appText/60">Sân ngoài trời 03</Text>
                            </View>
                        </View>
                        <View className="rounded bg-appText/5 px-2 py-1 self-start">
                            <Text className="text-[10px] font-bold text-appText/60">HOÀN THÀNH</Text>
                        </View>
                    </View>
                    <View className="mt-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-4">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="calendar-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className="text-xs text-appText/70">12/05/2024</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="time-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className="text-xs text-appText/70">08:00 - 09:00</Text>
                            </View>
                        </View>
                        <Text className="text-base font-bold text-appText">150k</Text>
                    </View>
                </TouchableOpacity>

                {/* Cancelled */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate("Đặt lịch")}
                    activeOpacity={0.8}
                    className="rounded-2xl bg-appSurface p-4 border border-appText/10 shadow-sm shadow-black/5"
                >
                    <View className="flex-row justify-between">
                        <View className="flex-row gap-3">
                            <View className="h-10 w-10 items-center justify-center rounded-full bg-appText/5">
                                <MaterialCommunityIcons name="badminton" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-appText/70">Cầu lông Bình Thạnh</Text>
                                <Text className="text-xs text-appText/50">Sân tập 02</Text>
                            </View>
                        </View>
                        <View className="rounded bg-red-500/10 px-2 py-1 self-start">
                            <Text className="text-[10px] font-bold text-red-500">ĐÃ HỦY</Text>
                        </View>
                    </View>
                    <View className="mt-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-4">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="calendar-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className="text-xs text-appText/50">10/05/2024</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate("Sân đấu")}>
                            <Text className="text-sm font-semibold text-emerald-600">Đặt lại</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View className="mt-6 flex-row gap-4">
                <TouchableOpacity 
                    onPress={() => Alert.alert("Hỗ trợ", "Liên hệ tổng đài 1900 xxxx")}
                    className="flex-1 items-center justify-center rounded-2xl bg-appSurface py-5 border border-appText/10 shadow-sm shadow-black/5"
                >
                    <Ionicons name="headset-outline" size={24} color="#059669" />
                    <Text className="mt-2 text-sm font-medium text-appText">Hỗ trợ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => Alert.alert("Ví tiền", "Số dư hiện tại: 0đ")}
                    className="flex-1 items-center justify-center rounded-2xl bg-appSurface py-5 border border-appText/10 shadow-sm shadow-black/5"
                >
                    <Ionicons name="wallet-outline" size={24} color="#059669" />
                    <Text className="mt-2 text-sm font-medium text-appText">Ví tiền</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
