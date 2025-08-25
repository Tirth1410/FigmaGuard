"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  Eye,
  FileText,
  Monitor,
  Terminal,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

const TestResults = ({ testData, testType }) => {
  const [expanded, setExpanded] = useState([])
  const [filter, setFilter] = useState("all")

  const toggleExpand = (id) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((item) => item !== id))
    } else {
      setExpanded([...expanded, id])
    }
  }

  // Use testData prop, or fallback to mock data if not provided (e.g., for initial load)
  const currentResults = testData || []

  const filteredResults = filter === "all" ? currentResults : currentResults.filter((test) => test.status === filter)

  const statusIcons = {
    pass: <CheckCircle className="h-5 w-5 text-green-500" />,
    fail: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  }

  const statusColors = {
    pass: "bg-green-500/10 border-green-500/30 text-green-500",
    fail: "bg-red-500/10 border-red-500/30 text-red-500",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
  }

  const typeIcons = {
    functional: <Code className="h-4 w-4" />,
    uiux: <Eye className="h-4 w-4" />,
    accessibility: <FileText className="h-4 w-4" />,
    compatibility: <Monitor className="h-4 w-4" />,
    performance: <Terminal className="h-4 w-4" />,
  }

  // Calculate test statistics
  const totalTests = currentResults.length
  const passedTests = currentResults.filter((test) => test.status === "pass").length
  const failedTests = currentResults.filter((test) => test.status === "fail").length
  const warningTests = currentResults.filter((test) => test.status === "warning").length

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-xl font-semibold">
          {testType === "all"
            ? "All Test Results"
            : testType === "uiux"
              ? "UI/UX Test Results"
              : `${testType.charAt(0).toUpperCase() + testType.slice(1)} Test Results`}
        </h3>
        <Button
          variant="outline"
          className="mt-2 sm:mt-0 border-[#6A5ACD]/30 hover:border-[#6A5ACD] hover:bg-[#6A5ACD]/5 bg-transparent"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Results
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card/50 rounded-lg p-4 border border-border/50 hover:border-[#6A5ACD]/30 hover:shadow-[0_0_15px_rgba(106,90,205,0.1)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">{totalTests}</span>
          </div>
        </div>
        <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20 hover:border-green-500/40 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Passed</span>
            <span className="text-2xl font-bold text-green-500">{passedTests}</span>
          </div>
        </div>
        <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Failed</span>
            <span className="text-2xl font-bold text-red-500">{failedTests}</span>
          </div>
        </div>
        <div className="bg-yellow-500/5 rounded-lg p-4 border border-yellow-500/20 hover:border-yellow-500/40 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Warnings</span>
            <span className="text-2xl font-bold text-yellow-500">{warningTests}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Test Cases</h4>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="bg-transparent border-none text-sm focus:outline-none focus:ring-0 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Results</option>
            <option value="pass">Passed Only</option>
            <option value="fail">Failed Only</option>
            <option value="warning">Warnings Only</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {filteredResults.length > 0 ? (
          filteredResults.map((test) => (
            <div
              key={test.id}
              className="border border-border/50 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#6A5ACD]/30 hover:shadow-[0_0_15px_rgba(106,90,205,0.1)]"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleExpand(test.id)}
              >
                <div className="flex items-center space-x-3">
                  {statusIcons[test.status as keyof typeof statusIcons]}
                  <span className="font-medium">{test.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {testType === "all" && (
                    <span className="hidden sm:flex items-center text-xs text-muted-foreground">
                      {typeIcons[test.type as keyof typeof typeIcons]}
                      <span className="ml-1">{test.type.charAt(0).toUpperCase() + test.type.slice(1)}</span>
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full border",
                      statusColors[test.status as keyof typeof statusColors],
                    )}
                  >
                    {test.status.toUpperCase()}
                  </span>
                  {expanded.includes(test.id) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expanded.includes(test.id) && (
                <div className="p-4 border-t border-border/50 bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                  <div className="bg-card/50 p-3 rounded border border-border/50 text-sm mb-3">{test.details}</div>
                  <div className="text-xs text-muted-foreground">
                    <strong>SRS Reference:</strong> {test.srsReference}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">No test results match the current filter.</div>
        )}
      </div>
    </div>
  )
}

export default TestResults
