import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

const paymentMethods = [
    {
        id: "card",
        title: "Thẻ tín dụng/ghi nợ",
        subtitle: "Visa, Mastercard, JCB",
        icon: "credit-card-outline",
        iconBg: "bg-blue-100 dark:bg-blue-900/50",
        iconColor: "#059669"
    },
    {
        id: "momo",
        title: "Ví điện tử MoMo",
        subtitle: "Thanh toán nhanh chóng",
        icon: "wallet-outline",
        iconBg: "bg-pink-100 dark:bg-pink-900/50",
        iconColor: "#DB2777"
    },
    {
        id: "zalopay",
        title: "Ví điện tử ZaloPay",
        subtitle: "Ưu đãi giảm giá 10%",
        icon: "cash-multiple",
        iconBg: "bg-sky-100 dark:bg-sky-900/50",
        iconColor: "#0284C7"
    },
    {
        id: "bank",
        title: "Chuyển khoản ngân hàng",
        subtitle: "Tất cả ngân hàng nội địa",
        icon: "bank-outline",
        iconBg: "bg-slate-100 dark:bg-slate-800",
        iconColor: "#475569"
    }
];

export default function PaymentScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const navigation = useNavigation();
    const [selectedMethod, setSelectedMethod] = useState("card");

    return (
        <View className="flex-1 bg-[#F8FAFC] dark:bg-appBg">
            <View className="flex-row items-center justify-between px-4 pb-3 pt-12 bg-white dark:bg-appSurface border-b border-appText/5">
                <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Trang chủ")} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#475569"} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-emerald-700 dark:text-emerald-500">Thanh toán</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerClassName="px-4 pb-32 pt-5" showsVerticalScrollIndicator={false}>
                <Text className="text-base font-bold text-appText mb-3">Tóm tắt đơn hàng</Text>
                <View className="rounded-2xl bg-white dark:bg-appSurface p-4 shadow-sm shadow-black/5 border border-appText/5">
                    <View className="flex-row items-center gap-3 mb-4">
                        <Image 
                            source={{ uri: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=200&auto=format&fit=crop" }} 
                            className="h-14 w-14 rounded-lg"
                        />
                        <View className="flex-1">
                            <Text className="text-base font-bold text-appText">Sân bóng Đại học Y</Text>
                            <View className="flex-row items-center gap-1 mt-0.5">
                                <Ionicons name="location-outline" size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className="text-[11px] text-appText/60">Quận Đống Đa, Hà Nội</Text>
                            </View>
                        </View>
                    </View>

                    <View className="gap-2.5">
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-appText/60">Thời gian</Text>
                            <Text className="text-sm font-bold text-appText">18:00 - 19:30, 25 Th10</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-appText/60">Loại sân</Text>
                            <Text className="text-sm font-bold text-appText">Sân 7 người</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-appText/60">Giá tiền</Text>
                            <Text className="text-sm font-bold text-emerald-600">650.000đ</Text>
                        </View>
                    </View>
                </View>

                <Text className="text-base font-bold text-appText mt-6 mb-3">Phương thức thanh toán</Text>
                <View className="gap-3">
                    {paymentMethods.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                            <TouchableOpacity 
                                key={method.id}
                                onPress={() => setSelectedMethod(method.id)}
                                activeOpacity={0.8}
                                className={`flex-row items-center justify-between rounded-2xl p-4 bg-white dark:bg-appSurface border shadow-sm shadow-black/5 ${
                                    isSelected ? 'border-emerald-600' : 'border-appText/5'
                                }`}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className={`h-10 w-10 items-center justify-center rounded-full ${method.iconBg}`}>
                                        <MaterialCommunityIcons name={method.icon} size={20} color={method.iconColor} />
                                    </View>
                                    <View>
                                        <Text className="text-sm font-bold text-appText">{method.title}</Text>
                                        <Text className="text-[11px] text-appText/50 mt-0.5">{method.subtitle}</Text>
                                    </View>
                                </View>
                                <View className={`h-5 w-5 rounded-full border items-center justify-center ${
                                    isSelected ? 'border-emerald-600' : 'border-appText/30'
                                }`}>
                                    {isSelected ? <View className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> : null}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity 
                    onPress={() => Alert.alert("Mã khuyến mãi", "Tính năng nhập mã đang phát triển")}
                    className="mt-4 flex-row items-center justify-between rounded-2xl bg-white dark:bg-appSurface p-4 border border-appText/5 shadow-sm shadow-black/5"
                >
                    <View className="flex-row items-center gap-2">
                        <MaterialCommunityIcons name="tag-outline" size={20} color="#059669" />
                        <Text className="text-sm font-bold text-appText">Mã khuyến mãi</Text>
                    </View>
                    <Text className="text-sm font-semibold text-emerald-600">Chọn mã</Text>
                </TouchableOpacity>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 border-t border-appText/10 bg-[#F8FAFC] dark:bg-appBg px-5 py-4">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-xs font-semibold text-appText/60">Tổng thanh toán</Text>
                    <Text className="text-xl font-bold text-appText">650.000đ</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => Alert.alert("Thành công", "Thanh toán thành công! Sân đã được đặt.")}
                    className="rounded-xl bg-[#007F3F] dark:bg-emerald-700 py-3.5 shadow-md shadow-emerald-900/20"
                >
                    <Text className="text-base font-bold text-white text-center">THANH TOÁN NGAY</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
