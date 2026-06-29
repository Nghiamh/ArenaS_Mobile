import "react-native-gesture-handler";
import "./global.css";

import { useState } from "react";
import { View } from "react-native";
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { useColorScheme } from "nativewind";

import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import MatchmakingOverlay from "./src/components/MatchmakingOverlay";
import { themeTokens } from "./src/constants/theme";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Disable Reanimated strict mode to hide "Writing to `value` during component render" 
// warnings caused by NativeWind v4 updating shared values during render.
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

export default function App() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const navigationRef = useNavigationContainerRef();
    const [currentRoute, setCurrentRoute] = useState("");
    const [isNavReady, setIsNavReady] = useState(false);

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
                    <View style={{ flex: 1 }}>
                        <NavigationContainer 
                            theme={navigationTheme}
                            ref={navigationRef}
                            onReady={() => {
                                setCurrentRoute(navigationRef.getCurrentRoute()?.name);
                                setIsNavReady(true);
                            }}
                            onStateChange={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
                        >
                            <StatusBar style={isDark ? "light" : "dark"} />
                            <AppNavigator />
                        </NavigationContainer>
                        {isNavReady && (
                            <MatchmakingOverlay currentRoute={currentRoute} navigationRef={navigationRef} />
                        )}
                    </View>
                </Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
