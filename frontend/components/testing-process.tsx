"use client"

import { FileText, LinkIcon, Code, CheckCircle } from "lucide-react"

export default function TestingProcess() {
  const steps = [
    {
      icon: <FileText className="h-8 w-8 text-[#6A5ACD]" />,
      title: "Upload SRS Document",
      description: "Upload your Software Requirements Specification document in PDF or DOCX format.",
    },
    {
      icon: <LinkIcon className="h-8 w-8 text-[#6A5ACD]" />,
      title: "Provide Design or Website URL",
      description: "Enter the URL of your Figma design or web application to be tested, or generate one from SRS.",
    },
    {
      icon: <Code className="h-8 w-8 text-[#6A5ACD]" />,
      title: "Automated Testing",
      description: "Our system generates test cases and runs automated tests using Playwright.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-[#6A5ACD]" />,
      title: "Review Results",
      description: "Get detailed test reports showing compliance with requirements and areas for improvement.",
    },
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/10 backdrop-blur-sm">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#6A5ACD] to-[#4B0082]">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our simple four-step process makes testing your designs and applications against requirements effortless.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#6A5ACD] to-[#4B0082] hidden md:block"></div>

          <div className="space-y-12 md:space-y-0 relative">
            {steps.map((step, index) => (
              <div key={index} className="md:flex items-center">
                <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pr-16 text-right" : "md:pl-16 md:order-2"}`}>
                  <div
                    className={`bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#6A5ACD]/10 hover:border-[#6A5ACD]/30 ${index % 2 === 0 ? "ml-auto" : "mr-auto"} max-w-md`}
                  >
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                <div className="hidden md:flex items-center justify-center w-0">
                  <div className="w-12 h-12 rounded-full bg-card border-4 border-[#6A5ACD] flex items-center justify-center z-10 shadow-[0_0_15px_rgba(106,90,205,0.3)]">
                    <span className="font-bold text-lg">{index + 1}</span>
                  </div>
                </div>

                <div className={`md:w-1/2 ${index % 2 === 0 ? "md:order-3" : "md:pr-16 text-right"}`}>
                  <div className="md:hidden flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-card border-4 border-[#6A5ACD] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(106,90,205,0.3)]">
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center justify-center h-full">
                      <div className="w-16 h-16 rounded-full bg-card/80 backdrop-blur-sm border border-[#6A5ACD]/30 flex items-center justify-center shadow-lg shadow-[#6A5ACD]/10">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
