
import { ThemeProvider } from '@/components/theme-provider'

import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'





export const metadata: Metadata = {
  title: 'FigmaGuard',
  description: 'Test your Figma web app with FigmaGuard',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (

    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>

        {/* <header className="flex justify-end items-center p-4 gap-4 h-16"> */}
          {/* <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header> */}
        <body> {children}</body>

      </html>
    </ClerkProvider>
  )
}
