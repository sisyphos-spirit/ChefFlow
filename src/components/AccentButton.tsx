import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getGlobalStyles } from '../constants/GlobalStyles';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AccentButton: React.FC<Props> = ({ title, onPress, disabled, style, textStyle }) => {
  const { colors } = useTheme();
  const styles = getGlobalStyles(colors);
  return (
    <TouchableOpacity
      style={[styles.buttonAccent, style, disabled && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.textPrimary, { fontWeight: 'bold' }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};
