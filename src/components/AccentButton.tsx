import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { GlobalStyles } from '../constants/GlobalStyles';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AccentButton: React.FC<Props> = ({ title, onPress, disabled, style, textStyle }) => (
  <TouchableOpacity
    style={[GlobalStyles.buttonAccent, style, disabled && { opacity: 0.6 }]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    <Text style={[GlobalStyles.textPrimary, { fontFamily: 'Nunito_700Bold' }, textStyle]}>{title}</Text>
  </TouchableOpacity>
);
