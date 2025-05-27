import { View, StyleSheet, Text } from 'react-native';
import Img_preview from './Img_preview';
import type { Receta } from '../navigation/types';

export default function RecetaItem({ item }: {
    item: Receta;
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{item.titulo}</Text>
            <Img_preview size={285} url={item.imagen_url} onUpload={() => {}} />
        </View>
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