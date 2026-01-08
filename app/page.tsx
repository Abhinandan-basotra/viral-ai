import DashBoardButton from "@/components/DashBoardButton";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Video, Youtube, Instagram, Facebook, Sparkles, LayoutGrid } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

const sampleImages = [
  '/img1.jpeg',
  '/img2.jpeg',
  '/img3.jpeg',
]

async function Navbar({ user }: { user: any }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-yellow-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href='/'>
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Video className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                ViralAI
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {
              user && user.email ? (
                <>
                  <DashBoardButton/>
                  <Link href='/api/auth/signout'>
                    <button className="cursor-pointer px-5 py-2 text-white hover:text-yellow-400 transition-colors duration-300 font-medium bg-transparent border border-yellow-600 rounded-ful">
                      Logout
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <button className="cursor-pointer px-5 py-2 text-white hover:text-yellow-400 transition-colors duration-300 font-medium bg-transparent border border-yellow-600 rounded-full">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button
                      className="cursor-pointer px-6 py-2 bg-yellow-500 text-black rounded-full font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30"
                    >
                      Get Started
                    </button>
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
      <Navbar user={user} />
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <BackgroundBeams />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-block mb-4 px-4 py-2 border border-yellow-600/50 rounded-full bg-yellow-600/10">
              <Sparkles className="inline-block w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-yellow-500 text-sm font-medium">Powered by Gemini-2.0</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Create <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">viral faceless videos</span> on Auto-Pilot.
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Create AI Videos in minutes. Our AI creation tool creates viral AI videos for you.
            </p>
            {
              user && user.email ? null : (
                <Link href="/signup">
                  <button className="group relative px-8 py-4 bg-yellow-500 text-black rounded-full text-lg font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30">
                    Get Started →
                  </button>
                </Link>
              )
            }

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              {sampleImages.map((i) => (
                <div key={i} className="relative group overflow-hidden rounded-lg bg-gradient-to-br from-yellow-900/20 to-gray-900/40 backdrop-blur-sm border border-yellow-600/30 aspect-video hover:scale-105 transition-transform duration-300">
                  <img src={i} alt="Sample Video" className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Perfect For <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Every Platform</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400">Dominate social media with AI-powered content</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Youtube, name: "YouTube", color: "from-red-500 to-red-600", desc: "Shorts & Videos" },
              { icon: Instagram, name: "Instagram", color: "from-pink-500 to-purple-600", desc: "Reels & Stories" },
              { icon: Facebook, name: "Facebook", color: "from-blue-500 to-blue-600", desc: "Posts & Reels" },
              { icon: Video, name: "TikTok", color: "from-cyan-500 to-blue-600", desc: "Viral Content" }
            ].map((platform, i) => (
              <div key={i} className="group relative p-8 rounded-2xl bg-gradient-to-br from-yellow-900/10 to-gray-900/20 border border-yellow-600/20 hover:border-yellow-600/60 transition-all duration-300 hover:scale-105 text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${platform.color} flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}>
                  <platform.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{platform.name}</h3>
                <p className="text-gray-400">{platform.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {
        user && user.email ? null : (
          <div className="py-20 px-4 sm:px-6 lg:px-8 bg-yellow-900/10 border-t border-yellow-600/20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Ready to Go <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Viral</span>?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands of creators already making viral content with AI
              </p>
              <Link href="/signup">
                <button className="px-10 py-5 bg-yellow-500 text-black rounded-full text-xl font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-yellow-500/30">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        )
      }
    </div>
  );
}