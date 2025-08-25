"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import TestResults from "@/components/test-results"
import WebPreview from "@/components/web-preview"
import { Loader2 } from "lucide-react"

export default function TestDashboard() {
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [testData, setTestData] = useState<any>(null) // State to hold fetched test data
  const searchParams = useSearchParams()

  const url = searchParams.get("url") || "https://example.com"
  const documentName = searchParams.get("document") || "requirements.pdf"
  const testRunId = searchParams.get("testRunId") // New: Get testRunId from query params

  useEffect(() => {
    const fetchTestData = async () => {
      if (!testRunId) {
        setIsLoading(false)
        return // No test run ID, so nothing to fetch
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/test-results/${testRunId}`,
        )
        if (!response.ok) {
          throw new Error("Failed to fetch test results")
        }
        const data = await response.json()
        setTestData(data)
      } catch (error) {
        console.error("Error fetching test data:", error)
        // Handle error, maybe show an error message to the user
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestData()
  }, [testRunId])

  return (
    <section className="py-8 relative overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#6A5ACD]/10 rounded-full filter blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-[#4B0082]/10 rounded-full filter blur-[100px] -z-10"></div>

      <div className="container px-4 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test Results Dashboard</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
            <p>
              Testing: <span className="font-medium text-foreground">{url}</span>
            </p>
            <div className="hidden sm:block">•</div>
            <p>
              Document: <span className="font-medium text-foreground">{documentName}</span>
            </p>
          </div>
        </div>

        <div className="bg-card/30 backdrop-blur-lg border border-border/50 rounded-xl shadow-lg overflow-hidden">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border/50 bg-muted/20 backdrop-blur-sm px-4">
              <TabsList className="h-14 bg-transparent">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#6A5ACD]/10 data-[state=active]:text-[#6A5ACD] data-[state=active]:shadow-none rounded-md px-4"
                >
                  All Tests
                </TabsTrigger>
                <TabsTrigger
                  value="functional"
                  className="data-[state=active]:bg-[#6A5ACD]/10 data-[state=active]:text-[#6A5ACD] data-[state=active]:shadow-none rounded-md px-4"
                >
                  Functional Testing
                </TabsTrigger>
                <TabsTrigger
                  value="uiux"
                  className="data-[state=active]:bg-[#6A5ACD]/10 data-[state=active]:text-[#6A5ACD] data-[state=active]:shadow-none rounded-md px-4"
                >
                  UI/UX Testing
                </TabsTrigger>
                <TabsTrigger
                  value="accessibility"
                  className="data-[state=active]:bg-[#6A5ACD]/10 data-[state=active]:text-[#6A5ACD] data-[state=active]:shadow-none rounded-md px-4"
                >
                  Accessibility Testing
                </TabsTrigger>
                <TabsTrigger
                  value="compatibility"
                  className="data-[state=active]:bg-[#6A5ACD]/10 data-[state=active]:text-[#6A5ACD] data-[state=active]:shadow-none rounded-md px-4"
                >
                  Compatibility Testing
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="data-[state=active]:bg-[#6A5ACD]/10 data-[state=active]:text-[#6A5ACD] data-[state=active]:shadow-none rounded-md px-4"
                >
                  Performance Testing
                </TabsTrigger>
              </TabsList>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-20">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 text-[#6A5ACD] animate-spin mb-4" />
                  <p className="text-lg font-medium">Running tests...</p>
                  <p className="text-muted-foreground">This may take a few moments</p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-2">
                    <WebPreview url={url} />
                  </div>
                  <div className="lg:col-span-3">
                    <TabsContent value="all" className="mt-0">
                      <TestResults testType="all" testData={testData?.all} />
                    </TabsContent>
                    <TabsContent value="functional" className="mt-0">
                      <TestResults testType="functional" testData={testData?.functional} />
                    </TabsContent>
                    <TabsContent value="uiux" className="mt-0">
                      <TestResults testType="uiux" testData={testData?.uiux} />
                    </TabsContent>
                    <TabsContent value="accessibility" className="mt-0">
                      <TestResults testType="accessibility" testData={testData?.accessibility} />
                    </TabsContent>
                    <TabsContent value="compatibility" className="mt-0">
                      <TestResults testType="compatibility" testData={testData?.compatibility} />
                    </TabsContent>
                    <TabsContent value="performance" className="mt-0">
                      <TestResults testType="performance" testData={testData?.performance} />
                    </TabsContent>
                  </div>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </section>
  )
}
