import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-yellow-600/20">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <Card className="bg-black border-yellow-600/20">
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-10 p-8">

            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-3">
                About the Creator
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Built by a Computer Science student passionate about full-stack
                development, AI tools, and real-world products.
                <br />
                <span className="text-yellow-500 font-medium">
                  Actively seeking internship opportunities.
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-3">
                Connect
              </h3>
              <div className="flex flex-col gap-3">
                <Link href="https://github.com/Abhinandan-basotra" target="_blank">
                  <Button variant="ghost" className="cursor-pointer justify-start gap-2 hover:text-yellow-400 w-60">
                    <Github className="w-4 h-4" />
                    GitHub
                  </Button>
                </Link>

                <Link href="https://www.linkedin.com/in/abhinandan-basotra-b581422b7/" target="_blank">
                  <Button variant="ghost" className="cursor-pointer justify-start gap-2 hover:text-yellow-400 w-60">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                </Link>

                <Link href="mailto:abhinandanbasotra9@gmail.com">
                  <Button variant="ghost" className="cursor-pointer justify-start gap-2 hover:text-yellow-400 w-60">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-3">
                Contact
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Have an opportunity or feedback?
                <br />
                I’d love to connect.
              </p>
              <Link href="mailto:abhinandanbasotra9@gmail.com">
                <Button className="cursor-pointer bg-yellow-500 text-black hover:bg-yellow-400">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Me
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>

        <Separator className="my-8 bg-yellow-600/20" />

        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ViralAI · Built by a Student Developer
        </p>
      </div>
    </footer>
  );
}
