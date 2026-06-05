import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

export default function WalletScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const navigation = useNavigation();

    // Dữ liệu mẫu (sau này lấy từ Redux hoặc API)
    const balance = 0;
    const transactions = [
        { id: "1", type: "deposit", amount: 150000, date: "2024-05-10", note: "Nạp tiền vào ví" },
        { id: "2", type: "withdraw", amount: -50000, date: "2024-05-12", note: "Thanh toán đặt sân" },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    return (
        <View className="flex-1 bg-appBg">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-emerald-600">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-white">Ví của tôi</Text>
                <View className="w-10" /> {/* Spacer */}
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {/* Balance Card */}
                <View className="rounded-2xl bg-emerald-600 p-6 shadow-md shadow-emerald-900/20 items-center justify-center relative overflow-hidden">
                    <View className="absolute top-[-20px] right-[-20px] opacity-10">
                        <Ionicons name="wallet" size={120} color="#FFFFFF" />
                    </View>
                    <Text className="text-emerald-50 font-medium text-sm mb-2">Số dư hiện tại</Text>
                    <Text className="text-white font-bold text-4xl tracking-tight">
                        {formatCurrency(balance)}
                    </Text>

                    {/* Action Buttons */}
                    <View className="flex-row items-center justify-center mt-8 gap-6 w-full">
                        <TouchableOpacity
                            onPress={() => Alert.alert("Nạp tiền", "Tính năng nạp tiền đang được phát triển.")}
                            className="items-center"
                        >
                            <View className="h-12 w-12 rounded-full bg-white/20 items-center justify-center mb-2">
                                <Ionicons name="arrow-down-outline" size={24} color="#FFFFFF" />
                            </View>
                            <Text className="text-white text-xs font-medium">Nạp tiền</Text>
                        </TouchableOpacity>



                        <TouchableOpacity
                            onPress={() => Alert.alert("Lịch sử", "Đang tải dữ liệu...")}
                            className="items-center"
                        >
                            <View className="h-12 w-12 rounded-full bg-white/20 items-center justify-center mb-2">
                                <MaterialCommunityIcons name="history" size={24} color="#FFFFFF" />
                            </View>
                            <Text className="text-white text-xs font-medium">Lịch sử</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Transaction History */}
                <View className="mt-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-appText">Giao dịch gần đây</Text>
                        <TouchableOpacity>
                            <Text className="text-emerald-600 text-sm font-semibold">Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <View
                                key={tx.id}
                                className="flex-row items-center justify-between p-4 mb-3 rounded-2xl bg-appSurface border border-appText/5 shadow-sm shadow-black/5"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className={`h-10 w-10 rounded-full items-center justify-center ${tx.amount > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                        <Ionicons
                                            name={tx.amount > 0 ? "arrow-down" : "arrow-up"}
                                            size={20}
                                            color={tx.amount > 0 ? "#10B981" : "#EF4444"}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-appText font-medium text-base">{tx.note}</Text>
                                        <Text className="text-appText/50 text-xs mt-0.5">{tx.date}</Text>
                                    </View>
                                </View>
                                <Text className={`font-bold text-base ${tx.amount > 0 ? 'text-emerald-600' : 'text-appText'}`}>
                                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View className="items-center justify-center py-10 bg-appSurface rounded-2xl border border-appText/5 border-dashed">
                            <Ionicons name="receipt-outline" size={48} color={isDark ? "#475569" : "#CBD5E1"} />
                            <Text className="text-appText/50 mt-2 text-sm">Chưa có giao dịch nào</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
