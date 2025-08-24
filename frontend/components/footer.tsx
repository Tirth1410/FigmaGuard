import Link from "next/link"
import { Linkedin, Mail, Github } from "lucide-react" 

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const githubRepoUrl = "https://github.com/P1Manav"
  const linkedinUrl = "https://www.linkedin.com/in/manavdprajapati/"
  const gmailUrl = "mailto:maxprajapati606@gmail.com" 

  return (
    <footer className="border-t border-border/40 bg-muted/10 backdrop-blur-sm py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#6A5ACD]/5 to-transparent pointer-events-none"></div>

      <div className="container px-4 mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column: Branding and Description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6A5ACD] to-[#4B0082] flex items-center justify-center shadow-[0_0_15px_rgba(106,90,205,0.5)]">
                <span className="text-white font-bold text-xl">FG</span>
              </div>
              <span className="font-bold text-xl">FigmaGuard</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Automated testing platform for validating designs and web applications against SRS documents.
            </p>
          </div>

          {/* Right Column: Social Links */}
          <div className="md:col-span-1 flex justify-start md:justify-end">
            <ul className="flex space-x-6">
              <li>
                <Link
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[#6A5ACD] transition-colors duration-300"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="h-6 w-6" />
                </Link>
              </li>
              <li>
                <Link
                  href={gmailUrl}
                  className="text-muted-foreground hover:text-[#6A5ACD] transition-colors duration-300"
                  aria-label="Send an Email"
                >
                  <Mail className="h-6 w-6" />
                </Link>
              </li>
              <li>
                <Link
                  href={githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[#6A5ACD] transition-colors duration-300"
                  aria-label="GitHub Repository"
                >
                  <Github className="h-6 w-6" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">&copy; {currentYear} FigmaGuard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
