"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, RefreshCw, Smartphone, Tablet, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

interface WebPreviewProps {
  url: string
}

export default function WebPreview({ url }: WebPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate iframe reload
    setTimeout(() => setIsLoading(false), 1000)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div
      className={cn(
        "bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden transition-all duration-300",
        isFullscreen ? "fixed inset-4 z-50" : "h-full",
      )}
    >
      <div className="border-b border-border/50 bg-muted/20 p-3 flex items-center justify-between">
        <h3 className="font-medium">Web Preview</h3>
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full", viewMode === "mobile" && "bg-[#6A5ACD]/10 text-[#6A5ACD]")}
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
              <span className="sr-only">Mobile View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full", viewMode === "tablet" && "bg-[#6A5ACD]/10 text-[#6A5ACD]")}
              onClick={() => setViewMode("tablet")}
            >
              <Tablet className="h-4 w-4" />
              <span className="sr-only">Tablet View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full", viewMode === "desktop" && "bg-[#6A5ACD]/10 text-[#6A5ACD]")}
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="h-4 w-4" />
              <span className="sr-only">Desktop View</span>
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleRefresh}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="sr-only">Toggle Fullscreen</span>
          </Button>
        </div>
      </div>
      <div className="relative bg-background/50 h-[500px] overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 transition-all duration-300 flex items-center justify-center",
            viewMode === "mobile" && "w-[375px] mx-auto",
            viewMode === "tablet" && "w-[768px] mx-auto",
          )}
        >
          <iframe
            src={url}
            className="w-full h-full border-0 bg-white"
            title="Web Preview"
            sandbox="allow-same-origin allow-scripts"
            loading="lazy"
          />
        </div>
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-[#6A5ACD] animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
