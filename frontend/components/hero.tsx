"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, LinkIcon, Play, ExternalLink, Sparkles, Github, Cloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Checkbox } from "@/components/ui/checkbox" // Import Checkbox

export default function Hero() {
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testMode, setTestMode] = useState<"existing" | "generate">("existing")
  const [userArguments, setUserArguments] = useState("")
  const [githubToken, setGithubToken] = useState("")
  const [vercelToken, setVercelToken] = useState("")
  const [selectedTestTypes, setSelectedTestTypes] = useState<string[]>([
    "functional",
    "uiux",
    "accessibility",
    "compatibility",
    "performance",
  ]) // New state for selected test types

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleTestTypeChange = (type: string, checked: boolean) => {
    setSelectedTestTypes((prev) => (checked ? [...prev, type] : prev.filter((t) => t !== type)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!file) {
      alert("Please upload an SRS document.")
      setIsLoading(false)
      return
    }

    if (selectedTestTypes.length === 0) {
      alert("Please select at least one test type.")
      setIsLoading(false)
      return
    }

    // Get the current user's session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      alert("Please sign in to continue.")
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("srs_document", file)
    selectedTestTypes.forEach((type) => formData.append("test_types[]", type)) // Append selected test types

    let endpoint = ""
    let redirectUrl = ""

    if (testMode === "existing") {
      if (!url) {
        alert("Please enter a Figma or Website URL.")
        setIsLoading(false)
        return
      }
      formData.append("target_url", url)
      endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/test`
      redirectUrl = `/dashboard?url=${encodeURIComponent(url)}&document=${encodeURIComponent(file.name)}`
    } else {
      // testMode === "generate"
      if (!userArguments) {
        alert("Please provide arguments for website generation.")
        setIsLoading(false)
        return
      }
      if (!githubToken || !vercelToken) {
        alert("Please provide both GitHub and Vercel tokens for website generation and deployment.")
        setIsLoading(false)
        return
      }
      formData.append("user_arguments", userArguments)
      formData.append("github_token", githubToken)
      formData.append("vercel_token", vercelToken)
      endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/generate-and-test`
      redirectUrl = `/dashboard?document=${encodeURIComponent(file.name)}`
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      console.log("Backend response:", result)

      if (result.success) {
        // If website was generated, use its URL for redirection
        const finalUrl = result.deployed_url || url
        router.push(`${redirectUrl}&url=${encodeURIComponent(finalUrl)}&testRunId=${result.test_run_id}`)
      } else {
        alert(`Error: ${result.message || "Something went wrong."}`)
      }
    } catch (error: any) {
      console.error("Failed to submit form:", error)
      alert(`Failed to connect to the backend or process request: ${error.message}. Check console for details.`)
    } finally {
      setIsLoading(false)
    }
  }

  const testTypesOptions = [
    { id: "functional", label: "Functional Testing" },
    { id: "uiux", label: "UI/UX Testing" },
    { id: "accessibility", label: "Accessibility Testing" },
    { id: "compatibility", label: "Compatibility Testing" },
    { id: "performance", label: "Performance Testing" },
  ]

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6A5ACD]/20 rounded-full filter blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4B0082]/20 rounded-full filter blur-[100px] -z-10"></div>

      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6A5ACD] to-[#4B0082]">
            Validate Designs Against Requirements
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatically test your Figma designs and web applications against SRS documents to ensure compliance and
            consistency.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card/30 backdrop-blur-lg border border-border/50 rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden group">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6A5ACD]/5 to-[#4B0082]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="srs-upload" className="text-base font-medium mb-2 block">
                    Upload SRS Document <span className="text-red-500">*</span>
                  </Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300",
                      file ? "border-[#6A5ACD]/70 bg-[#6A5ACD]/5" : "border-border hover:border-muted-foreground/50",
                      "group/upload hover:shadow-[0_0_15px_rgba(106,90,205,0.1)]",
                    )}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#6A5ACD]/10 group-hover/upload:bg-[#6A5ACD]/20 transition-all duration-300">
                        <Upload className="h-8 w-8 text-[#6A5ACD] group-hover/upload:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {file ? (
                          <p className="font-medium text-[#6A5ACD]">{file.name}</p>
                        ) : (
                          <>
                            <p>Drag and drop or click to upload</p>
                            <p className="text-xs">(PDF, DOCX files accepted)</p>
                          </>
                        )}
                      </div>
                      <input
                        id="srs-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("srs-upload")?.click()}
                        className="border-[#6A5ACD]/50 text-[#6A5ACD] hover:bg-[#6A5ACD]/10 hover:text-[#6A5ACD] transition-all duration-300 bg-transparent"
                      >
                        {file ? "Change File" : "Select File"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-2 block">Choose Testing Mode</Label>
                  <RadioGroup
                    defaultValue="existing"
                    value={testMode}
                    onValueChange={(value: "existing" | "generate") => setTestMode(value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="mode-existing" />
                      <Label htmlFor="mode-existing">Test Existing URL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="generate" id="mode-generate" />
                      <Label htmlFor="mode-generate">Generate Website from SRS</Label>
                    </div>
                  </RadioGroup>
                </div>

                {testMode === "existing" && (
                  <div>
                    <Label htmlFor="url-input" className="text-base font-medium mb-2 block">
                      Enter Figma or Website URL <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1 group/input">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-[#6A5ACD] transition-colors duration-300" />
                        <Input
                          id="url-input"
                          type="url"
                          placeholder="https://figma.com/file/... or https://yourwebsite.com"
                          className="pl-10 border-border focus:border-[#6A5ACD] focus:ring-[#6A5ACD]/20 transition-all duration-300 backdrop-blur-sm bg-card/50"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          required={testMode === "existing"}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {testMode === "generate" && (
                  <>
                    <div>
                      <Label htmlFor="user-arguments" className="text-base font-medium mb-2 block">
                        User Arguments for Website Generation <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="user-arguments"
                        type="text"
                        placeholder="e.g., 'A simple blog page with a dark theme and a contact form.'"
                        className="border-border focus:border-[#6A5ACD] focus:ring-[#6A5ACD]/20 transition-all duration-300 backdrop-blur-sm bg-card/50"
                        value={userArguments}
                        onChange={(e) => setUserArguments(e.target.value)}
                        required={testMode === "generate"}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Describe the kind of website you want based on the SRS.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="github-token" className="text-base font-medium mb-2 block">
                        GitHub Personal Access Token <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative flex-1 group/input">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-[#6A5ACD] transition-colors duration-300" />
                        <Input
                          id="github-token"
                          type="password"
                          placeholder="ghp_YOUR_GITHUB_TOKEN"
                          className="pl-10 border-border focus:border-[#6A5ACD] focus:ring-[#6A5ACD]/20 transition-all duration-300 backdrop-blur-sm bg-card/50"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          required={testMode === "generate"}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Needed to create a new repository for your generated website.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="vercel-token" className="text-base font-medium mb-2 block">
                        Vercel API Token <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative flex-1 group/input">
                        <Cloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-[#6A5ACD] transition-colors duration-300" />
                        <Input
                          id="vercel-token"
                          type="password"
                          placeholder="YOUR_VERCEL_TOKEN"
                          className="pl-10 border-border focus:border-[#6A5ACD] focus:ring-[#6A5ACD]/20 transition-all duration-300 backdrop-blur-sm bg-card/50"
                          value={vercelToken}
                          onChange={(e) => setVercelToken(e.target.value)}
                          required={testMode === "generate"}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Needed to deploy your generated website to Vercel.
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-base font-medium mb-2 block">
                    Select Test Types <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {testTypesOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`test-type-${option.id}`}
                          checked={selectedTestTypes.includes(option.id)}
                          onCheckedChange={(checked) => handleTestTypeChange(option.id, checked as boolean)}
                        />
                        <Label htmlFor={`test-type-${option.id}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    className="w-full py-6 text-base bg-gradient-to-r from-[#6A5ACD] to-[#4B0082] hover:shadow-[0_0_20px_rgba(106,90,205,0.4)] transition-all duration-300 group/button"
                    disabled={
                      isLoading ||
                      !file ||
                      selectedTestTypes.length === 0 ||
                      (testMode === "existing" && !url) ||
                      (testMode === "generate" && (!userArguments || !githubToken || !vercelToken))
                    }
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {testMode === "existing" ? "Running Tests..." : "Generating & Deploying..."}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        {testMode === "existing" ? (
                          <Play className="mr-2 h-5 w-5 group-hover/button:translate-x-1 transition-transform duration-300" />
                        ) : (
                          <Sparkles className="mr-2 h-5 w-5 group-hover/button:scale-110 transition-transform duration-300" />
                        )}
                        {testMode === "existing" ? "Run Test" : "Generate & Test Website"}
                      </span>
                    )}
                  </Button>

                  {url && testMode === "existing" && (
                    <Button
                      type="button"
                      variant="outline"
                      className="sm:w-auto py-6 text-base border-[#6A5ACD]/50 text-[#6A5ACD] hover:bg-[#6A5ACD]/10 hover:text-[#6A5ACD] transition-all duration-300 group/view bg-transparent"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <span className="flex items-center">
                        <ExternalLink className="mr-2 h-5 w-5 group-hover/view:translate-x-1 transition-transform duration-300" />
                        View Live URL
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
