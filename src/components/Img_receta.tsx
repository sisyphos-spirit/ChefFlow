import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Image, Text, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

interface Props {
  size: number
  url: string | null
  onUpload: (filePath: string) => void
}

export default function Img_receta({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
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

  async function uploadImage() {
    try {
      setUploading(true)

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.')
        return
      }

      const image = result.assets[0]
      console.log('Got image', image)

      if (!image.uri) {
        throw new Error('No image URI found!')
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())
      
      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const path = `${Date.now()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        })

      if (uploadError) {
        throw uploadError
      }

      onUpload(data.path)
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      } else {
        throw error
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <View>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          accessibilityLabel="Imagen de la receta"
          style={[imageSize, styles.image, styles.image2]}
        />
      ) : (
        <View style={[imageSize, styles.image, styles.noImage]} />
      )}
      <View>
        <TouchableOpacity
          onPress={uploadImage}
          disabled={uploading}
          style={{
            backgroundColor: uploading ? '#ccc' : '#007BFF',
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            {uploading ? 'Subiendo...' : 'Subir Imagen'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 5,
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