import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

import HomeScreen from "../features/discovery/screens/HomeScreen";
import SearchResultScreen from "../features/discovery/screens/SearchResultScreen";
import CourtDetailScreen from "../features/booking/screens/CourtDetailScreen";
import ProfileScreen from "../features/discovery/screens/ProfileScreen";
import PaymentScreen from "../features/booking/screens/PaymentScreen";

const Tab = createBottomTabNavigator();

export default function MainTab() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                headerStyle: { backgroundColor: isDark ? "#08101F" : "#F5F7FA" },
                headerTintColor: isDark ? "#F5F7FA" : "#0F172A",
                tabBarStyle: {
                    backgroundColor: isDark ? "#111827" : "#FFFFFF",
                    borderTopColor: isDark ? "#1F2937" : "#E2E8F0"
                },
                tabBarActiveTintColor: isDark ? "#FFFFFF" : "#000000",
                tabBarInactiveTintColor: isDark ? "#94A3B8" : "#64748B",
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === "Trang chủ") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "Tìm Sân") {
                        iconName = focused ? "search" : "search-outline";
                    } else if (route.name === "Đặt lịch") {
                        iconName = focused ? "calendar" : "calendar-outline";
                    } else if (route.name === "Hồ sơ") {
                        iconName = focused ? "person" : "person-outline";
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Trang chủ" component={HomeScreen} options={{ tabBarLabel: "Trang chủ" }} />
            <Tab.Screen name="Tìm Sân" component={SearchResultScreen} options={{ tabBarLabel: "Tìm Sân" }} />
            <Tab.Screen name="Đặt lịch" component={CourtDetailScreen} options={{ tabBarLabel: "Đặt lịch" }} />
            <Tab.Screen name="Hồ sơ" component={ProfileScreen} options={{ tabBarLabel: "Hồ sơ" }} />
            <Tab.Screen 
                name="Thanh toán" 
                component={PaymentScreen} 
                options={{ 
                    tabBarButton: () => null, 
                    tabBarItemStyle: { display: 'none' } 
                }} 
            />
        </Tab.Navigator>
    );
}
