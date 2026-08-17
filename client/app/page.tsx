"use client"
import { fetchUserProfile } from "@/database/actions/user";
import { useUserStore } from "@/lib/userStore";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  redirect("/dashboard");
}
