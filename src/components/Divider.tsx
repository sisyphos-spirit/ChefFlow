import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { GlobalStyles } from '../constants/GlobalStyles';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export const Divider: React.FC<Props> = ({ style }) => (
  <View style={[GlobalStyles.divider, style]} />
);
