import { useState } from 'react'

interface AssetImageProps {
  src: string
  alt: string
  size?: number
  fallback?: React.ReactNode
}

/** Small image with graceful fallback — used for division logos, trophy icons, etc. */
export default function AssetImage({ src, alt, size = 20, fallback = null }: AssetImageProps) {
  const [error, setError] = useState(false)
  if (error) return <>{fallback}</>
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ objectFit: 'contain', flexShrink: 0 }}
      onError={() => setError(true)}
    />
  )
}
