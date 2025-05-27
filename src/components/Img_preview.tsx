import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Image, Button } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useLanguageStore } from '../store/useLanguageStore';
import { messages } from '../constants/messages';

interface Props {
  size: number
  url: string | null
  onUpload: (filePath: string) => void
}

export default function Img_preview({ url, size = 150, onUpload }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const imageSize = { height: size, width: size }

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)

      if (error) {
        throw error
      }

      const fr = new FileReader()
      fr.readAsDataURL(data)
      fr.onload = () => {
        setImageUrl(fr.result as string)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message)
      }
    }
  }

  const language = useLanguageStore((state) => state.language);
  const t = messages[language];

  return (
    <View>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          accessibilityLabel={t.recipeImage || 'Imagen de la receta'}
          style={[imageSize, styles.image, styles.image2]}
        />
      ) : (
        <View style={[imageSize, styles.image, styles.noImage]}>
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Button title={t.noImage || 'Sin imagen'} disabled />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 25,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  image2: {
    objectFit: 'cover',
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(200, 200, 200)',
    borderRadius: 5,
  },
})