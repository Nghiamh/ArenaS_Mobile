import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import chatApi from "../../../api/chatApi";
import bookingApi from "../../../api/bookingApi";
import { getSocket } from "../../../utils/socket";

export default function ChatScreen({ navigation, route }) {
    const { matchId, opponentName } = route?.params || {};
    const user = useSelector((state) => state.auth.user);
    const currentUserId = String(user?._id || user?.id);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [pendingDeposit, setPendingDeposit] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const flatListRef = useRef(null);
    const socketRef = useRef(null);

    // ── Load chat history ────────────────────────────────
    useEffect(() => {
        if (!matchId) return;
        loadHistory();
        loadPendingDeposit();
    }, [matchId]);

    const loadHistory = async () => {
        if (!matchId) { setIsLoading(false); return; }
        try {
            setIsLoading(true);
            const res = await chatApi.getHistory(matchId);
            const data = res.data;

            if (data.deleted) {
                setIsDeleted(true);
                setMessages([]);
            } else {
                setMessages(data.messages || []);
            }

            if (data.pending_deposit) {
                setPendingDeposit(data.pending_deposit);
            }
        } catch (err) {
            console.error("Load chat history error:", err);
            Alert.alert("Lỗi", "Không thể tải lịch sử chat.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Load pending deposit from booking API ────────────
    const loadPendingDeposit = async () => {
        if (!matchId) return;
        try {
            const res = await bookingApi.getMatchPendingDeposit(matchId);
            if (res.data?.pending_deposit) {
                setPendingDeposit(res.data.pending_deposit);
            }
        } catch (err) {
            // Silently fail — no deposit needed
        }
    };

    // ── Socket.IO real-time ──────────────────────────────
    useEffect(() => {
        if (!matchId) return;
        let socket;

        const connectSocket = async () => {
            socket = await getSocket();
            if (!socket) return;

            socketRef.current = socket;

            // Join the match room
            socket.emit("join_match_room", { matchId });

            // Listen for new messages
            socket.on("receive_message", handleReceiveMessage);

            // Listen for chat deletion votes
            socket.on("chat_vote_updated", handleChatVoteUpdated);

            // Listen for opponent deposit required
            socket.on("opponent_deposit_required", handleOpponentDeposit);

            // Listen for court booked confirmation
            socket.on("court_booked", handleCourtBooked);
        };

        connectSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.emit("leave_match_room", { matchId });
                socketRef.current.off("receive_message", handleReceiveMessage);
                socketRef.current.off("chat_vote_updated", handleChatVoteUpdated);
                socketRef.current.off("opponent_deposit_required", handleOpponentDeposit);
                socketRef.current.off("court_booked", handleCourtBooked);
            }
        };
    }, [matchId]);

    const handleReceiveMessage = useCallback((data) => {
        setMessages((prev) => {
            // Avoid duplicate
            if (prev.some((m) => m._id === data._id)) return prev;
            return [...prev, data];
        });

        // Auto scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleChatVoteUpdated = useCallback((data) => {
        if (data.deleted) {
            setIsDeleted(true);
            setMessages([]);
            Alert.alert("Thông báo", "Chat đã bị xóa bởi cả hai bên.");
        }
    }, []);

    const handleOpponentDeposit = useCallback((data) => {
        if (data.matchId === matchId) {
            setPendingDeposit({
                bookingId: data.bookingId,
                amount: data.opponent_amount,
                deadline: data.deadline,
                courtName: data.courtName,
                date: data.date,
                start_time: data.start_time,
                end_time: data.end_time,
                total_price: data.total_price,
            });
        }
    }, [matchId]);

    const handleCourtBooked = useCallback((data) => {
        if (data.matchId === matchId && data.status === "confirmed") {
            // Deposit completed, clear banner
            setPendingDeposit(null);
        }
    }, [matchId]);

    // ── Send message via socket ──────────────────────────
    const handleSend = useCallback(() => {
        const text = inputText.trim();
        if (!text || !socketRef.current || isDeleted) return;

        setIsSending(true);

        // No optimistic update — let the server broadcast handle display
        // to avoid duplicate messages when both users are online.
        socketRef.current.emit("send_message", {
            matchId,
            message: text,
        });

        setInputText("");
        setIsSending(false);
    }, [inputText, matchId, isDeleted]);

    // ── Opponent pay 50% ─────────────────────────────────
    const handlePayDeposit = () => {
        if (!pendingDeposit?.bookingId) return;

        const amountStr = (pendingDeposit.amount || 0).toLocaleString("vi-VN");

        Alert.alert(
            "Thanh toán 50% còn lại",
            `Bạn sẽ thanh toán ${amountStr}đ từ ví để xác nhận đặt sân.\n\nSân: ${pendingDeposit.courtName || "Sân"}\nNgày: ${pendingDeposit.date || ""}\nGiờ: ${pendingDeposit.start_time || ""} - ${pendingDeposit.end_time || ""}`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Thanh toán",
                    onPress: async () => {
                        try {
                            setIsPaying(true);
                            await bookingApi.opponentPayBooking(pendingDeposit.bookingId);
                            setPendingDeposit(null);
                            Alert.alert("🎉 Thành công!", "Đã thanh toán thành công. Sân đã được xác nhận!");
                        } catch (err) {
                            const msg = err.response?.data?.error || "Không thể thanh toán. Vui lòng thử lại.";
                            Alert.alert("Lỗi", msg);
                        } finally {
                            setIsPaying(false);
                        }
                    },
                },
            ]
        );
    };

    // ── Vote to delete chat ──────────────────────────────
    const handleVoteDelete = () => {
        Alert.alert(
            "Xóa lịch sử chat",
            "Bạn muốn xóa toàn bộ lịch sử chat? Cần cả 2 người đồng ý mới xóa được.",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await chatApi.voteDelete(matchId);
                            if (res.data?.deleted) {
                                setIsDeleted(true);
                                setMessages([]);
                            } else {
                                Alert.alert(
                                    "Đã ghi nhận",
                                    `Đã bỏ phiếu. Cần thêm ${res.data?.votesRemaining} phiếu nữa để xóa.`
                                );
                            }
                        } catch (err) {
                            const msg = err.response?.data?.error || "Không thể thực hiện.";
                            Alert.alert("Lỗi", msg);
                        }
                    },
                },
            ]
        );
    };

    // ── Format time ──────────────────────────────────────
    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    };

    // ── Render a single message ──────────────────────────
    const renderMessage = useCallback(({ item }) => {
        const senderId = typeof item.sender_id === "object"
            ? String(item.sender_id._id || item.sender_id.id)
            : String(item.sender_id);
        const isMe = senderId === currentUserId;

        // Check if this is a system/booking message
        const isBookingMsg = item.message?.includes("đặt cọc 50%") || item.message?.includes("đã đặt sân") || item.message?.includes("thanh toán 50%");

        // Get sender name
        let senderName = isMe ? "Bạn" : (opponentName || "Đối thủ");
        if (!isMe && typeof item.sender_id === "object" && (item.sender_id.name || item.sender_id.userName)) {
            senderName = item.sender_id.name || item.sender_id.userName;
        }

        if (isBookingMsg) {
            return (
                <View className={`mb-3 px-4 ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                        <Text className="text-[10px] text-appText/40 mb-1 ml-1">
                            {senderName}
                        </Text>
                    )}
                    <View className={`max-w-[85%] px-4 py-3 border ${
                        isMe
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50 rounded-2xl rounded-br-md"
                            : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50 rounded-2xl rounded-bl-md"
                    }`}>
                        <View className="flex-row items-center gap-2 mb-1.5">
                            <Ionicons name="receipt-outline" size={13} color="#3B82F6" />
                            <Text className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                {isMe ? "Bạn" : senderName}
                            </Text>
                        </View>
                        <Text className="text-xs text-blue-800 dark:text-blue-300 leading-[18px]">
                            {item.message}
                        </Text>
                        <Text className="text-[10px] text-blue-400 dark:text-blue-500 mt-1.5 text-right">
                            {formatTime(item.createdAt)}
                        </Text>
                    </View>
                </View>
            );
        }


        return (
            <View className={`mb-3 px-4 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (
                    <Text className="text-[10px] text-appText/40 mb-1 ml-1">
                        {senderName}
                    </Text>
                )}
                <View
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${isMe
                        ? "bg-emerald-500 rounded-br-md"
                        : "bg-white dark:bg-appSurface border border-appText/10 rounded-bl-md"
                        }`}
                >
                    <Text
                        className={`text-sm leading-5 ${isMe ? "text-white" : "text-appText"}`}
                    >
                        {item.message}
                    </Text>
                </View>
                <Text className="text-[10px] text-appText/30 mt-1 mx-1">
                    {formatTime(item.createdAt)}
                </Text>
            </View>
        );
    }, [currentUserId, opponentName]);

    // ── Pending deposit banner ────────────────────────────
    const renderDepositBanner = () => {
        if (!pendingDeposit) return null;

        const deadline = pendingDeposit.deadline ? new Date(pendingDeposit.deadline) : null;
        const formattedDeadline = deadline
            ? `${deadline.getHours().toString().padStart(2, "0")}:${deadline.getMinutes().toString().padStart(2, "0")} ${deadline.getDate()}/${deadline.getMonth() + 1}`
            : "";

        const amountStr = (pendingDeposit.amount || 0).toLocaleString("vi-VN");

        return (
            <View className="mx-4 mt-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl">
                <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="wallet-outline" size={18} color="#d97706" />
                    <Text className="font-bold text-amber-700 dark:text-amber-400 text-sm flex-1">
                        Cần thanh toán 50% còn lại
                    </Text>
                </View>
                <Text className="text-xs text-amber-600/80 dark:text-amber-400/70 mb-1">
                    Sân: {pendingDeposit.courtName || "Đang tải..."}
                </Text>
                <Text className="text-xs text-amber-600/80 dark:text-amber-400/70 mb-1">
                    Ngày: {pendingDeposit.date || ""} • Giờ: {pendingDeposit.start_time || ""} - {pendingDeposit.end_time || ""}
                </Text>
                <Text className="text-xs text-amber-600/80 dark:text-amber-400/70 mb-3">
                    Số tiền: <Text className="font-bold text-amber-700 dark:text-amber-400">{amountStr}đ</Text>
                    {formattedDeadline ? ` • Hạn: ${formattedDeadline}` : ""}
                </Text>
                <TouchableOpacity
                    onPress={handlePayDeposit}
                    disabled={isPaying}
                    className="bg-amber-500 py-3 rounded-xl items-center justify-center flex-row gap-2 shadow-md shadow-amber-500/30"
                >
                    {isPaying ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Ionicons name="card-outline" size={16} color="white" />
                            <Text className="text-white font-bold text-sm">
                                Thanh toán {amountStr}đ
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // ── Main render ──────────────────────────────────────
    return (
        <KeyboardAvoidingView
            className="flex-1 bg-appBg"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-3 pt-12 bg-white dark:bg-appSurface border-b border-appText/5">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#059669" />
                </TouchableOpacity>
                <View className="items-center flex-1">
                    <Text className="text-base font-bold text-appText" numberOfLines={1}>
                        {opponentName || "Chat trận đấu"}
                    </Text>
                    <Text className="text-[10px] text-appText/40 mt-0.5">Đang hoạt động</Text>
                </View>
                <TouchableOpacity onPress={handleVoteDelete} className="p-2 -mr-2" disabled={isDeleted}>
                    <Ionicons name="trash-outline" size={20} color={isDeleted ? "#CBD5E1" : "#EF4444"} />
                </TouchableOpacity>
            </View>

            {/* Deposit banner */}
            {renderDepositBanner()}

            {/* Messages */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#059669" />
                    <Text className="text-sm text-appText/50 mt-3">Đang tải tin nhắn...</Text>
                </View>
            ) : isDeleted ? (
                <View className="flex-1 items-center justify-center px-6">
                    <View className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-4">
                        <Ionicons name="chatbubbles-outline" size={32} color="#94A3B8" />
                    </View>
                    <Text className="text-base font-bold text-appText/50 text-center">
                        Chat đã bị xóa
                    </Text>
                    <Text className="text-sm text-appText/30 mt-2 text-center">
                        Cả hai bên đã đồng ý xóa lịch sử chat.
                    </Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => String(item._id)}
                    renderItem={renderMessage}
                    initialNumToRender={15}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    removeClippedSubviews={true}
                    contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center px-6">
                            <View className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center mb-4">
                                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#059669" />
                            </View>
                            <Text className="text-base font-bold text-appText/50 text-center">
                                Bắt đầu cuộc trò chuyện!
                            </Text>
                            <Text className="text-sm text-appText/30 mt-2 text-center">
                                Hãy gửi tin nhắn đầu tiên để trao đổi với đối thủ.
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Input bar */}
            {!isDeleted && (
                <View className="flex-row items-end px-3 py-3 bg-white dark:bg-appSurface border-t border-appText/5">
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "Đặt sân cho trận đấu 🏟️",
                                "Bạn sẽ đặt sân cho trận đấu này. Bạn có thể chọn chia tiền 50/50 với đối thủ hoặc thanh toán toàn bộ (100%).\n\nBạn sẽ được chuyển sang màn hình tìm sân — hãy chọn sân và khung giờ phù hợp.",
                                [
                                    { text: "Hủy", style: "cancel" },
                                    { text: "Chọn sân", onPress: () => navigation.navigate("BottomTabs", { screen: "Tìm Sân", params: { matchId } }) },
                                ]
                            );
                        }}
                        className="h-11 w-11 rounded-full items-center justify-center bg-emerald-50 dark:bg-emerald-900/30 mr-2"
                    >
                        <Ionicons name="football-outline" size={20} color="#059669" />
                    </TouchableOpacity>
                    <TextInput
                        className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 mr-2 text-sm text-appText max-h-24"
                        placeholder="Nhập tin nhắn..."
                        placeholderTextColor="#94A3B8"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        returnKeyType="send"
                        onSubmitEditing={handleSend}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim() || isSending}
                        style={{
                            height: 44,
                            width: 44,
                            borderRadius: 22,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: inputText.trim() ? '#10B981' : '#E2E8F0',
                            elevation: inputText.trim() ? 4 : 0,
                            shadowColor: inputText.trim() ? '#10B981' : 'transparent',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                        }}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons
                                name="send"
                                size={18}
                                color={inputText.trim() ? "white" : "#94A3B8"}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
