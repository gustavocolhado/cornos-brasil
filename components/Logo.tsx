'use client'

import { useTheme } from '@/contexts/ThemeContext'
import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  const { theme } = useTheme()

  return (
    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
      <Image
        src={theme === 'dark' ? '/imgs/logo.png' : '/imgs/logo-dark.png'}
        alt="CORNOS BRASIL"
        width={180}
        height={180}
        className="w-full"
      />
    </Link>
  )
} 