import { ScrollView, Text, View, TouchableOpacity, TextInput, Image } from "react-native";
import { useDispatch } from "react-redux";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { setGuestMode } from "../authSlice";
import { setItem } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../constants/config";

export default function LoginScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const handleLogin = async () => {
        await setItem(STORAGE_KEYS.guestMode, "true");
        dispatch(setGuestMode());
    };

    const handleSkipLogin = async () => {
        await setItem(STORAGE_KEYS.guestMode, "true");
        dispatch(setGuestMode());
    };

    return (
        <View className="flex-1 bg-[#F2F7F4]">
            <View className="flex-row justify-end px-5 pt-12 pb-2">
                <TouchableOpacity onPress={handleSkipLogin} className="flex-row items-center gap-1 p-1 bg-white/50 rounded-full px-3 py-1.5 border border-green-700/10">
                    <Text className="text-xs font-bold text-[#007F3F]">Trang Chủ</Text>
                    <Ionicons name="arrow-forward" size={14} color="#007F3F" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerClassName="flex-grow px-5 pb-12 justify-center" showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                    <Image 
                        source={require('../../../../assets/Img/logo.JPG.jpg')}
                        style={{ width: 80, height: 80, borderRadius: 40 }}
                        resizeMode="cover"
                    />
                    <Text className="mt-4 text-3xl font-black text-[#007F3F]">ArenaS</Text>
                    <Text className="mt-2 text-sm text-[#475569]">Sẵn sàng cho trận đấu tiếp theo?</Text>
                </View>

                <View className="rounded-3xl bg-white p-5 shadow-sm shadow-black/5">
                    <View className="mb-4">
                        <Text className="mb-2 text-[10px] font-bold text-gray-500 uppercase">Email hoặc số điện thoại</Text>
                        <View className="flex-row items-center rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 py-3">
                            <Ionicons name="person-outline" size={18} color="#64748B" />
                            <TextInput
                                placeholder="name@example.com"
                                placeholderTextColor="#94A3B8"
                                className="flex-1 ml-2 text-sm text-gray-800"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-[10px] font-bold text-gray-500 uppercase">Mật khẩu</Text>
                            <TouchableOpacity>
                                <Text className="text-[10px] font-bold text-[#007F3F] uppercase">Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 py-3">
                            <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                            <TextInput
                                placeholder="••••••••"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry
                                className="flex-1 mx-2 text-sm text-gray-800"
                            />
                            <Ionicons name="eye-outline" size={18} color="#64748B" />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        className="rounded-xl bg-[#00522B] py-3.5 shadow-sm shadow-green-900/20 items-center justify-center"
                    >
                        <Text className="text-sm font-bold text-white">Đăng nhập</Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center mt-6 mb-5">
                        <View className="flex-1 h-px bg-gray-200" />
                        <Text className="mx-3 text-[10px] font-bold text-gray-400 uppercase">Hoặc tiếp tục với</Text>
                        <View className="flex-1 h-px bg-gray-200" />
                    </View>

                    <View className="flex-row gap-3 mb-2">
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-2.5">
                            <Ionicons name="logo-google" size={18} color="#4285F4" />
                            <Text className="ml-2 text-[13px] font-bold text-gray-700">Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl bg-[#1877F2] py-2.5">
                            <Ionicons name="logo-facebook" size={18} color="white" />
                            <Text className="ml-2 text-[13px] font-bold text-white">Facebook</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex-row justify-center mt-8">
                    <Text className="text-xs text-gray-500">Bạn chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text className="text-xs font-bold text-[#007F3F]">Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
