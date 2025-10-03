// src/theme/Theme.js
import { createTheme } from "@mui/material/styles";

// 🎨 Modern Color Palette
const colors = {
    primary: {
        main: "#6366F1", // Indigo
        light: "#818CF8",
        dark: "#4F46E5",
        contrastText: "#ffffff",
    },
    secondary: {
        main: "#06B6D4", // Cyan
        light: "#67E8F9",
        dark: "#0891B2",
        contrastText: "#ffffff",
    },
    success: {
        main: "#22C55E", // Green
        light: "#4ADE80",
        dark: "#15803D",
        contrastText: "#ffffff",
    },
    error: {
        main: "#EF4444", // Red
        light: "#F87171",
        dark: "#B91C1C",
        contrastText: "#ffffff",
    },
    warning: {
        main: "#F59E0B", // Amber
        light: "#FBBF24",
        dark: "#B45309",
        contrastText: "#ffffff",
    },
    info: {
        main: "#3B82F6", // Blue
        light: "#60A5FA",
        dark: "#1D4ED8",
        contrastText: "#ffffff",
    },
    grey: {
        50: "#F9FAFB",
        100: "#F3F4F6",
        200: "#E5E7EB",
        300: "#D1D5DB",
        400: "#9CA3AF",
        500: "#6B7280",
        600: "#4B5563",
        700: "#374151",
        800: "#1F2937",
        900: "#111827",
    },
};

// 🌞 Light Theme
const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,
        background: {
            default: colors.grey[50],
            paper: "#ffffff",
        },
        text: {
            primary: colors.grey[900],
            secondary: colors.grey[600],
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        button: { textTransform: "none", fontWeight: 500 },
    },
    shape: { borderRadius: 10 },
});

// 🌙 Dark Theme
const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,
        background: {
            default: colors.grey[900],
            paper: colors.grey[800],
        },
        text: {
            primary: "#ffffff",
            secondary: colors.grey[400],
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        button: { textTransform: "none", fontWeight: 500 },
    },
    shape: { borderRadius: 10 },
});

// ✅ Exports
export { lightTheme, darkTheme, colors };
export default lightTheme; // <-- default theme
