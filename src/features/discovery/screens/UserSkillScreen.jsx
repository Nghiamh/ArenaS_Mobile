import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import userSkillApi from "../../../api/userSkillApi";
import { useColorScheme } from "nativewind";

export default function UserSkillScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const navigation = useNavigation();

    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [sport, setSport] = useState("Bóng đá");
    const [level, setLevel] = useState(3);
    const [playVibe, setPlayVibe] = useState("balanced");
    const [playFrequency, setPlayFrequency] = useState(2);
    const [note, setNote] = useState("");
    const [editingSkillId, setEditingSkillId] = useState(null);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await userSkillApi.getCurrentUserSkills();
            let skillsArray = [];
            if (Array.isArray(res.data)) {
                skillsArray = res.data;
            } else if (Array.isArray(res.data?.data)) {
                skillsArray = res.data.data;
            } else if (Array.isArray(res.data?.skills)) {
                skillsArray = res.data.skills;
            }
            setSkills(skillsArray);
        } catch (error) {
            // Silently handle fetch error to avoid cluttering logs
        } finally {
            setIsLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingSkillId(null);
        setSport("Bóng đá");
        setLevel(3);
        setPlayVibe("balanced");
        setPlayFrequency(2);
        setNote("");
        setIsModalVisible(true);
    };

    const openEditModal = (skill) => {
        setEditingSkillId(skill._id || skill.id);
        
        let uiSport = "Bóng đá";
        if (skill.sport === "Bóng đá" || skill.sport === "football_5") uiSport = "Bóng đá";
        if (skill.sport === "Cầu lông" || skill.sport === "badminton") uiSport = "Cầu lông";
        if (skill.sport === "Tennis" || skill.sport === "tennis") uiSport = "Tennis";
        if (skill.sport === "Pickleball" || skill.sport === "pickleball") uiSport = "Pickleball";
        setSport(uiSport);
        
        setLevel(skill.level || 3);
        setPlayVibe(skill.play_vibe || "balanced");
        setPlayFrequency(skill.play_frequency || 2);
        setNote(skill.note || "");
        setIsModalVisible(true);
    };

    const handleSubmitSkill = async () => {
        try {
            setIsSaving(true);
            
            const data = {
                sport,
                level,
                rating_score: level, // khởi tạo bằng level
                play_vibe: playVibe,
                play_frequency: playFrequency,
                note: note.trim()
            };

            let targetId = editingSkillId;
            if (!targetId) {
                const existing = skills.find(s => s.sport === sport || 
                    (s.sport === "football_5" && sport === "Bóng đá") || 
                    (s.sport === "badminton" && sport === "Cầu lông") || 
                    (s.sport === "tennis" && sport === "Tennis") || 
                    (s.sport === "pickleball" && sport === "Pickleball"));
                if (existing) targetId = existing._id || existing.id;
            }

            if (targetId) {
                await userSkillApi.updateCurrentUserSkill(targetId, data);
                Alert.alert("Thành công", "Đã cập nhật kỹ năng!");
            } else {
                await userSkillApi.createCurrentUserSkill(data);
                Alert.alert("Thành công", "Đã lưu kỹ năng mới!");
            }
            
            setIsModalVisible(false);
            fetchSkills();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            Alert.alert("Lỗi", `Không thể lưu kỹ năng: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSkill = async (skillId) => {
        try {
            await userSkillApi.deleteCurrentUserSkill(skillId);
            fetchSkills();
        } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa kỹ năng");
        }
    };

    // Helper UI renderers
    const renderLevelStars = () => (
        <View className="flex-row items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setLevel(star)}>
                    <Ionicons 
                        name={star <= level ? "star" : "star-outline"} 
                        size={32} 
                        color={star <= level ? "#F59E0B" : "#94A3B8"} 
                    />
                </TouchableOpacity>
            ))}
            <Text className="ml-2 font-bold text-appText">{level}/5</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-appBg">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-appSurface border-b border-appText/10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-appText">Kỹ năng của tôi</Text>
                <View className="w-8" />
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                <View className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 mb-6">
                    <Ionicons name="information-circle" size={24} color="#059669" className="mb-2" />
                    <Text className="text-sm text-appText/80 mt-2">
                        Đánh giá đúng trình độ giúp hệ thống ghép bạn với những đối thủ vừa sức. Kỹ năng sẽ được thuật toán tham khảo khi bạn tìm trận.
                    </Text>
                </View>
                
                {isLoading ? (
                    <ActivityIndicator size="large" color="#059669" />
                ) : (
                    <>
                        <Text className="text-base font-bold text-appText mb-3">Kỹ năng hiện tại</Text>
                        {skills.length > 0 ? (
                            skills.map((skill, idx) => (
                                <TouchableOpacity 
                                    key={skill._id || idx} 
                                    onPress={() => openEditModal(skill)}
                                    activeOpacity={0.7}
                                    className="flex-row items-center justify-between mb-3 bg-appSurface p-4 rounded-xl border border-appText/10 shadow-sm shadow-black/5"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-emerald-100 items-center justify-center">
                                            <Ionicons name={skill.sport === 'football_5' ? 'football' : 'tennisball'} size={20} color="#059669" />
                                        </View>
                                        <View>
                                            <Text className="font-bold text-appText text-base">
                                                {skill.sport === 'football_5' ? 'Bóng đá 5' : skill.sport === 'badminton' ? 'Cầu lông' : skill.sport === 'tennis' ? 'Tennis' : skill.sport === 'pickleball' ? 'Pickleball' : skill.sport}
                                            </Text>
                                            <Text className="text-xs text-appText/60 mt-0.5">Trình độ: {skill.skillLevel || skill.level || 'Chưa đánh giá'}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteSkill(skill._id || skill.id)} className="p-2">
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="items-center justify-center py-8">
                                <Text className="text-sm text-appText/50 italic mb-4">Bạn chưa cập nhật kỹ năng nào.</Text>
                            </View>
                        )}
                        <TouchableOpacity 
                            onPress={openAddModal}
                            className="w-full py-3.5 rounded-xl bg-emerald-600 items-center justify-center shadow-sm shadow-emerald-900/20"
                        >
                            <Text className="text-white font-bold text-base">+ Khai báo Kỹ năng mới</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {/* Add Skill Modal */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-appBg rounded-t-3xl h-[85%]">
                        <View className="flex-row items-center justify-between px-5 py-4 border-b border-appText/10">
                            <Text className="text-lg font-bold text-appText">Khai báo Kỹ năng</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView className="flex-1 px-5 py-4" keyboardShouldPersistTaps="handled">
                            {/* Môn thể thao */}
                            <Text className="text-base font-bold text-appText mb-3">1. Môn thể thao</Text>
                            <View className="flex-row flex-wrap gap-3 mb-6">
                                {["Bóng đá", "Cầu lông", "Tennis", "Pickleball"].map((s) => (
                                    <TouchableOpacity 
                                        key={s} onPress={() => setSport(s)}
                                        className={`px-4 py-2 rounded-full border ${sport === s ? 'bg-emerald-600 border-emerald-600' : 'bg-appSurface border-appText/20'}`}
                                    >
                                        <Text className={sport === s ? 'text-white font-bold' : 'text-appText'}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Trình độ */}
                            <Text className="text-base font-bold text-appText mb-1">2. Trình độ kinh nghiệm</Text>
                            <Text className="text-xs text-appText/60 mb-2">1: Mới chơi - 5: Chuyên nghiệp</Text>
                            {renderLevelStars()}
                            
                            {/* Phong cách chơi */}
                            <Text className="text-base font-bold text-appText mt-6 mb-3">3. Phong cách chơi</Text>
                            <View className="gap-2 mb-6">
                                {[
                                    { id: "casual", label: "Vui vẻ, xả stress mồ hôi là chính" },
                                    { id: "balanced", label: "Cân bằng, vừa vui vừa có tính đối kháng" },
                                    { id: "competitive", label: "Try-hard, đá giải, thắng thua rõ ràng" }
                                ].map((vibe) => (
                                    <TouchableOpacity 
                                        key={vibe.id} onPress={() => setPlayVibe(vibe.id)}
                                        className={`p-3 rounded-xl border ${playVibe === vibe.id ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/30' : 'bg-appSurface border-appText/10'}`}
                                    >
                                        <Text className={`text-sm ${playVibe === vibe.id ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-appText'}`}>{vibe.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Tần suất chơi */}
                            <Text className="text-base font-bold text-appText mb-3">4. Tần suất chơi</Text>
                            <View className="flex-row gap-2 mb-6">
                                {[
                                    { id: 1, label: "Ít chơi" },
                                    { id: 2, label: "Bình thường" },
                                    { id: 3, label: "Rất thường xuyên" }
                                ].map((freq) => (
                                    <TouchableOpacity 
                                        key={freq.id} onPress={() => setPlayFrequency(freq.id)}
                                        className={`flex-1 py-2 rounded-lg items-center border ${playFrequency === freq.id ? 'bg-emerald-100 border-emerald-500 dark:bg-emerald-900/50' : 'bg-appSurface border-appText/10'}`}
                                    >
                                        <Text className={`text-xs text-center ${playFrequency === freq.id ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-appText'}`}>{freq.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Ghi chú */}
                            <Text className="text-base font-bold text-appText mb-3">5. Ghi chú thêm (Tùy chọn)</Text>
                            <TextInput
                                className="w-full bg-appSurface border border-appText/10 rounded-xl p-3 text-appText min-h-[80px]"
                                placeholder="Ví dụ: Sở trường đá cánh trái, thuận tay phải..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                textAlignVertical="top"
                                value={note}
                                onChangeText={setNote}
                            />

                            <View className="h-20" />
                        </ScrollView>

                        <View className="p-4 border-t border-appText/10 bg-appBg">
                            <TouchableOpacity 
                                onPress={handleSubmitSkill} disabled={isSaving}
                                className="w-full py-4 rounded-xl bg-emerald-600 items-center justify-center"
                            >
                                {isSaving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Lưu kỹ năng</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
