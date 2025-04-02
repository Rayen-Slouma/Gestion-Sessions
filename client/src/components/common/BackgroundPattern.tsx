import React from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface BackgroundPatternProps {
  color?: string;
  opacity?: number;
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ 
  color = '#3b82f6',
  opacity = 0.05
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        opacity: opacity,
        background: `
          linear-gradient(90deg, ${alpha(color, 0.1)} 1px, transparent 1px),
          linear-gradient(${alpha(color, 0.1)} 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }}
    />
  );
};

export default BackgroundPattern;
