"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GoogleIcon } from "@/components/ui/SocialIcons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation checks
    let isValid = true;
    if (!email) {
      setEmailError("Email address is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) return;

    setIsLoading(true);
    
    // Simulate sign in delay
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-[460px] p-10 bg-white border-[0.5px] border-sand shadow-premium rounded-lg">
      <div className="flex flex-col mb-8 text-left">
        <h2 className="font-serif text-[28px] font-bold text-ink leading-tight">
          Welcome back
        </h2>
        <p className="text-[13px] text-ink-light font-sans mt-1">
          Pick up where you left off.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email input */}
        <Input
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
          placeholder="you@example.com"
          error={emailError}
          disabled={isLoading}
        />

        {/* Password input */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError("");
            }}
            placeholder="••••••••"
            error={passwordError}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-ink-light hover:text-ink focus:outline-none"
            tabIndex={-1}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Forgot password */}
        <div className="flex items-center justify-end text-xs">
          <Link
            href="/forgot-password"
            className="text-sage-deep hover:underline font-medium text-[12px]"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit action */}
        <Button
          type="submit"
          className="w-full text-sm font-medium h-[46px] rounded-md mt-2"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t-[0.5px] border-sand/40"></div>
        <span className="flex-shrink mx-4 text-[11px] font-sans text-ink-ghost uppercase tracking-wider">
          or continue with
        </span>
        <div className="flex-grow border-t-[0.5px] border-sand/40"></div>
      </div>

      {/* Social log in */}
      <Button
        variant="secondary"
        onClick={() => {
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            router.push("/dashboard");
          }, 1000);
        }}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 border-[0.5px] border-sand bg-white text-ink text-sm font-medium hover:bg-blush h-[46px] rounded-md transition-colors"
      >
        <GoogleIcon className="h-4 w-4 text-ink-light" />
        <span>Continue with Google</span>
      </Button>

      {/* Footer redirection */}
      <div className="text-center mt-8">
        <p className="text-[13px] text-ink-light">
          New to ViralBrain?{" "}
          <Link href="/signup" className="text-sage-deep font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default LoginForm;
