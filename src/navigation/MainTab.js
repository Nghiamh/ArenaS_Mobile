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
                headerStyle: { backgroundColor: "#08101F" },
                headerTintColor: "#F5F7FA",
                tabBarStyle: { backgroundColor: "#111827", borderTopColor: "#1F2937" },
                tabBarActiveTintColor: "#FFB703",
                tabBarInactiveTintColor: "#94A3B8",
            }}
        >
            <Tab.Screen name="Discover" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchResultScreen} />
            <Tab.Screen name="Booking" component={CourtDetailScreen} />
            <Tab.Screen name="Manager" component={OwnerDashboardScreen} />
        </Tab.Navigator>
    );
}
