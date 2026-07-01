import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, settheme] = useState(localStorage.getItem("theme") || "Light");

    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === "Dark") {
            root.classList.add("dark");
        }
        else {
            root.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        settheme(s => s === "Light"? "Dark" : "Light");
    }

    return (
        <ThemeContext value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);