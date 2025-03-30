"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Results() {
  const [expanded, setExpanded] = useState<string[]>([])
  const [filter, setFilter] = useState<string>("all")

  const toggleExpand = (id: string) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((item) => item !== id))
    } else {
      setExpanded([...expanded, id])
    }
  }

  const testResults = [
    {
      id: "test-1",
      name: "Login Form Validation",
      status: "pass",
      description: "Verify that the login form validates email format correctly",
      details: "The login form correctly validates email format and shows appropriate error messages.",
    },
    {
      id: "test-2",
      name: "Color Contrast Ratio",
      status: "fail",
      description: "Check if text elements meet WCAG AA contrast requirements",
      details:
        "The button text (#FFFFFF) on background (#8A2BE2) has a contrast ratio of 2.94:1, which fails WCAG AA requirements of 4.5:1 for normal text.",
    },
    {
      id: "test-3",
      name: "Responsive Layout",
      status: "pass",
      description: "Verify that the layout adapts to different screen sizes",
      details: "The layout correctly adapts to mobile (320px), tablet (768px), and desktop (1280px) viewports.",
    },
    {
      id: "test-4",
      name: "Form Field Labels",
      status: "warning",
      description: "Check if all form fields have associated labels",
      details:
        "2 out of 5 form fields are missing explicit label associations. Consider adding proper label elements or aria-label attributes.",
    },
    {
      id: "test-5",
      name: "Navigation Menu",
      status: "pass",
      description: "Verify that navigation menu items match SRS requirements",
      details: "All required navigation items are present and correctly linked.",
    },
  ]

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

  const filteredResults = filter === "all" ? testResults : testResults.filter((test) => test.status === filter)

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#6A5ACD]/10 rounded-full filter blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-[#4B0082]/10 rounded-full filter blur-[100px] -z-10"></div>

      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#6A5ACD] to-[#4B0082]">
            Test Results
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            View detailed test results and insights to improve your designs and implementations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card/30 backdrop-blur-lg border border-border/50 rounded-xl p-6 md:p-8 shadow-lg mb-8 relative overflow-hidden group">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6A5ACD]/5 to-[#4B0082]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold">Test Summary</h3>
                <p className="text-muted-foreground">figma.com/file/example-design</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                <Button
                  className="bg-gradient-to-r from-[#6A5ACD] to-[#4B0082] hover:shadow-[0_0_15px_rgba(106,90,205,0.3)] transition-all duration-300"
                  onClick={() => window.open("https://figma.com/file/example-design", "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live URL
                </Button>
                <Button variant="outline" className="border-[#6A5ACD]/30 hover:border-[#6A5ACD] hover:bg-[#6A5ACD]/5">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-card/50 rounded-lg p-4 border border-border/50 hover:border-[#6A5ACD]/30 hover:shadow-[0_0_15px_rgba(106,90,205,0.1)] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Tests</span>
                  <span className="text-2xl font-bold">{testResults.length}</span>
                </div>
              </div>
              <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20 hover:border-green-500/40 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Passed</span>
                  <span className="text-2xl font-bold text-green-500">
                    {testResults.filter((test) => test.status === "pass").length}
                  </span>
                </div>
              </div>
              <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Failed</span>
                  <span className="text-2xl font-bold text-red-500">
                    {testResults.filter((test) => test.status === "fail").length}
                  </span>
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

            <div className="space-y-4">
              {filteredResults.map((test) => (
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
                      <div className="bg-card/50 p-3 rounded border border-border/50 text-sm">{test.details}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

