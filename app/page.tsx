import DashBoardButton from "@/components/DashBoardButton";
import Footer from "@/components/Footer";
import GetStartedButton from "@/components/GetStartedButton";
import LandingPageButtons from "@/components/LandingPageButtons";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Video, Youtube, Instagram, Facebook, Sparkles } from "lucide-react";
import { getServerSession, Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

const sampleImages = [
  '/img1.jpeg',
  '/img2.jpeg',
  '/img3.jpeg',
]

async function Navbar({ session }: { session: Session | null }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-yellow-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href='/'>
            <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Video className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                ViralAI
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {
              session?.user && session.user.email ? (
                <>
                  <DashBoardButton/>
                  <LandingPageButtons name="Logout"/>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <LandingPageButtons name="Login"/>
                  </Link>
                  <Link href="/signup" className="hidden xs:block">
                    <LandingPageButtons name="Get Started"/>
                  </Link>
                  <Link href="/signup" className="block xs:hidden">
                    <LandingPageButtons name="Get Started"/>
                  </Link>
                </>
              )
            }
          </div>
        </div>
      </div>
    </nav>
  );
}

export default async function Home() {
  const session = await getServerSession();
  const user = session?.user;
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar session={session} />
      
      {/* Hero Section */}
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-14 sm:pt-16">
        <BackgroundBeams />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="space-y-6 sm:space-y-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-yellow-600/50 rounded-full bg-yellow-600/10">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1.5 sm:mr-2" />
              <span className="text-yellow-500 text-xs sm:text-sm font-medium">Powered by Gemini-2.0</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight px-2">
              Create <span className="bg-linear-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">viral faceless videos</span> on Auto-Pilot.
            </h1>
            
            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
              Create AI Videos in minutes. Our AI creation tool creates viral AI videos for you.
            </p>
            
            {/* Sample Images Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 max-w-4xl mx-auto">
              {sampleImages.map((i) => (
                <div key={i} className="relative group overflow-hidden rounded-lg bg-linear-to-br from-yellow-900/20 to-gray-900/40 backdrop-blur-sm border border-yellow-600/30 aspect-video hover:scale-105 transition-transform duration-300">
                  <Image 
                    width={500} 
                    height={500} 
                    src={i} 
                    alt="Sample Video" 
                    className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Platforms Section */}
      <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
              Perfect For <span className="bg-linear-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Every Platform</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 px-4">Dominate social media with AI-powered content</p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { icon: Youtube, name: "YouTube", color: "from-red-500 to-red-600", desc: "Shorts & Videos" },
              { icon: Instagram, name: "Instagram", color: "from-pink-500 to-purple-600", desc: "Reels & Stories" },
              { icon: Facebook, name: "Facebook", color: "from-blue-500 to-blue-600", desc: "Posts & Reels" },
              { icon: Video, name: "TikTok", color: "from-cyan-500 to-blue-600", desc: "Viral Content" }
            ].map((platform, i) => (
              <div key={i} className="group relative p-6 sm:p-8 rounded-2xl bg-linear-to-br from-yellow-900/10 to-gray-900/20 border border-yellow-600/20 hover:border-yellow-600/60 transition-all duration-300 hover:scale-105 text-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-linear-to-br ${platform.color} flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}>
                  <platform.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{platform.name}</h3>
                <p className="text-sm sm:text-base text-gray-400">{platform.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {
        user && user.email ? null : (
          <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-yellow-900/10 border-t border-yellow-600/20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">
                Ready to Go <span className="bg-linear-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Viral</span>?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 px-4">
                Join thousands of creators already making viral content with AI
              </p>
              <Link href="/signup">
                <GetStartedButton/>
              </Link>
            </div>
          </div>
        )
      }
      <Footer/>
    </div>
  );
}