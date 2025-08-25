import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Hero from "@/components/hero"
import Features from "@/components/features"
import TestingProcess from "@/components/testing-process"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 transition-colors duration-300 dark">
      <ThemeProvider defaultTheme="dark" storageKey="figma-guard-theme">
        <Header />
        <main>
          <Hero />
          <Features />
          <TestingProcess />
        </main>
        <Footer />
      </ThemeProvider>
    </div>
  )
}
