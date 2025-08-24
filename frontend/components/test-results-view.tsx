"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface TestResultsViewProps {
  testReport: {
    id: string
    status: string
    report_data: any
    created_at: string
    test_requests: {
      target_url?: string
      generated_website_url?: string
      srs_document_url: string
      user_arguments?: string
    }
  }
}

export default function TestResultsView({ testReport }: TestResultsViewProps) {
  const [expandedTests, setExpandedTests] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  const toggleExpanded = (testId: string) => {
    setExpandedTests((prev) => (prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">PASS</Badge>
      case "fail":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">FAIL</Badge>
      case "warning":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">WARNING</Badge>
      default:
        return <Badge variant="secondary">UNKNOWN</Badge>
    }
  }

  const downloadReport = () => {
    const reportData = {
      testId: testReport.id,
      url: testReport.test_requests.target_url || testReport.test_requests.generated_website_url,
      timestamp: testReport.created_at,
      results: testReport.report_data,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `test-report-${testReport.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const testUrl = testReport.test_requests.target_url || testReport.test_requests.generated_website_url
  const allTests = testReport.report_data?.all || []
  const functionalTests = testReport.report_data?.functional || []
  const uiuxTests = testReport.report_data?.uiux || []
  const accessibilityTests = testReport.report_data?.accessibility || []
  const compatibilityTests = testReport.report_data?.compatibility || []
  const performanceTests = testReport.report_data?.performance || []

  const renderTestList = (tests: any[]) => (
    <div className="space-y-4">
      {tests.map((test) => (
        <Card key={test.id} className="border border-border/50">
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleExpanded(test.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div>
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(test.status)}
                {expandedTests.includes(test.id) ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedTests.includes(test.id) && (
            <CardContent className="border-t border-border/50 bg-muted/20">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <p className="text-sm text-muted-foreground">{test.details}</p>
                </div>
                {test.srsReference && (
                  <div>
                    <h4 className="font-medium mb-2">SRS Reference</h4>
                    <p className="text-sm text-muted-foreground">{test.srsReference}</p>
                  </div>
                )}
                {test.type && (
                  <div>
                    <h4 className="font-medium mb-2">Test Type</h4>
                    <Badge variant="outline">{test.type}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )

  return (
    <section className="py-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#6A5ACD]/10 rounded-full filter blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-[#4B0082]/10 rounded-full filter blur-[100px] -z-10"></div>

      <div className="container px-4 mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Test Results</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <a
                    href={testUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6A5ACD] hover:underline"
                  >
                    {testUrl}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(testReport.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={downloadReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button asChild>
                <a href={testUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live Site
                </a>
              </Button>
            </div>
          </div>

          {/* Test Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allTests.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Passed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {allTests.filter((t) => t.status === "pass").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {allTests.filter((t) => t.status === "fail").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {allTests.filter((t) => t.status === "warning").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={
                    testReport.status === "completed"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  }
                >
                  {testReport.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="functional">Functional</TabsTrigger>
            <TabsTrigger value="uiux">UI/UX</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {allTests.length > 0 ? (
              renderTestList(allTests)
            ) : (
              <div className="text-center py-8 text-muted-foreground">No test results available</div>
            )}
          </TabsContent>

          <TabsContent value="functional" className="mt-6">
            {functionalTests.length > 0 ? (
              renderTestList(functionalTests)
            ) : (
              <div className="text-center py-8 text-muted-foreground">No functional test results available</div>
            )}
          </TabsContent>

          <TabsContent value="uiux" className="mt-6">
            {uiuxTests.length > 0 ? (
              renderTestList(uiuxTests)
            ) : (
              <div className="text-center py-8 text-muted-foreground">No UI/UX test results available</div>
            )}
          </TabsContent>

          <TabsContent value="accessibility" className="mt-6">
            {accessibilityTests.length > 0 ? (
              renderTestList(accessibilityTests)
            ) : (
              <div className="text-center py-8 text-muted-foreground">No accessibility test results available</div>
            )}
          </TabsContent>

          <TabsContent value="compatibility" className="mt-6">
            {compatibilityTests.length > 0 ? (
              renderTestList(compatibilityTests)
            ) : (
              <div className="text-center py-8 text-muted-foreground">No compatibility test results available</div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            {performanceTests.length > 0 ? (
              renderTestList(performanceTests)
            ) : (
              <div className="text-center py-8 text-muted-foreground">No performance test results available</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
