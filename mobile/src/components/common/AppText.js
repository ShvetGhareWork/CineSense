import React from 'react';
import { Text } from 'react-native';
import { typography } from '../../constants/theme';

const AppText = ({ variant = 'body', style, children, ...props }) => {
  // Get the typography style for the variant
  const variantStyle = typography[variant] || typography.body;
  
  return (
    <Text 
      style={[variantStyle, style]} 
      {...props}
    >
      {children}
    </Text>
  );
};

export default AppText;

