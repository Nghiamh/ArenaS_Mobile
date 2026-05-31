import "react-native-gesture-handler";
import "./global.css";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { themeTokens } from "./src/constants/theme";

const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: themeTokens.dark.bg,
        card: themeTokens.dark.surface,
        text: themeTokens.dark.text,
        border: "#1F2937",
        primary: themeTokens.dark.primary,
        notification: themeTokens.dark.accent,
    },
};

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <Provider store={store}>
                    <NavigationContainer theme={navigationTheme}>
                        <StatusBar style="light" />
                        <AppNavigator />
                    </NavigationContainer>
                </Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
