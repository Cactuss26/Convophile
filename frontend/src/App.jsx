import { BrowserRouter } from "react-router-dom"
import { routes } from "./components/routes"
import { AuthProvider } from "./components/context/AuthContext"
import { ThemeProvider } from "./components/ThemeContext";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    {routes}
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App
