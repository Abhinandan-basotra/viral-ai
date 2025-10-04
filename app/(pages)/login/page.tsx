import { getServerSession } from "next-auth";
import LoginForm from "./LoginForm";
import { redirect } from "next/navigation";

export default async function LoginPage(){
  const session = await getServerSession();

  if(session){
    redirect("/");
  }
  return <LoginForm />;
}