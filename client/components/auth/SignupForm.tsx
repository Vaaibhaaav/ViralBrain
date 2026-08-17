"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Platform } from "@/lib/types";

export const SignupForm: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["tiktok", "instagram"]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom cycling loading text
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingTexts = [
    "Setting up your workspace...",
    "Initializing your voice profile...",
    "Ready."
  ];

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const platformsList: { id: Platform; label: string }[] = [
    { id: "tiktok", label: "TikTok" },
    { id: "instagram", label: "Instagram" },
    { id: "youtube", label: "YouTube" },
    { id: "twitter", label: "Twitter" },
    { id: "linkedin", label: "LinkedIn" }
  ];

  // Password strength calculation (0 to 4 score)
  const getPasswordStrength = (): number => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= loadingTexts.length - 1) {
            clearInterval(timer);
            // Completed! Redirect to dashboard after a brief moment
            setTimeout(() => {
              router.push("/dashboard");
            }, 600);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;
    if (!fullName) {
      setNameError("Full name is required");
      isValid = false;
    } else {
      setNameError("");
    }

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
    setLoadingStep(0);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-[460px] p-12 bg-white border-[0.5px] border-sand shadow-premium rounded-lg text-center flex flex-col items-center justify-center min-h-[380px]">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative h-12 w-12 flex items-center justify-center">
            {/* Spinning ring outer */}
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-sage-deep/20 border-t-sage-deep" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-semibold text-ink transition-all duration-300">
              {loadingTexts[loadingStep]}
            </h3>
            <p className="text-[11px] text-ink-ghost tracking-wide uppercase font-medium">
              Step {loadingStep + 1} of 3
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[460px] p-10 bg-white border-[0.5px] border-sand shadow-premium rounded-lg">
      <div className="flex flex-col mb-6 text-left">
        <h2 className="font-serif text-[28px] font-bold text-ink leading-tight">
          Create account
        </h2>
        <p className="text-[13px] text-ink-light font-sans mt-1">
          Start generating content in your unique voice.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full name input */}
        <Input
          type="text"
          label="Full name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (nameError) setNameError("");
          }}
          placeholder="Sarah Jenkins"
          error={nameError}
        />

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
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-ink-light hover:text-ink focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password strength meter */}
        {password.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            <div className="flex justify-between items-center text-[10px] text-ink-ghost font-medium uppercase">
              <span>Password strength</span>
              <span className="font-semibold text-ink-light">
                {strength === 1 && "Weak"}
                {strength === 2 && "Fair"}
                {strength === 3 && "Good"}
                {strength === 4 && "Strong"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1">
              {[1, 2, 3, 4].map((step) => {
                const isActive = strength >= step;
                return (
                  <div
                    key={step}
                    className={`h-full rounded-pill transition-colors duration-300 ${
                      isActive
                        ? strength === 1
                          ? "bg-error"
                          : strength === 2
                          ? "bg-amber"
                          : strength === 3
                          ? "bg-sage"
                          : "bg-sage-deep"
                        : "bg-parchment"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Platform Selector chips */}
        <div className="flex flex-col pt-1">
          <label className="text-[13px] font-sans font-medium text-ink mb-2">
            What platforms are you creating for?
          </label>
          <div className="flex flex-wrap gap-2">
            {platformsList.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all duration-150 border-[0.5px] font-medium tracking-wide ${
                    isSelected
                      ? "bg-sage border-sage-deep text-sage-deep font-semibold"
                      : "bg-cream border-sand/40 text-ink-light hover:bg-blush"
                  }`}
                >
                  {platform.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full text-sm font-medium h-[46px] rounded-md mt-4"
        >
          Create my account
        </Button>
      </form>

      {/* Footer link */}
      <div className="text-center mt-6">
        <p className="text-[13px] text-ink-light">
          Already have an account?{" "}
          <Link href="/login" className="text-sage-deep font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default SignupForm;
