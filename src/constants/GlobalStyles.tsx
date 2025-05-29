import { StyleSheet } from 'react-native'

// Recibe los colores del tema activo y devuelve los estilos globales
export const getGlobalStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    fontFamily: 'Poppins-Bold',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 8,
    fontFamily: 'Nunito-Regular',
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
    color: colors.text,
  },
  buttonPrimary: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginBottom: 8, // Facilita la separación entre botones
    marginVertical: 2,
  },
  buttonSecondary: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
    borderWidth: 1,
    marginVertical: 2,
  },
  buttonAccent: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  textPrimary: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: colors.text,
  },
  textSecondary: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: colors.placeholder,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: 20,
    backgroundColor: colors.background,
  },
});