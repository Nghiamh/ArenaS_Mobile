import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import matchmakingApi from "../api/matchmakingApi";
import { setStatus, setMatchData } from "../store/slices/matchmakingSlice";

export default function MatchmakingOverlay({ currentRoute, navigationRef }) {
    const { status, searchStartTime } = useSelector(state => state.matchmaking);
    const dispatch = useDispatch();
    
    const isMatchmakingScreen = currentRoute === "Ghép Kèo";

    // Fetch initial status on mount
    useEffect(() => {
        checkStatus();
    }, []);

    // Polling logic
    useEffect(() => {
        let interval;
        if (status === "WAITING") {
            interval = setInterval(() => {
                checkStatus();
            }, 3000); // Polling 3s
        }
        return () => clearInterval(interval);
    }, [status]);

    const checkStatus = async () => {
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
            } else {
                dispatch(setStatus("IDLE"));
            }
        } catch (err) {
            // console.log("Overlay check status error:", err);
        }
    };

    // Elapsed time calculation
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        let timer;
        if (status === "WAITING" && searchStartTime) {
            timer = setInterval(() => {
                setElapsed(Math.floor((Date.now() - searchStartTime) / 1000));
            }, 1000);
        } else {
            setElapsed(0);
        }
        return () => clearInterval(timer);
    }, [status, searchStartTime]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    if (status === "IDLE" || isMatchmakingScreen) {
        return null; // Don't show if idle or already on the matchmaking screen
    }

    return (
        <TouchableOpacity 
            onPress={() => navigationRef?.navigate("BottomTabs", { screen: "Ghép Kèo" })}
            className="absolute top-14 self-center bg-white dark:bg-appSurface px-4 py-2 rounded-full shadow-lg shadow-black/20 flex-row items-center gap-3 border border-emerald-500"
            style={{ elevation: 10, zIndex: 1000 }}
        >
            <View className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Text className="font-bold text-emerald-700 dark:text-emerald-400">
                {status === "WAITING" ? "Đang tìm trận..." : status === "MATCHED" ? "Đã tìm thấy!" : "Đã xác nhận"}
            </Text>
            {status === "WAITING" && (
                <Text className="font-bold text-appText/60">
                    {formatTime(elapsed)}
                </Text>
            )}
            <Ionicons name="chevron-forward" size={16} color="#64748B" />
        </TouchableOpacity>
    );
}
