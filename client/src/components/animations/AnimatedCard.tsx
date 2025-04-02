import React from 'react';
import { Card, CardProps } from '@mui/material';
import { motion, MotionProps } from 'framer-motion';

// Create a properly typed motion component
const MotionCard = motion<CardProps>(Card);

interface AnimatedCardProps extends Omit<CardProps, keyof MotionProps> {
  delay?: number;
  children: React.ReactNode;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ delay = 0, children, ...props }) => {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{
        y: -5,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      {...props}
    >
      {children}
    </MotionCard>
  );
};

export default AnimatedCard;
