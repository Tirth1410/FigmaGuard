"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import TestResultsView from "@/components/test-results-view"
import { Loader2 } from "lucide-react"

export default function TestResultsPage() {
  const [testReport, setTestReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTestReport()
  }, [params.id])

  const fetchTestReport = async () => {
    try {
      const { data, error } = await supabase
        .from("test_reports")
        .select(`
          *,
          test_requests (*)
        `)
        .eq("id", params.id)
        .single()

      if (error) throw error
      if (!data) throw new Error("Test report not found")

      setTestReport(data)
    } catch (error: any) {
      console.error("Error fetching test report:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-[#6A5ACD] animate-spin mb-4" />
          <p className="text-lg font-medium">Loading test results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-[#6A5ACD] hover:underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 transition-colors duration-300 dark">
      <ThemeProvider defaultTheme="dark" storageKey="figma-guard-theme">
        <Header />
        <main className="pt-24">
          <TestResultsView testReport={testReport} />
        </main>
        <Footer />
      </ThemeProvider>
    </div>
  )
}
