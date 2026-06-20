import React from 'react'
import * as RadixAvatar from '@radix-ui/react-avatar'

const getInitials = (name) => {
  if (!name) return 'M'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export default function Avatar({ src, name, size = 24, className = '' }) {
  const sizeClass = `w-${size} h-${size}`

  return (
    <RadixAvatar.Root className={`inline-flex items-center justify-center rounded-full overflow-hidden bg-surface-base ${className}`}>
      {src ? (
        <RadixAvatar.Image src={src} alt={name || 'Avatar'} className="object-cover w-full h-full" />
      ) : (
        <RadixAvatar.Fallback className="flex items-center justify-center w-full h-full text-lg font-bold text-foreground bg-primary/10">
          {getInitials(name)}
        </RadixAvatar.Fallback>
      )}
    </RadixAvatar.Root>
  )
}
