import React, { useState, useRef, useEffect } from "react";
import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { setGuestMode, setCredentials } from "../../../store/slices/authSlice";
import { setItem } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../constants/config";
import authApi from "../../../api/authApi";
import * as WebBrowser from "expo-web-browser";
import {
    useAuthRequest,
    makeRedirectUri,
    ResponseType,
    exchangeCodeAsync,
} from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

// ── Google OAuth discovery ───────────────────────────────
const googleDiscovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

// ── helpers ──────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;

function validateLoginFields({ email, password }) {
    const errors = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
        errors.email = "Vui lòng nhập email hoặc số điện thoại.";
    } else if (!EMAIL_REGEX.test(trimmedEmail) && !PHONE_REGEX.test(trimmedEmail)) {
        errors.email = "Email hoặc số điện thoại không hợp lệ.";
    }

    if (!password) {
        errors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
        errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    return errors;
}

// ── component ────────────────────────────────────────────
export default function LoginScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const passwordRef = useRef(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // ── Google Auth (core expo-auth-session) ─────────────
    const authConfig = React.useMemo(() => {
        const uri = makeRedirectUri();
        return {
            clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
            redirectUri: uri,
            scopes: ["openid", "profile", "email"],
            responseType: ResponseType.Code,
        };
    }, []);

    const [googleRequest, googleResponse, promptGoogleAsync] = useAuthRequest(
        authConfig,
        googleDiscovery
    );

    useEffect(() => {
        if (googleResponse?.type === "success" && googleResponse.params.code) {
            exchangeCodeAndLogin(googleResponse.params.code);
        }
    }, [googleResponse]);

    const exchangeCodeAndLogin = async (code) => {
        try {
            setIsGoogleLoading(true);
            // Exchange authorization code for tokens (client-side at Google)
            const tokenResult = await exchangeCodeAsync(
                {
                    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
                    code,
                    redirectUri: authConfig.redirectUri,
                    extraParams: {
                        code_verifier: googleRequest?.codeVerifier || "",
                    },
                },
                googleDiscovery
            );

            if (tokenResult.idToken) {
                // Send idToken to our BE for verification
                await handleGoogleLogin(tokenResult.idToken);
            } else {
                Alert.alert("Lỗi", "Không thể lấy thông tin xác thực từ Google.");
            }
        } catch (error) {
            console.error("Google code exchange error:", error);
            Alert.alert("Lỗi", "Đăng nhập Google thất bại. Vui lòng thử lại.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleLogin = async (idToken) => {
        try {
            setIsGoogleLoading(true);
            const response = await authApi.googleLogin({ idToken });
            const { token, user } = response.data;

            if (token) {
                await setItem(STORAGE_KEYS.authToken, token);
                await setItem(STORAGE_KEYS.user, JSON.stringify(user));
                dispatch(setCredentials({ user, token }));
            }
        } catch (error) {
            console.error("Google login error:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Đăng nhập Google thất bại. Vui lòng thử lại.";
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // ── handlers ─────────────────────────────────────────
    const handleLogin = async () => {
        const errors = validateLoginFields({ email, password });
        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) return;

        try {
            setIsLoading(true);
            const response = await authApi.login({
                email: email.trim(),
                password,
            });

            const { token, user } = response.data;

            if (token) {
                await setItem(STORAGE_KEYS.authToken, token);
                await setItem(STORAGE_KEYS.user, JSON.stringify(user));
                dispatch(setCredentials({ user, token }));
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipLogin = async () => {
        await setItem(STORAGE_KEYS.guestMode, "true");
        dispatch(setGuestMode());
    };

    // clear individual error on change
    const onChangeEmail = (val) => {
        setEmail(val);
        if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
    };
    const onChangePassword = (val) => {
        setPassword(val);
        if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
    };

    // ── render ───────────────────────────────────────────
    return (
        <View className="flex-1 bg-[#F2F7F4]">
            {/* Skip / Guest button */}
            <View className="flex-row justify-end px-5 pt-12 pb-2">
                <TouchableOpacity
                    onPress={handleSkipLogin}
                    className="flex-row items-center gap-1 p-1 bg-white/50 rounded-full px-3 py-1.5 border border-green-700/10"
                    activeOpacity={0.7}
                >
                    <Text className="text-xs font-bold text-[#007F3F]">Trang Chủ</Text>
                    <Ionicons name="arrow-forward" size={14} color="#007F3F" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 48, justifyContent: "center" }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo & title */}
                    <View className="items-center mb-8">
                        <Image
                            source={require("../../../../assets/Img/logo.png")}
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                            resizeMode="cover"
                        />
                        <Text className="mt-4 text-3xl font-black text-[#007F3F]">ArenaS</Text>
                        <Text className="mt-2 text-sm text-[#475569]">
                            Đặt Sân Nhanh Chóng – Tiện Lợi
                        </Text>
                    </View>

                    {/* Card */}
                    <View className="rounded-3xl bg-white p-5 shadow-sm shadow-black/5">
                        {/* ── Email ── */}
                        <View className="mb-4">
                            <Text className="mb-2 text-[10px] font-bold text-gray-500 uppercase">
                                Email hoặc số điện thoại
                            </Text>
                            <View
                                className={`flex-row items-center rounded-xl border ${fieldErrors.email ? "border-red-400" : "border-gray-200"
                                    } bg-[#F8FAFC] px-3 py-3`}
                            >
                                <Ionicons name="person-outline" size={18} color="#64748B" />
                                <TextInput
                                    placeholder="name@example.com"
                                    placeholderTextColor="#94A3B8"
                                    className="flex-1 ml-2 text-sm text-gray-800"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    value={email}
                                    onChangeText={onChangeEmail}
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                    blurOnSubmit={false}
                                />
                            </View>
                            {fieldErrors.email ? (
                                <Text className="mt-1.5 text-xs text-red-500">{fieldErrors.email}</Text>
                            ) : null}
                        </View>

                        {/* ── Password ── */}
                        <View className="mb-5">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-[10px] font-bold text-gray-500 uppercase">
                                    Mật khẩu
                                </Text>
                                <TouchableOpacity>
                                    <Text className="text-[10px] font-bold text-[#007F3F] uppercase">
                                        Quên mật khẩu?
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View
                                className={`flex-row items-center rounded-xl border ${fieldErrors.password ? "border-red-400" : "border-gray-200"
                                    } bg-[#F8FAFC] px-3 py-3`}
                            >
                                <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                                <TextInput
                                    ref={passwordRef}
                                    placeholder="••••••••"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry={!showPassword}
                                    className="flex-1 mx-2 text-sm text-gray-800"
                                    returnKeyType="done"
                                    value={password}
                                    onChangeText={onChangePassword}
                                    onSubmitEditing={handleLogin}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={18}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>
                            {fieldErrors.password ? (
                                <Text className="mt-1.5 text-xs text-red-500">
                                    {fieldErrors.password}
                                </Text>
                            ) : null}
                        </View>

                        {/* ── Submit ── */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.85}
                            className={`rounded-xl py-3.5 shadow-sm items-center justify-center ${isLoading ? "bg-gray-400" : "bg-[#00522B] shadow-green-900/20"
                                }`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-sm font-bold text-white">Đăng nhập</Text>
                            )}
                        </TouchableOpacity>

                        {/* ── Divider ── */}
                        <View className="flex-row items-center mt-6 mb-5">
                            <View className="flex-1 h-px bg-gray-200" />
                            <Text className="mx-3 text-[10px] font-bold text-gray-400 uppercase">
                                Hoặc tiếp tục với
                            </Text>
                            <View className="flex-1 h-px bg-gray-200" />
                        </View>

                        {/* ── Social ── */}
                        <View className="flex-row gap-3 mb-2">
                            <TouchableOpacity
                                onPress={() => promptGoogleAsync()}
                                disabled={!googleRequest || isGoogleLoading || isLoading}
                                activeOpacity={0.7}
                                className={`flex-1 flex-row items-center justify-center rounded-xl border border-gray-200 py-2.5 ${!googleRequest || isGoogleLoading ? "bg-gray-100" : "bg-white"
                                    }`}
                            >
                                {isGoogleLoading ? (
                                    <ActivityIndicator size="small" color="#4285F4" />
                                ) : (
                                    <>
                                        <Ionicons name="logo-google" size={18} color="#4285F4" />
                                        <Text className="ml-2 text-[13px] font-bold text-gray-700">
                                            Google
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                className="flex-1 flex-row items-center justify-center rounded-xl bg-[#1877F2] py-2.5"
                            >
                                <Ionicons name="logo-facebook" size={18} color="white" />
                                <Text className="ml-2 text-[13px] font-bold text-white">
                                    Facebook
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Footer ── */}
                    <View className="flex-row justify-center mt-8">
                        <Text className="text-xs text-gray-500">Bạn chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                            <Text className="text-xs font-bold text-[#007F3F]">Đăng ký ngay</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
