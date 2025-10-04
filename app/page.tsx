import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  
  return (
    <>
    <button>
      click me
    </button>
    </>
  );
}
