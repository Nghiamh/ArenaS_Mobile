import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../features/auth/screens/LoginScreen";
import RegisterScreen from "../features/auth/screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: "#08101F" },
                headerTintColor: "#F5F7FA",
                headerShadowVisible: false,
                contentStyle: { backgroundColor: "#08101F" },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Sign In" }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Create Account" }} />
        </Stack.Navigator>
    );
}
