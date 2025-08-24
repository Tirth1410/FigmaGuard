"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import UserDashboard from "@/components/user-dashboard"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-[#6A5ACD] animate-spin mb-4" />
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 transition-colors duration-300 dark">
      <ThemeProvider defaultTheme="dark" storageKey="figma-guard-theme">
        <Header />
        <main className="pt-24">
          <UserDashboard user={user} />
        </main>
        <Footer />
      </ThemeProvider>
    </div>
  )
}
