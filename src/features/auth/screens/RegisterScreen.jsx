import React, { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import authApi from "../../../api/authApi";

export default function RegisterScreen() {
    const navigation = useNavigation();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isAgreed, setIsAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
            return;
        }

        if (!isAgreed) {
            Alert.alert("Lỗi", "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
            return;
        }

        try {
            setIsLoading(true);
            const response = await authApi.register({ name: fullName, email, password });
            
            Alert.alert(
                "Thành công", 
                "Đăng ký tài khoản thành công! Vui lòng đăng nhập.",
                [{ text: "OK", onPress: () => navigation.navigate("Login") }]
            );
        } catch (error) {
            console.error("Register error:", error);
            const errorMessage = error?.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại.";
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#F2F7F4]">
            <View className="flex-row items-center justify-between px-5 pt-12 pb-4 bg-[#F2F7F4]">
                <View className="flex-row items-center gap-2">
                    <Image 
                        source={require('../../../../assets/Img/logo.JPG.jpg')}
                        style={{ width: 32, height: 32, borderRadius: 16 }}
                        resizeMode="cover"
                    />
                    <Text className="text-xl font-black text-[#007F3F]">ArenaS</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                    <Ionicons name="close" size={24} color="#475569" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerClassName="flex-grow px-5 pb-10" showsVerticalScrollIndicator={false}>
                <View className="rounded-3xl bg-white p-6 shadow-sm shadow-black/5 mt-2">
                    <View className="items-center mb-6">
                        <Text className="text-2xl font-black text-gray-900">Tạo tài khoản</Text>
                        <Text className="mt-2 text-center text-[13px] text-gray-500 px-4">
                            Tham gia cộng đồng ArenaS để bắt đầu hành trình thể thao của bạn.
                        </Text>
                    </View>

                    <View className="gap-4">
                        <View>
                            <Text className="mb-2 text-[10px] font-bold text-gray-500 uppercase">Họ và tên</Text>
                            <View className="flex-row items-center rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 py-3">
                                <Ionicons name="person-outline" size={18} color="#64748B" />
                                <TextInput 
                                    placeholder="Nguyễn Văn A"
                                    placeholderTextColor="#94A3B8"
                                    className="flex-1 ml-2 text-sm text-gray-800"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="mb-2 text-[10px] font-bold text-gray-500 uppercase">Email / Số điện thoại</Text>
                            <View className="flex-row items-center rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 py-3">
                                <Ionicons name="mail-outline" size={18} color="#64748B" />
                                <TextInput 
                                    placeholder="example@gmail.com"
                                    placeholderTextColor="#94A3B8"
                                    className="flex-1 ml-2 text-sm text-gray-800"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="mb-2 text-[10px] font-bold text-gray-500 uppercase">Mật khẩu</Text>
                            <View className="flex-row items-center rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 py-3">
                                <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                                <TextInput 
                                    placeholder="••••••••"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    className="flex-1 mx-2 text-sm text-gray-800"
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <Ionicons name="eye-outline" size={18} color="#64748B" />
                            </View>
                        </View>

                        <View>
                            <Text className="mb-2 text-[10px] font-bold text-gray-500 uppercase">Xác nhận mật khẩu</Text>
                            <View className="flex-row items-center rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 py-3">
                                <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" />
                                <TextInput 
                                    placeholder="••••••••"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    className="flex-1 ml-2 text-sm text-gray-800"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>

                        <View className="flex-row items-start mt-2 pr-2">
                            <TouchableOpacity className="mt-0.5" onPress={() => setIsAgreed(!isAgreed)}>
                                <Ionicons 
                                    name={isAgreed ? "checkbox" : "square-outline"} 
                                    size={18} 
                                    color={isAgreed ? "#007F3F" : "#94A3B8"} 
                                />
                            </TouchableOpacity>
                            <Text className="ml-2 flex-1 text-[11px] text-gray-500 leading-relaxed">
                                Tôi đồng ý với <Text className="font-bold text-[#007F3F]">Điều khoản dịch vụ</Text> và <Text className="font-bold text-[#007F3F]">Chính sách bảo mật</Text>.
                            </Text>
                        </View>

                        <TouchableOpacity 
                            onPress={handleRegister}
                            disabled={isLoading}
                            className={`mt-4 flex-row rounded-xl py-3.5 shadow-sm items-center justify-center gap-1 ${isLoading ? 'bg-gray-400' : 'bg-[#22C55E] shadow-green-500/30'}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-sm font-bold text-white">Đăng ký</Text>
                                    <Ionicons name="arrow-forward" size={16} color="white" />
                                </>
                            )}
                        </TouchableOpacity>

                        <View className="h-px w-full bg-gray-200 my-4" />

                        <View className="items-center gap-1.5">
                            <Text className="text-[11px] text-gray-500">Đã có tài khoản?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text className="text-xs font-bold text-[#007F3F]">Quay lại trang Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
