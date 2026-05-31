import "react-native-gesture-handler";
import "./global.css";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { useColorScheme } from "nativewind";

import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { themeTokens } from "./src/constants/theme";

export default function App() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const navigationTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: isDark ? themeTokens.dark.bg : themeTokens.light.bg,
            card: isDark ? themeTokens.dark.surface : themeTokens.light.surface,
            text: isDark ? themeTokens.dark.text : themeTokens.light.text,
            border: isDark ? "#1F2937" : "#E2E8F0",
            primary: isDark ? themeTokens.dark.primary : themeTokens.light.primary,
            notification: isDark ? themeTokens.dark.accent : themeTokens.light.accent,
        },
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <Provider store={store}>
                    <NavigationContainer theme={navigationTheme}>
                        <StatusBar style={isDark ? "light" : "dark"} />
                        <AppNavigator />
                    </NavigationContainer>
                </Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
