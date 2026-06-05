import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { logout, fetchUserProfile } from "../../auth/authSlice";
import { removeItem } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../constants/config";
import React from "react";

export default function ProfileScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#FFFFFF" : "#000000";
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const { user, isGuest } = useSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch user profile when entering the screen
    useFocusEffect(
        React.useCallback(() => {
            if (!isGuest && user?.id !== "guest") {
                setIsLoading(true);
                dispatch(fetchUserProfile()).finally(() => {
                    setIsLoading(false);
                });
            }
        }, [dispatch, isGuest])
    );

    const handleLogout = async () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đăng xuất",
                    style: "destructive",
                    onPress: async () => {
                        await removeItem(STORAGE_KEYS.authToken);
                        await removeItem(STORAGE_KEYS.guestMode);
                        await removeItem("user");
                        dispatch(logout());
                        // Có thể cần điều hướng về màn hình đăng nhập nếu app không tự reload
                    }
                }
            ]
        );
    };

    if (isGuest || !user) {
        return (
            <View className="flex-1 bg-appBg items-center justify-center px-6">
                <Ionicons name="person-circle-outline" size={64} color={isDark ? "#475569" : "#94A3B8"} />
                <Text className="mt-4 text-base text-appText/70 text-center">
                    Bạn đang sử dụng ứng dụng với tư cách Khách. Vui lòng đăng nhập để xem hồ sơ và quản lý đặt sân.
                </Text>
                <TouchableOpacity
                    onPress={handleLogout}
                    className="mt-6 rounded-full bg-emerald-600 px-8 py-3"
                >
                    <Text className="text-sm font-bold text-white">Đăng nhập ngay</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const userName = user.name || user.fullName || user.username || "Thành viên";
    const userEmail = user.email || "Chưa cập nhật email";
    const userAvatar = user.avatarUrl || user.avatar || user.profilePicture || "https://i.pravatar.cc/150?img=11";

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
                        source={{ uri: userAvatar }}
                        className="h-16 w-16 rounded-full bg-slate-200"
                    />
                    <View className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-0.5 border-2 border-appBg">
                        <MaterialCommunityIcons name="check-decagram" size={14} color="white" />
                    </View>
                </View>
                <View className="ml-4 flex-1">
                    {isLoading ? (
                        <View className="flex-row items-center gap-2">
                            <ActivityIndicator size="small" color="#059669" />
                            <Text className="text-sm text-appText/60">Đang cập nhật...</Text>
                        </View>
                    ) : (
                        <>
                            <Text className="text-xl font-bold text-appText">{userName}</Text>
                            <Text className="text-sm text-appText/60">{userEmail}</Text>
                        </>
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Chỉnh sửa hồ sơ")}
                    className="h-10 w-10 items-center justify-center rounded-xl bg-appSurface border border-appText/10"
                >
                    <Ionicons name="settings-outline" size={20} color={iconColor} />
                </TouchableOpacity>
            </View>

            {/* Additional Info */}
            {!isLoading && user && (
                <View className="mt-4 rounded-2xl bg-appSurface p-4 border border-appText/10 shadow-sm shadow-black/5">
                    <View className="flex-row items-center justify-between py-2 border-b border-appText/5">
                        <Text className="text-sm font-semibold text-appText/70">Số điện thoại</Text>
                        <Text className="text-sm text-appText">{user.phone || "Chưa cập nhật"}</Text>
                    </View>
                    <View className="flex-row items-center justify-between py-2 border-b border-appText/5">
                        <Text className="text-sm font-semibold text-appText/70">Ngày sinh</Text>
                        <Text className="text-sm text-appText">
                            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between py-2">
                        <Text className="text-sm font-semibold text-appText/70">Địa chỉ</Text>
                        <Text className="text-sm text-appText text-right flex-1 ml-4" numberOfLines={2}>
                            {user.address || "Chưa cập nhật"}
                        </Text>
                    </View>
                </View>
            )}

            {/* Stats Card */}
            <View className="mt-6 flex-row rounded-2xl bg-appSurface p-4 border border-appText/10 shadow-sm shadow-black/5">
                <View className="flex-1 items-center border-r border-appText/10">
                    <Text className="text-xs font-medium text-appText/60">ĐIỂM TÍCH LŨY</Text>
                    <Text className="mt-1 text-lg font-bold text-emerald-600">0 pts</Text>
                </View>
                <View className="flex-1 items-center">
                    <Text className="text-xs font-medium text-appText/60">ĐÃ ĐẶT SÂN</Text>
                    <Text className="mt-1 text-lg font-bold text-appText">0 buổi</Text>
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

            {/* Bookings List (Placeholder) */}
            <View className="mt-4 gap-4">
                <View className="items-center py-8 rounded-2xl bg-appSurface border border-appText/10 shadow-sm shadow-black/5">
                    <Ionicons name="calendar-outline" size={40} color={isDark ? "#475569" : "#94A3B8"} />
                    <Text className="mt-2 text-sm text-appText/60">Chưa có đơn đặt sân nào</Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("Trang chủ")}
                        className="mt-4 rounded-full bg-emerald-100 px-6 py-2 dark:bg-emerald-900/30"
                    >
                        <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Đặt sân ngay</Text>
                    </TouchableOpacity>
                </View>
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
                    onPress={() => navigation.navigate("Ví tiền")}
                    className="flex-1 items-center justify-center rounded-2xl bg-appSurface py-5 border border-appText/10 shadow-sm shadow-black/5"
                >
                    <Ionicons name="wallet-outline" size={24} color="#059669" />
                    <Text className="mt-2 text-sm font-medium text-appText">Ví tiền</Text>
                </TouchableOpacity>
            </View>

            {/* Nút Đăng Xuất */}
            <TouchableOpacity
                onPress={handleLogout}
                className="mt-8 flex-row items-center justify-center rounded-2xl bg-red-100 py-4 dark:bg-red-900/20"
            >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                <Text className="text-base font-bold text-red-500">Đăng xuất tài khoản</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}
