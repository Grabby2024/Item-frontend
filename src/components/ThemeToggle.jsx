// ThemeToggle.jsx
import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const ThemeToggle = ({ darkMode, onToggle }) => {
    const theme = useTheme();

    return (
        <IconButton
            onClick={onToggle}
            sx={{
                position: 'absolute',
                left: 16,
                top: 16,
                backgroundColor: darkMode ? 'primary.main' : 'grey.200',
                color: darkMode ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                    backgroundColor: darkMode ? 'primary.dark' : 'grey.main',
                },
                zIndex: 10,
                transition: 'all 0.3s ease'
            }}
        >
            {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
    );
};

export default ThemeToggle;