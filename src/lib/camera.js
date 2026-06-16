import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { supabase } from './supabase'

export async function pickAndUploadAvatar(userId) {
  let blob

  if (Capacitor.isNativePlatform()) {
    // Native: use device camera roll / camera
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      quality: 80,
      width: 400,
      height: 400,
      correctOrientation: true,
    })
    const base64 = photo.base64String
    const byteChars = atob(base64)
    const byteArr = new Uint8Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i)
    blob = new Blob([byteArr], { type: `image/${photo.format}` })
  } else {
    // Web: file input
    blob = await new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = e => resolve(e.target.files[0])
      input.click()
    })
  }

  if (!blob) return null

  const ext = blob.type.split('/')[1] || 'jpg'
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true })
  if (error) throw error

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
  return publicUrl
}
