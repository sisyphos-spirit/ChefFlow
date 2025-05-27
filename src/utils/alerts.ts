// Utilidades para mostrar alertas
import { Alert } from 'react-native';
import { useLanguageStore } from '../store/useLanguageStore';
import { messages } from '../constants/messages';

export function showError(message: string, title?: string) {
  const language = useLanguageStore.getState().language;
  const t = messages[language];
  Alert.alert(title || t.error, message);
};

export function showSuccess(message: string, title?: string) {
  const language = useLanguageStore.getState().language;
  const t = messages[language];
  Alert.alert(title || t.success, message);
};
