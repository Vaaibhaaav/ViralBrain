"use client"
import LandingPage from "@/components/landing-page/landing-page";
import { fetchUserProfile } from "@/database/actions/user";
import { useUserStore } from "@/lib/userStore";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { user } = useUser()
  // useEffect(() => {
  //   if (user?.id) {
  //     fetchUserProfile(user.id)
  //     redirect("/dashboard");
  //   }
  // }, [user])
  return <LandingPage />
}
