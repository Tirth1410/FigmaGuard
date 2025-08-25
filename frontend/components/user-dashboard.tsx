"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Plus,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface TestRequest {
  id: string
  srs_document_url: string
  target_url?: string
  generated_website_url?: string
  github_repo_url?: string
  vercel_deployment_url?: string
  user_arguments?: string
  created_at: string
  test_reports?: TestReport[]
}

interface TestReport {
  id: string
  status: string
  report_data: any
  created_at: string
}

export default function UserDashboard({ user }: { user: any }) {
  const [testRequests, setTestRequests] = useState<TestRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTestRequests()
  }, [])

  const fetchTestRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("test_requests")
        .select(`
          *,
          test_reports (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTestRequests(data || [])
    } catch (error) {
      console.error("Error fetching test requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const downloadReport = async (reportId: string) => {
    try {
      // Find the test report
      const testReport = testRequests.flatMap((req) => req.test_reports || []).find((report) => report.id === reportId)

      if (!testReport) {
        console.error("Test report not found")
        return
      }

      const reportData = {
        testId: testReport.id,
        timestamp: testReport.created_at,
        status: testReport.status,
        results: testReport.report_data,
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `test-report-${reportId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading report:", error)
    }
  }

  const deleteTestRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from("test_requests").delete().eq("id", requestId)

      if (error) throw error
      fetchTestRequests() // Refresh the list
    } catch (error) {
      console.error("Error deleting test request:", error)
    }
  }

  const completedTests = testRequests.filter((req) =>
    req.test_reports?.some((report) => report.status === "completed"),
  ).length

  const pendingTests = testRequests.filter((req) =>
    req.test_reports?.some((report) => report.status === "pending"),
  ).length

  const failedTests = testRequests.filter((req) =>
    req.test_reports?.some((report) => report.status === "failed"),
  ).length

  return (
    <section className="py-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#6A5ACD]/10 rounded-full filter blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-[#4B0082]/10 rounded-full filter blur-[100px] -z-10"></div>

      <div className="container px-4 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.user_metadata?.full_name || user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testRequests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{completedTests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingTests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{failedTests}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tests">Test History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tests</CardTitle>
                  <CardDescription>Your latest test results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testRequests.slice(0, 5).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium truncate">
                            {request.target_url || request.generated_website_url || "Generated Website"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {request.test_reports?.[0] && getStatusBadge(request.test_reports[0].status)}
                          {request.test_reports?.[0]?.status === "completed" && (
                            <Link href={`/test-results/${request.test_reports[0].id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Start a new test or manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/">
                    <Button className="w-full bg-gradient-to-r from-[#6A5ACD] to-[#4B0082]">
                      <Plus className="w-4 h-4 mr-2" />
                      Start New Test
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading test history...</div>
              ) : testRequests.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No tests yet</p>
                  <p className="text-muted-foreground mb-4">Start your first test to see results here</p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-[#6A5ACD] to-[#4B0082]">
                      <Plus className="w-4 h-4 mr-2" />
                      Start New Test
                    </Button>
                  </Link>
                </div>
              ) : (
                testRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {request.target_url ? "Existing URL Test" : "Generated Website Test"}
                          </CardTitle>
                          <CardDescription>
                            Created {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {request.test_reports?.[0] && getStatusBadge(request.test_reports[0].status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">SRS Document uploaded</span>
                        </div>
                        {request.target_url && (
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={request.target_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#6A5ACD] hover:underline truncate"
                            >
                              {request.target_url}
                            </a>
                          </div>
                        )}
                        {request.generated_website_url && (
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={request.generated_website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#6A5ACD] hover:underline truncate"
                            >
                              {request.generated_website_url}
                            </a>
                          </div>
                        )}
                        {request.user_arguments && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Generation Args:</strong> {request.user_arguments}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {request.test_reports?.[0]?.status === "completed" && (
                            <>
                              <Link href={`/test-results/${request.test_reports[0].id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View Results
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadReport(request.test_reports![0].id)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTestRequest(request.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
