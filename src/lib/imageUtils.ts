/**
 * Compress and resize an image File before upload.
 * Converts any format to JPEG and caps resolution at maxWidth/maxHeight.
 * Returns a new File with compressed content.
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number  // 0–1
  } = {}
): Promise<File> {
  const { maxWidth = 1600, maxHeight = 1200, quality = 0.82 } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Scale down proportionally if needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'))
            return
          }
          // Keep original filename but ensure .jpg extension
          const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
          resolve(new File([blob], name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }

    img.src = url
  })
}
