import React from 'react';
import { TextInput, StyleProp, TextStyle, TextInputProps } from 'react-native';
import { getGlobalStyles } from '../constants/GlobalStyles';
import { useTheme } from '../hooks/useTheme';

interface Props extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

export const AppInput: React.FC<Props> = ({ style, ...rest }) => {
  const { colors } = useTheme();
  const styles = getGlobalStyles(colors);
  return (
    <TextInput
      style={[
        styles.input,
        style,
      ]}
      placeholderTextColor={colors.placeholder}
      {...rest}
    />
  );
};
