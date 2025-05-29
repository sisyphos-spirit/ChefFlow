import React from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { getGlobalStyles } from '../constants/GlobalStyles';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const SectionTitle: React.FC<Props> = ({ children, style }) => {
  const { colors } = useTheme();
  const styles = getGlobalStyles(colors);
  return (
    <Text style={[styles.sectionTitle, style]}>{children}</Text>
  );
};
