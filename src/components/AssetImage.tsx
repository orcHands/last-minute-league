import { useState } from 'react'

interface AssetImageProps {
  src: string
  alt: string
  size?: number
  /** Independent width/height box (overrides `size` per-axis). Use when the
   * asset's rendered HEIGHT needs to match across differently-shaped source
   * images (e.g. bowl logos) rather than forcing a uniform square box. */
  width?: number
  height?: number
  fallback?: React.ReactNode
  style?: React.CSSProperties
}

/** Small image with graceful fallback — used for division logos, trophy icons, etc. */
export default function AssetImage({ src, alt, size = 20, width, height, fallback = null, style }: AssetImageProps) {
  const [error, setError] = useState(false)
  if (error) return <>{fallback}</>
  return (
    <img
      src={src}
      alt={alt}
      width={width ?? size}
      height={height ?? size}
      style={{ objectFit: 'contain', flexShrink: 0, ...style }}
      onError={() => setError(true)}
    />
  )
}
