import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { logout, fetchUserProfile } from "../../auth/authSlice";
import { removeItem } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../constants/config";
import bookingApi from "../../../api/bookingApi";
import React from "react";

export default function ProfileScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const iconColor = isDark ? "#FFFFFF" : "#000000";
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const { user, isGuest } = useSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [bookingFilter, setBookingFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Fetch user profile when entering the screen
    useFocusEffect(
        React.useCallback(() => {
            if (!isGuest && user?.id !== "guest") {
                setIsLoading(true);
                dispatch(fetchUserProfile()).finally(() => setIsLoading(false));
                setIsLoadingBookings(true);
                bookingApi.getMyBookings()
                    .then(res => setBookings(res.data?.bookings || res.data || []))
                    .catch(() => setBookings([]))
                    .finally(() => setIsLoadingBookings(false));
            }
        }, [dispatch, isGuest])
    );

    const todayObj = new Date();
    const year = todayObj.getFullYear();
    const month = String(todayObj.getMonth() + 1).padStart(2, '0');
    const day = String(todayObj.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const tenDaysAgoObj = new Date();
    tenDaysAgoObj.setDate(todayObj.getDate() - 10);
    const tenYear = tenDaysAgoObj.getFullYear();
    const tenMonth = String(tenDaysAgoObj.getMonth() + 1).padStart(2, '0');
    const tenDay = String(tenDaysAgoObj.getDate()).padStart(2, '0');
    const tenDaysAgoStr = `${tenYear}-${tenMonth}-${tenDay}`;

    const processedBookings = bookings
        .filter(b => b.date >= tenDaysAgoStr)
        .map(b => {
            let status = b.status;
            if ((status === "confirmed" || status === "pending") && b.date < todayStr) {
                status = "completed";
            }
            return { ...b, displayStatus: status };
        });

    const filteredBookings = bookingFilter === "all" 
        ? processedBookings 
        : processedBookings.filter(b => (b.displayStatus === "confirmed" || b.displayStatus === "pending") && b.date >= todayStr);
    
    const formatPrice = (p) => (p || 0).toLocaleString("vi-VN") + "đ";

    const handleCancelBooking = (booking) => {
        const startDateTime = new Date(`${booking.date}T${booking.start_time || booking.startTime}:00`);
        const now = new Date();
        const hoursDifference = (startDateTime - now) / (1000 * 60 * 60);

        if (hoursDifference < 1) {
            Alert.alert("Không thể hủy", "Bạn không thể hủy sân khi chỉ còn chưa tới 1 tiếng trước giờ đá.");
            return;
        }

        let message = "Bạn có chắc chắn muốn hủy sân này?";
        if (hoursDifference >= 3) {
            message += "\nBạn sẽ được hoàn 100% tiền vào ví.";
        } else {
            message += "\nLưu ý: Bạn hủy sát giờ (dưới 3 tiếng). Bạn sẽ chỉ được hoàn 50% tiền vào ví. 50% còn lại sẽ được trả cho Chủ sân.";
        }

        Alert.alert("Hủy đặt sân", message, [
            { text: "Không", style: "cancel" },
            { 
                text: "Xác nhận hủy", 
                style: "destructive",
                onPress: async () => {
                    try {
                        setIsLoadingBookings(true);
                        await bookingApi.cancelBooking(booking._id || booking.id);
                        Alert.alert("Thành công", "Đã hủy sân thành công và hoàn tiền vào ví.");
                        // Refresh data
                        const res = await bookingApi.getMyBookings();
                        setBookings(res.data?.bookings || res.data || []);
                    } catch (error) {
                        const errorMsg = error.response?.data?.error || error.response?.data?.message || "Có lỗi xảy ra khi hủy sân.";
                        Alert.alert("Lỗi", errorMsg);
                    } finally {
                        setIsLoadingBookings(false);
                    }
                }
            }
        ]);
    };

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
        <>
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
                    <Text className="mt-1 text-lg font-bold text-emerald-600">{user.points ?? 0} pts</Text>
                </View>
                <View className="flex-1 items-center">
                    <Text className="text-xs font-medium text-appText/60">ĐÃ ĐẶT SÂN</Text>
                    <Text className="mt-1 text-lg font-bold text-appText">{bookings.length} buổi</Text>
                </View>
            </View>

            {/* Bookings Section */}
            <View className="mt-8 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-appText">Đơn đặt của tôi</Text>
                <View className="flex-row gap-2">
                    {[{key:'all',label:'Tất cả'},{key:'upcoming',label:'Sắp tới'}].map(f => (
                        <TouchableOpacity key={f.key} onPress={() => setBookingFilter(f.key)}
                            className={`rounded-full px-4 py-1.5 ${bookingFilter === f.key ? 'bg-emerald-700' : 'bg-appSurface border border-appText/10'}`}>
                            <Text className={`text-xs font-semibold ${bookingFilter === f.key ? 'text-white' : 'text-appText/70'}`}>{f.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="mt-4 gap-4">
                {isLoadingBookings ? (
                    <ActivityIndicator size="small" color="#059669" className="my-4" />
                ) : filteredBookings.length === 0 ? (
                    <View className="items-center py-8 rounded-2xl bg-appSurface border border-appText/10 shadow-sm shadow-black/5">
                        <Ionicons name="calendar-outline" size={40} color={isDark ? "#475569" : "#94A3B8"} />
                        <Text className="mt-2 text-sm text-appText/60">Chưa có đơn đặt sân nào</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Trang chủ")} className="mt-4 rounded-full bg-emerald-100 px-6 py-2 dark:bg-emerald-900/30">
                            <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Đặt sân ngay</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filteredBookings.slice(0, 5).map(b => {
                        const statusMap = { confirmed:'Đã xác nhận', pending:'Chờ xử lý', cancelled:'Đã hủy', completed:'Hoàn thành' };
                        const statusColor = { confirmed:'text-emerald-600', pending:'text-amber-600', cancelled:'text-red-500', completed:'text-blue-600' };
                        const bgColor = { confirmed:'bg-emerald-100 dark:bg-emerald-900/30', pending:'bg-amber-100 dark:bg-amber-900/30', cancelled:'bg-red-100 dark:bg-red-900/30', completed:'bg-blue-100 dark:bg-blue-900/30' };
                        return (
                            <TouchableOpacity 
                                key={b._id || b.id} 
                                onPress={() => setSelectedBooking(b)}
                                activeOpacity={0.7}
                                className="rounded-2xl bg-appSurface p-4 border border-appText/10 shadow-sm shadow-black/5"
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-sm font-bold text-appText" numberOfLines={1}>{b.court_name || b.courtName || 'Sân'}</Text>
                                    <View className={`px-2.5 py-0.5 rounded-full ${bgColor[b.displayStatus] || 'bg-slate-100'}`}>
                                        <Text className={`text-[10px] font-bold ${statusColor[b.displayStatus] || 'text-appText'}`}>{statusMap[b.displayStatus] || b.displayStatus}</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center gap-1.5 mb-1">
                                    <Ionicons name="football-outline" size={14} color="#059669" />
                                    <Text className="text-xs text-appText/60">{b.sub_court_name || b.subCourtName || ''}</Text>
                                </View>
                                <View className="flex-row items-center gap-1.5 mb-1">
                                    <Ionicons name="calendar-outline" size={14} color="#059669" />
                                    <Text className="text-xs text-appText/60">{b.date ? new Date(b.date).toLocaleDateString('vi-VN') : ''}</Text>
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-1.5">
                                        <Ionicons name="time-outline" size={14} color="#059669" />
                                        <Text className="text-xs text-appText/60">{b.start_time || b.startTime} - {b.end_time || b.endTime}</Text>
                                    </View>
                                    <Text className="text-sm font-bold text-emerald-600">{formatPrice(b.total_price || b.totalPrice)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
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

        {/* Booking Detail Modal */}
        <Modal visible={!!selectedBooking} transparent animationType="slide" onRequestClose={() => setSelectedBooking(null)}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white dark:bg-appBg rounded-t-3xl pt-5 pb-8 px-5">
                    {selectedBooking && (() => {
                        const b = selectedBooking;
                        const statusMap = { confirmed:'Đã xác nhận', pending:'Chờ xử lý', cancelled:'Đã hủy', completed:'Hoàn thành' };
                        const statusColor = { confirmed:'text-emerald-600', pending:'text-amber-600', cancelled:'text-red-500', completed:'text-blue-600' };
                        const bgColor = { confirmed:'bg-emerald-100 dark:bg-emerald-900/30', pending:'bg-amber-100 dark:bg-amber-900/30', cancelled:'bg-red-100 dark:bg-red-900/30', completed:'bg-blue-100 dark:bg-blue-900/30' };
                        const canCancel = b.displayStatus === "confirmed" || b.displayStatus === "pending" || b.displayStatus === "waiting_opponent";

                        return (
                            <>
                                <View className="flex-row items-center justify-between mb-5">
                                    <Text className="text-lg font-bold text-appText">Chi tiết đơn đặt</Text>
                                    <TouchableOpacity onPress={() => setSelectedBooking(null)} className="h-8 w-8 items-center justify-center rounded-full bg-appSurface">
                                        <Ionicons name="close" size={20} color={isDark ? "#fff" : "#000"} />
                                    </TouchableOpacity>
                                </View>

                                <View className="rounded-2xl bg-appSurface p-4 border border-appText/10 shadow-sm shadow-black/5 mb-5">
                                    <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-appText/5">
                                        <Text className="text-base font-bold text-appText">{b.court_name || b.courtName}</Text>
                                        <View className={`px-3 py-1 rounded-full ${bgColor[b.displayStatus] || 'bg-slate-100'}`}>
                                            <Text className={`text-xs font-bold ${statusColor[b.displayStatus] || 'text-appText'}`}>{statusMap[b.displayStatus] || b.displayStatus}</Text>
                                        </View>
                                    </View>
                                    
                                    <View className="gap-3">
                                        <View className="flex-row justify-between">
                                            <Text className="text-sm text-appText/60">Loại sân</Text>
                                            <Text className="text-sm font-semibold text-appText">{b.sub_court_name || b.subCourtName}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-sm text-appText/60">Ngày đặt</Text>
                                            <Text className="text-sm font-semibold text-appText">{b.date ? new Date(b.date).toLocaleDateString('vi-VN') : ''}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-sm text-appText/60">Giờ đặt</Text>
                                            <Text className="text-sm font-semibold text-appText">{b.start_time || b.startTime} - {b.end_time || b.endTime}</Text>
                                        </View>
                                        {b.voucher_code ? (
                                            <View className="flex-row justify-between">
                                                <Text className="text-sm text-emerald-600">Voucher</Text>
                                                <Text className="text-sm font-semibold text-emerald-600">{b.voucher_code}</Text>
                                            </View>
                                        ) : null}
                                        <View className="h-px bg-appText/5 my-1" />
                                        <View className="flex-row justify-between">
                                            <Text className="text-sm font-bold text-appText">Tổng tiền</Text>
                                            <Text className="text-base font-bold text-emerald-600">{formatPrice(b.total_price || b.totalPrice)}</Text>
                                        </View>
                                    </View>
                                </View>

                                {canCancel ? (
                                    <TouchableOpacity 
                                        onPress={() => {
                                            const bookingToCancel = selectedBooking;
                                            setSelectedBooking(null);
                                            handleCancelBooking(bookingToCancel);
                                        }}
                                        className="w-full rounded-xl bg-red-100 dark:bg-red-900/30 py-3.5 border border-red-200 dark:border-red-800"
                                    >
                                        <Text className="text-sm font-bold text-center text-red-600 dark:text-red-400">Hủy đặt sân</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity 
                                        onPress={() => setSelectedBooking(null)}
                                        className="w-full rounded-xl bg-emerald-600 py-3.5 shadow-md shadow-emerald-900/20"
                                    >
                                        <Text className="text-sm font-bold text-center text-white">Đóng</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        );
                    })()}
                </View>
            </View>
        </Modal>
        </>
    );
}
