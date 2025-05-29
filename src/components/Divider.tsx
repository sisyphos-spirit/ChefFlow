import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getGlobalStyles } from '../constants/GlobalStyles';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export const Divider: React.FC<Props> = ({ style }) => {
  const { colors } = useTheme();
  const styles = getGlobalStyles(colors);
  return <View style={[styles.divider, style]} />;
};
