import { useAuth } from "../hooks/useAuth";

import AuthStack from "./AuthStack";
import MainTab from "./MainTab";

export default function AppNavigator() {
    const { token } = useAuth();

    return token ? <MainTab /> : <AuthStack />;
}
