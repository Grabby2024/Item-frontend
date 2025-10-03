// AuthContainer.jsx
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './Theme';
import Login from './Login';
import Register from './Register';

const AuthContainer = () => {
    const [showRegister, setShowRegister] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Check for saved theme preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme) {
            setDarkMode(savedTheme === 'true');
        }
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (darkMode) {
            document.body.style.backgroundColor = theme.palette.background.default;
        } else {
            document.body.style.backgroundColor = '#f8f9fa';
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const handleToggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const handleLogin = (user) => {
        // Handle login logic
        console.log('User logged in:', user);
    };

    const handleRegister = (user) => {
        // Handle registration logic
        console.log('User registered:', user);
    };

    return (
        <ThemeProvider theme={theme}>
            <div>
                {showRegister ? (
                    <Register
                        onRegister={handleRegister}
                        onShowLogin={() => setShowRegister(false)}
                        darkMode={darkMode}
                        onToggleTheme={handleToggleTheme}
                    />
                ) : (
                    <Login
                        onLogin={handleLogin}
                        onShowRegister={() => setShowRegister(true)}
                        darkMode={darkMode}
                        onToggleTheme={handleToggleTheme}
                    />
                )}
            </div>
        </ThemeProvider>
    );
};

export default AuthContainer;