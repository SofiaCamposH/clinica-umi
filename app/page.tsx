import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay sesión, al login
  if (!user) {
    redirect("/login");
  } 
  // Si ya tiene sesión, al dashboard
  else {
    redirect("/dashboard");
  }
}