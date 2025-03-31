"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, LinkIcon, Play, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function Hero() {
  const [url, setUrl] = useState("")
  const [choice, setChoice] = useState("1") 
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    if (!file || !url || !choice) {
      alert("Please select a file, enter a URL, and choose a test type before submitting.")
      setIsLoading(false)
      return
    }
  
    const formData = new FormData()
    formData.append("file", file)
    formData.append("url", url)
    formData.append("choice", choice) // Send selected test type
  
    try {
      const response = await fetch("http://127.0.0.1:5000/api/run_test", {
        method: "POST",
        body: formData,
      })
  
      const data = await response.json()
  
      if (response.ok) {
        alert("File, URL, and choice uploaded successfully!")
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert("Failed to upload. Please try again.")
      console.error("Upload Error:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  

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
                    Upload SRS Document
                  </Label>


                  <div className="flex items-center space-x-2 mb-4">
                  <RadioGroup
                    defaultValue="1"
                    className="flex items-center space-x-4"
                    onValueChange={(value) => setChoice(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="1" />
                      <Label htmlFor="1">Functional Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="2" />
                      <Label htmlFor="2">UI/UX Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="3" />
                      <Label htmlFor="3">Compatibility Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4" id="4" />
                      <Label htmlFor="4">Accessibility Testing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5" id="5" />
                      <Label htmlFor="5">Performance Testing</Label>
                    </div>
                  </RadioGroup>

                  </div>











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
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("srs-upload")?.click()}
                        className="border-[#6A5ACD]/50 text-[#6A5ACD] hover:bg-[#6A5ACD]/10 hover:text-[#6A5ACD] transition-all duration-300"
                      >
                        {file ? "Change File" : "Select File"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="url-input" className="text-base font-medium mb-2 block">
                    Enter Figma or Website URL
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
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    className="w-full py-6 text-base bg-gradient-to-r from-[#6A5ACD] to-[#4B0082] hover:shadow-[0_0_20px_rgba(106,90,205,0.4)] transition-all duration-300 group/button"
                    disabled={!file || !url || isLoading}
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
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Play className="mr-2 h-5 w-5 group-hover/button:translate-x-1 transition-transform duration-300" />
                        Run Test
                      </span>
                    )}
                  </Button>

                  {url && (
                    <Button
                      type="button"
                      variant="outline"
                      className="sm:w-auto py-6 text-base border-[#6A5ACD]/50 text-[#6A5ACD] hover:bg-[#6A5ACD]/10 hover:text-[#6A5ACD] transition-all duration-300 group/view"
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

