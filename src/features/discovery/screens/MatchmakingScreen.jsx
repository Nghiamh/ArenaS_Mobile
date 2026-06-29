import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, Text, TouchableOpacity, Alert, ActivityIndicator, Animated, Easing, Image, Modal, TextInput } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import matchmakingApi from "../../../api/matchmakingApi";
import { setStatus, setMatchData } from "../../../store/slices/matchmakingSlice";
import MiniMap from "../../../components/MiniMap";
import ReportModal from "./ReportModal";

export default function MatchmakingScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const { status, matchData } = useSelector(state => state.matchmaking);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSport, setSelectedSport] = useState("football");
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    
    // Feedback Modal State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [completedMatchId, setCompletedMatchId] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    
    const pollRef = useRef(null);  // useRef để tránh race condition với polling

    useEffect(() => {
        if (route.params?.selectedCourtId) {
            setSelectedCourt({
                id: route.params.selectedCourtId,
                name: route.params.selectedCourtName
            });
        }
    }, [route.params?.selectedCourtId]);

    // Animation cho radar
    const [pulseAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (status === "WAITING") {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    })
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(0);
        }
    }, [status]);


    useEffect(() => {
        let interval;
        if (status === "WAITING") {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [status]);

    // Polling trạng thái khi đang WAITING hoặc MATCHED
    useEffect(() => {
        if (status === "WAITING" || status === "MATCHED") {
            pollRef.current = setInterval(async () => {
                try {
                    const res = await matchmakingApi.getStatus();
                    if (res.data?.status === "MATCHED") {
                        const match = res.data?.ticket?.match_id;
                        if (match?.status === "CONFIRMED") {
                            dispatch(setStatus("CONFIRMED"));
                        } else {
                            dispatch(setStatus("MATCHED"));
                        }
                        if (match) dispatch(setMatchData(match));
                    }
                } catch (err) {
                    // Ignore network errors during polling
                }
            }, 5000);
        } else {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        return () => {
            clearInterval(pollRef.current);
            pollRef.current = null;
        };
    }, [status, dispatch]);

    // Kiểm tra trạng thái một lần khi vào màn hình
    useEffect(() => {
        const fetchCurrentStatus = async () => {
            try {
                const res = await matchmakingApi.getStatus();
                if (res.data?.status === "WAITING") {
                    dispatch(setStatus("WAITING"));
                } else if (res.data?.status === "MATCHED") {
                    const match = res.data?.ticket?.match_id;
                    if (match?.status === "CONFIRMED") {
                        dispatch(setStatus("CONFIRMED"));
                    } else {
                        dispatch(setStatus("MATCHED"));
                    }
                    if (match) dispatch(setMatchData(match));
                }
            } catch (err) {
                // Ignore if no active ticket
            }
        };
        fetchCurrentStatus();
    }, [dispatch]);

    const handleJoinQueue = async () => {
        try {
            setIsLoading(true);
            await matchmakingApi.joinQueue({
                sport: selectedSport,
                court_id: selectedCourt?.id,
                longitude: 106.6297, // Mặc định HCM hoặc lấy geolocation
                latitude: 10.8231
            });
            dispatch(setStatus("WAITING"));
        } catch (err) {
            const data = err.response?.data;
            if (data?.message === "already_in_queue") {
                dispatch(setStatus("WAITING"));
            } else {
                console.log("Join queue error:", data || err.message);
                Alert.alert("Lỗi", "Không thể tham gia ghép kèo: " + (data?.message || err.message));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!matchData) return;
        try {
            const res = await matchmakingApi.acceptMatch(matchData._id || matchData.id);
            if (res.data?.match) {
                dispatch(setMatchData(res.data.match));
                if (res.data.match.status === "CONFIRMED") {
                    dispatch(setStatus("CONFIRMED"));
                }
            }
        } catch (err) {
            Alert.alert("Lỗi", "Không thể xác nhận");
        }
    };

    const handleDecline = async () => {
        if (!matchData) return;
        try {
            await matchmakingApi.declineMatch(matchData._id || matchData.id);
            dispatch(setStatus("IDLE"));
            Alert.alert("Đã hủy", "Trận đấu đã bị hủy.");
        } catch (err) {
            Alert.alert("Lỗi", "Không thể từ chối");
        }
    };

    const handleCancelQueue = async () => {
        try {
            await matchmakingApi.cancelQueue();
            dispatch(setStatus("IDLE"));
        } catch (err) {
            console.log("Cancel queue error:", err);
            // Vẫn cho về IDLE ở local nếu lỗi mạng để khỏi kẹt màn hình
            dispatch(setStatus("IDLE"));
        }
    };

    const renderRadar = () => {
        const scale1 = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
        const opacity1 = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });
        const scale2 = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
        const opacity2 = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

        const maxSeconds = 1800; // 30 mins
        const currentSeconds = elapsedTime;
        const remainingSeconds = Math.max(0, maxSeconds - currentSeconds);

        const formatTime = (secs) => {
            const m = Math.floor(secs / 60).toString().padStart(2, '0');
            const s = (secs % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };

        const progressPercent = (currentSeconds / maxSeconds) * 100;
        
        const sportName = selectedSport === 'football' ? 'Bóng đá' : selectedSport === 'badminton' ? 'Cầu lông' : selectedSport === 'tennis' ? 'Tennis' : selectedSport === 'pickleball' ? 'Pickleball' : 'Bóng đá';

        return (
            <View className="flex-1 px-6 pt-10 items-center min-h-[500px]">
                {/* Radar Animation */}
                <View className="items-center justify-center h-56 relative w-full mb-6">
                    <Animated.View style={{ transform: [{ scale: scale2 }], opacity: opacity2 }} className="absolute h-32 w-32 rounded-full border border-[#38bdf8]/30" />
                    <Animated.View style={{ transform: [{ scale: scale1 }], opacity: opacity1 }} className="absolute h-32 w-32 rounded-full border border-[#38bdf8]/60 bg-[#38bdf8]/10" />
                    
                    <View className="h-4 w-4 rounded-full bg-[#38bdf8] shadow-md shadow-[#38bdf8]" />
                    
                    <View className="absolute w-32 h-32 rounded-full border border-[#38bdf8]/20" />
                </View>

                {/* Texts */}
                <Text className="font-bold text-2xl text-appText text-center mb-2">Đang tìm đối thủ...</Text>
                <Text className="text-sm text-appText/60 text-center mb-8">Hệ thống đang ghép bạn với người chơi phù hợp</Text>

                {/* Timer */}
                <View className="flex-row items-center gap-2 bg-appSurface border border-appText/10 px-5 py-2.5 rounded-full mb-8 shadow-sm shadow-black/5">
                    <Ionicons name="time-outline" size={18} color="#38bdf8" />
                    <Text className="font-bold text-appText text-base">{formatTime(currentSeconds)} <Text className="font-normal text-appText/50">/ 30:00</Text></Text>
                </View>

                {/* Details */}
                <View className="w-full mb-6 px-2">
                    <View className="flex-row items-center gap-3 mb-3">
                        <Ionicons name="flash" size={18} color="#38bdf8" />
                        <Text className="text-sm font-medium text-appText/70">Môn: <Text className="font-bold text-appText">{sportName}</Text></Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <Ionicons name="location-outline" size={18} color="#38bdf8" />
                        <Text className="text-sm font-medium text-appText/70">Sân cụ thể: <Text className="font-bold text-appText">{selectedCourt ? selectedCourt.name : "Đang tìm..."}</Text></Text>
                    </View>
                </View>

                {/* Progress bar */}
                <View className="w-full mb-2 h-1 bg-appText/10 rounded-full overflow-hidden">
                    <View className="h-full bg-[#38bdf8] rounded-full" style={{ width: `${progressPercent}%` }} />
                </View>
                <Text className="text-xs text-appText/50 text-center mb-auto">Hết hạn sau {formatTime(remainingSeconds)}</Text>

                {/* Cancel button */}
                <TouchableOpacity 
                    onPress={handleCancelQueue} 
                    className="w-full py-4 mt-8 mb-6 rounded-xl bg-red-900/10 border border-red-900/30 dark:border-red-900/50 items-center justify-center flex-row gap-2"
                >
                    <Ionicons name="close" size={18} color="#F87171" />
                    <Text className="text-[#F87171] font-bold text-base">Huỷ Tìm Kiếm</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const handleCompleteMatch = () => {
        Alert.alert(
            "Hoàn thành trận đấu",
            "Xác nhận hoàn thành trận đấu này? Bạn sẽ được đánh giá đối thủ sau khi xác nhận.",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xác nhận",
                    onPress: async () => {
                        if (!matchData) return;
                        try {
                            setIsLoading(true);
                            await matchmakingApi.completeMatch(matchData._id || matchData.id);
                            
                            // Show feedback modal instead of going to IDLE immediately
                            setCompletedMatchId(matchData._id || matchData.id);
                            setShowFeedbackModal(true);
                            
                        } catch (err) {
                            Alert.alert("Lỗi", err.response?.data?.error || "Không thể hoàn thành trận đấu.");
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSubmitFeedback = async () => {
        if (!completedMatchId) return;
        try {
            setIsSubmittingFeedback(true);
            await matchmakingApi.submitFeedback(completedMatchId, feedbackForm);
            Alert.alert("Thành công", "Đánh giá đã được ghi nhận. Điểm ELO của bạn đã được cập nhật!");
        } catch (err) {
            console.log("Feedback error:", err);
            Alert.alert("Lỗi", "Không thể gửi đánh giá.");
        } finally {
            setIsSubmittingFeedback(false);
            setShowFeedbackModal(false);
            dispatch(setStatus("IDLE"));
            dispatch(setMatchData(null));
        }
    };

    const handleSkipFeedback = () => {
        setShowFeedbackModal(false);
        dispatch(setStatus("IDLE"));
        dispatch(setMatchData(null));
    };

    const renderMatchCard = (isConfirmed) => {
        const currentUserId = String(user?._id || user?.id);
        const opponent = matchData?.participants?.find(p => String(p?._id || p?.id) !== currentUserId) || {};
        const court = matchData?.court_id || selectedCourt || {};

        return (
            <View className="flex-1 items-center px-4 pt-10 pb-6 min-h-[600px]">
                {/* Icon Trophy / Search */}
                <View className="h-20 w-20 rounded-2xl bg-emerald-100 shadow-md shadow-emerald-900/10 items-center justify-center mb-6">
                    <Ionicons name={isConfirmed ? "trophy-outline" : "search-outline"} size={44} color="#059669" />
                </View>

                {/* Title */}
                <Text className="text-2xl font-bold text-appText mb-2">
                    {isConfirmed ? "Ghép Cặp Thành Công!" : "Đã tìm thấy trận!"}
                </Text>
                <Text className="text-sm text-appText/60 mb-8">
                    {isConfirmed ? "Chúc bạn có một trận đấu vui vẻ!" : "Đợi cả hai cùng xác nhận để bắt đầu"}
                </Text>

                {/* Compatibility */}
                <View className="bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 rounded-full px-5 py-2 flex-row items-center gap-2 mb-8">
                    <Ionicons name="scan-outline" size={16} color="#3b82f6" />
                    <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">Độ tương thích: 95%</Text>
                </View>

                {/* Opponent Card */}
                <View className="w-full bg-white dark:bg-appSurface border border-appText/10 rounded-xl p-4 mb-4 flex-row items-center gap-4 shadow-sm shadow-black/5">
                    <Image source={{ uri: opponent.avatarUrl || "https://i.pravatar.cc/150?img=12" }} className="h-14 w-14 rounded-full border-2 border-emerald-500 bg-slate-200" />
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-appText">{opponent.name || opponent.userName || "Ẩn danh (Theo ELO)"}</Text>
                        <Text className="text-sm text-appText/60 mt-0.5">@{opponent.userName || "unknown"}</Text>
                    </View>
                </View>

                {/* Court Card */}
                <View className="w-full bg-white dark:bg-appSurface border border-appText/10 rounded-xl p-4 mb-8 flex-row items-center gap-4 shadow-sm shadow-black/5">
                    <View className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                        <Ionicons name="location-outline" size={20} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-appText">{court.name || "Sân Bóng Chảo Lửa"}</Text>
                        <Text className="text-xs text-appText/50 mt-1" numberOfLines={2}>{court.location || "30 Phan Thúc Duyện, Phường 4, Tân Bình, HCM"}</Text>
                    </View>
                </View>

                {/* Actions */}
                {isConfirmed ? (
                    <View className="w-full mt-auto">
                        <TouchableOpacity 
                            onPress={() => {
                                const currentUserId = String(user?._id || user?.id);
                                const opp = matchData?.participants?.find(p => String(p?._id || p?.id) !== currentUserId) || {};
                                navigation.navigate('Chat', { 
                                    matchId: matchData?._id || matchData?.id,
                                    opponentName: opp.name || opp.userName || 'Đối thủ',
                                });
                            }}
                            className="w-full py-4 rounded-xl bg-blue-500 items-center justify-center flex-row gap-2 mb-4 shadow-md shadow-blue-500/30"
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
                            <Text className="text-white font-bold text-lg">Vào Chat</Text>
                        </TouchableOpacity>
                        
                        <View className="flex-row gap-4 w-full">
                            <TouchableOpacity 
                                onPress={() => setShowReportModal(true)}
                                className="flex-1 py-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 items-center justify-center flex-row gap-2"
                            >
                                <Ionicons name="warning" size={16} color="#d97706" />
                                <Text className="text-yellow-700 dark:text-yellow-500 font-bold">Tố cáo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleCompleteMatch} 
                                disabled={isLoading}
                                className="flex-1 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 items-center justify-center flex-row gap-2"
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#059669" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={16} color="#059669" />
                                        <Text className="text-emerald-600 font-bold">Hoàn Thành</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View className="w-full mt-auto">
                        {matchData?.accepted_by?.includes(currentUserId) ? (
                            <View className="w-full py-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 items-center justify-center mb-4">
                                <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-base">Đã chấp nhận. Chờ đối thủ...</Text>
                            </View>
                        ) : (
                            <View className="w-full flex-row gap-4 mb-4">
                                <TouchableOpacity onPress={handleDecline} className="flex-1 py-4 rounded-xl bg-white dark:bg-appSurface border border-appText/20 items-center justify-center">
                                    <Text className="text-appText/70 font-bold text-base">Từ Chối</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleAccept} className="flex-2 px-10 py-4 rounded-xl bg-emerald-500 items-center justify-center shadow-md shadow-emerald-500/30">
                                    <Text className="text-white font-bold text-base">Chấp Nhận</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScrollView className="flex-1 bg-appBg">
            <View className="flex-row items-center justify-between px-4 pb-3 pt-12 bg-white dark:bg-appSurface border-b border-appText/5">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#059669" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-emerald-700 dark:text-emerald-500">Ghép kèo</Text>
                <View className="w-10" />
            </View>

            {status === "WAITING" && renderRadar()}
            {status === "MATCHED" && renderMatchCard(false)}
            {status === "CONFIRMED" && renderMatchCard(true)}

            {status === "IDLE" && (
                <View className="p-6">
                    <Text className="text-2xl font-bold text-appText mb-2">Tìm đối thủ vừa tầm</Text>
                    <Text className="text-appText/60 mb-8">Hệ thống sẽ tự động ghép cặp với những người cùng trình độ và khu vực của bạn.</Text>

                    <Text className="font-bold text-appText mb-3">Chọn môn thể thao</Text>
                    <View className="flex-row flex-wrap gap-3 mb-10">
                        {[{id:'football', name:'Bóng đá', icon:'soccer'}, {id:'badminton', name:'Cầu lông', icon:'badminton'}, {id:'tennis', name:'Tennis', icon:'tennis'}, {id:'pickleball', name:'Pickleball', icon:'tennis'}].map(s => (
                            <TouchableOpacity 
                                key={s.id} 
                                onPress={() => setSelectedSport(s.id)}
                                className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${selectedSport === s.id ? 'bg-emerald-100 border-emerald-500 dark:bg-emerald-900/30' : 'bg-appSurface border-appText/10'}`}
                            >
                                <MaterialCommunityIcons name={s.icon} size={20} color={selectedSport === s.id ? "#059669" : "#64748B"} />
                                <Text className={`font-semibold ${selectedSport === s.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-appText/70'}`}>{s.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="font-bold text-appText mb-3">Chọn sân (Tùy chọn)</Text>
                    {selectedCourt ? (
                        <View className="flex-row items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 mb-8">
                            <View className="flex-row items-center gap-3">
                                <Ionicons name="location" size={24} color="#059669" />
                                <Text className="font-semibold text-emerald-800 dark:text-emerald-400">{selectedCourt.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedCourt(null)}>
                                <Ionicons name="close-circle" size={24} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <MiniMap sport={selectedSport} onSelectCourt={setSelectedCourt} />
                    )}

                    <TouchableOpacity 
                        onPress={handleJoinQueue}
                        disabled={isLoading}
                        className="w-full py-4 rounded-full bg-emerald-600 shadow-lg shadow-emerald-900/20"
                    >
                        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-center font-bold text-lg text-white">Tìm Trận Ngay</Text>}
                    </TouchableOpacity>
                </View>
            )}
            {/* Report Modal */}
            <ReportModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                matchId={matchData?._id || matchData?.id}
                opponentName={
                    matchData?.participants?.find(
                        (p) => String(p?._id || p?.id) !== String(user?._id || user?.id)
                    )?.name || "Đối thủ"
                }
            />

            {/* Feedback Modal */}
            <Modal visible={showFeedbackModal} transparent animationType="slide" onRequestClose={handleSkipFeedback}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-appBg rounded-t-3xl p-6">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-appText">Đánh giá đối thủ</Text>
                            <TouchableOpacity onPress={handleSkipFeedback} className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-appSurface">
                                <Ionicons name="close" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm font-medium text-appText/70 text-center mb-3">
                            Đối thủ của bạn chơi thế nào? (Thắng/Thua, Thái độ, Kỹ năng)
                        </Text>
                        
                        {/* Stars */}
                        <View className="flex-row justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setFeedbackForm(p => ({ ...p, rating: star }))}>
                                    <Ionicons 
                                        name={star <= feedbackForm.rating ? "star" : "star-outline"} 
                                        size={40} 
                                        color={star <= feedbackForm.rating ? "#F59E0B" : "#CBD5E1"} 
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-sm font-semibold text-appText mb-2">Nhận xét thêm (tùy chọn)</Text>
                        <TextInput
                            value={feedbackForm.comment}
                            onChangeText={text => setFeedbackForm(p => ({ ...p, comment: text }))}
                            placeholder="Tuyệt vời, chơi rất fair-play..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            className="bg-slate-50 dark:bg-appSurface border border-appText/10 rounded-xl p-4 text-appText min-h-[80px] mb-6"
                        />

                        <TouchableOpacity 
                            onPress={handleSubmitFeedback}
                            disabled={isSubmittingFeedback}
                            className={`rounded-xl py-4 items-center flex-row justify-center ${isSubmittingFeedback ? 'bg-emerald-600/70' : 'bg-emerald-600'}`}
                        >
                            {isSubmittingFeedback ? <ActivityIndicator size="small" color="white" className="mr-2" /> : null}
                            <Text className="text-base font-bold text-white">GỬI ĐÁNH GIÁ & NHẬN ĐIỂM</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={handleSkipFeedback} className="mt-4 py-2">
                            <Text className="text-center text-sm font-semibold text-appText/50">Bỏ qua</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
