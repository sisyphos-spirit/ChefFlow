import { View, StyleSheet } from 'react-native';
import Img_preview from './Img_preview';
import { AppCard } from './AppCard';
import { SectionTitle } from './SectionTitle';
import type { Receta } from '../navigation/types';
import { useTheme } from '../hooks/useTheme';

export default function RecetaItem({ item }: {
    item: Receta;
}) {
    const { colors } = useTheme();

    return (
        <AppCard style={{ marginHorizontal: 30, marginVertical: 10, backgroundColor: colors.secondary, borderColor: colors.primary }}>
            <SectionTitle style={{ textAlign: 'center', fontSize: 20, marginBottom: 10, color: colors.text }}>
                {item.titulo}
            </SectionTitle>
            <Img_preview size={285} url={item.imagen_url} onUpload={() => {}} />
        </AppCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 30,
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        paddingBlock: 20,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
});