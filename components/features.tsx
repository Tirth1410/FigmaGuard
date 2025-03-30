import { FileCheck, Layers, BarChart3, Zap, Fingerprint, Shield } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: <FileCheck className="h-10 w-10 text-white" />,
      title: "Automated Test Case Generation",
      description: "Automatically generate test cases from your SRS documents, saving hours of manual work.",
    },
    {
      icon: <Layers className="h-10 w-10 text-white" />,
      title: "SRS Compliance Check",
      description: "Verify that your designs and implementations meet all the requirements specified in your SRS.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-white" />,
      title: "Detailed Reports",
      description: "Get comprehensive reports with actionable insights to improve your designs and implementations.",
    },
    {
      icon: <Zap className="h-10 w-10 text-white" />,
      title: "UI Consistency Testing",
      description: "Ensure consistent UI elements across your entire application or design system.",
    },
    {
      icon: <Fingerprint className="h-10 w-10 text-white" />,
      title: "Accessibility Validation",
      description: "Automatically check for accessibility compliance against WCAG standards.",
    },
    {
      icon: <Shield className="h-10 w-10 text-white" />,
      title: "Regression Prevention",
      description: "Catch regressions early by comparing new designs against established requirements.",
    },
  ]

  return (
    <section id="features" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#6A5ACD]/10 rounded-full filter blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#4B0082]/10 rounded-full filter blur-[100px] -z-10"></div>

      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#6A5ACD] to-[#4B0082]">
            Key Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform offers powerful tools to streamline your testing process and ensure quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-[#6A5ACD]/80 to-[#4B0082]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-500 hover:shadow-lg hover:shadow-[#6A5ACD]/20 hover:translate-y-[-5px]"
            >
              <div className="mb-4 bg-white/10 w-16 h-16 rounded-full flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

