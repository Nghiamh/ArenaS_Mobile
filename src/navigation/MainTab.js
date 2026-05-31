import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../features/discovery/screens/HomeScreen";
import SearchResultScreen from "../features/discovery/screens/SearchResultScreen";
import CourtDetailScreen from "../features/booking/screens/CourtDetailScreen";
import OwnerDashboardScreen from "../features/manager/screens/OwnerDashboardScreen";

const Tab = createBottomTabNavigator();

export default function MainTab() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: "#08101F" },
                headerTintColor: "#F5F7FA",
                tabBarStyle: { backgroundColor: "#111827", borderTopColor: "#1F2937" },
                tabBarActiveTintColor: "#FFB703",
                tabBarInactiveTintColor: "#94A3B8",
            }}
        >
            <Tab.Screen name="Trang chủ" component={HomeScreen} options={{ tabBarLabel: "Trang chủ" }} />
            <Tab.Screen name="Sân đấu" component={SearchResultScreen} options={{ tabBarLabel: "Sân đấu" }} />
            <Tab.Screen name="Đặt lịch" component={CourtDetailScreen} options={{ tabBarLabel: "Đặt lịch" }} />
            <Tab.Screen name="Hồ sơ" component={OwnerDashboardScreen} options={{ tabBarLabel: "Hồ sơ" }} />
        </Tab.Navigator>
    );
}
