import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getGlobalStyles } from '../constants/GlobalStyles';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AppCard: React.FC<Props> = ({ children, style }) => {
  const { colors } = useTheme();
  const styles = getGlobalStyles(colors);
  return <View style={[styles.card, style]}>{children}</View>;
};
