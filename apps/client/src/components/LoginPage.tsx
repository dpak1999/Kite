"use client";

import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [identifier, setIdentifier] = useState(""); // Email or username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [step, setStep] = useState<"signIn" | "2fa">("signIn");
  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");

    try {
      if (step === "signIn") {
        const result = await signIn.create({
          identifier,
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          // Force a router refresh to ensure auth state propogates
          router.refresh();
          router.push("/");
        } else if (result.status === "needs_second_factor") {
          // Find the email code strategy (we only support email)
          const emailFactor = result.supportedSecondFactors?.find(
            (f) => f.strategy === "email_code",
          );

          if (emailFactor) {
            await signIn.prepareSecondFactor({
              strategy: "email_code",
              emailAddressId: emailFactor.emailAddressId,
            });
            setStep("2fa");
          } else {
            setError("2FA required but email factor not found.");
          }
        } else {
          // Handle other statuses
        }
      } else {
        // Handle 2FA submission (Email only)
        try {
          await signIn.attemptSecondFactor({
            strategy: "email_code",
            code,
          });
        } catch (err: any) {
          setError("Invalid code. Please try again.");
          return;
        }

        // Refectch to check status
        const result = signIn;

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.refresh();
          router.push("/");
        } else {
          setError("Invalid code. Please try again.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(
        step === "signIn"
          ? "Invalid user ID or password."
          : "Invalid verification code.",
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fbfbfb] px-4">
      <div className="w-full max-w-[440px] bg-white p-10 rounded-sm shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          {/* Logo SVG omitted for brevity, keeping existing structure */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-6"
          >
            <path
              d="M25 5L45 40H5L25 5Z" // Triangle shape
              fill="#ff5722"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-700">
            {step === "signIn" ? "Login to Kite" : "2FA Verification"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === "signIn" ? (
            <>
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Phone or User ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:border-gray-500 focus:ring-0 transition-colors placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:border-gray-500 focus:ring-0 transition-colors placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter Verification Code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:border-gray-500 focus:ring-0 transition-colors placeholder-gray-400"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the code sent to your phone/email.
              </p>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-xs text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-[#ff5722] text-white font-semibold py-3 rounded-md hover:bg-[#f4511e] transition-colors shadow-sm text-sm"
          >
            {step === "signIn" ? "Login" : "Verify & Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-[#387ed1] text-xs font-medium hover:text-[#2a62a3]"
          >
            Forgot user ID or password?
          </a>
        </div>
      </div>

      <div className="mt-8 flex gap-4 opacity-70">
        {/* App badges placeholders */}
        <div className="h-8 w-8 bg-gray-300 rounded-full" />
        <div className="h-8 w-8 bg-gray-300 rounded-full" />
      </div>

      <div className="mt-8 text-center space-y-2">
        <div className="text-gray-300 font-bold tracking-widest text-sm uppercase">
          Kite Client
        </div>
        <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
          Kite Client technology platform. Member of NSE, BSE, MCX. SEBI Reg.
          no. INZ000031633.
        </p>
        <div className="text-[10px] text-gray-400 mt-2">v3.0.0</div>
      </div>
    </div>
  );
}
