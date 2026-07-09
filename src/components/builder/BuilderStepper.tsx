"use client";

import { motion } from "framer-motion";
import { BuilderStep } from "@/types/resume";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  key: BuilderStep;
  label: string;
}

interface BuilderStepperProps {
  steps: Step[];
  currentStep: BuilderStep;
  onStepChange: (step: BuilderStep) => void;
  completedSteps: Set<BuilderStep>;
}

export function BuilderStepper({
  steps,
  currentStep,
  onStepChange,
  completedSteps,
}: BuilderStepperProps) {
  return (
    <div className="flex-shrink-0 overflow-x-auto border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#201A17] px-4 py-3">
      <div className="flex min-w-max items-center gap-2">
        {steps.map((step, i) => {
          const isDone = completedSteps.has(step.key);
          const isActive = step.key === currentStep;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onStepChange(step.key)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-[#8B1E24] text-white shadow-sm"
                  : isDone
                  ? "text-[#8B1E24] hover:bg-[#FEDFA4]/30"
                  : "text-gray-400 dark:text-[#7A716A] hover:bg-gray-50 dark:bg-[#2A2320] hover:text-[#8B1E24]"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-white dark:bg-[#201A17]/20 text-white"
                    : isDone
                    ? "bg-[#FEDFA4] text-[#8B1E24]"
                    : "bg-gray-100 dark:bg-[#2A2320] text-gray-400 dark:text-[#7A716A]"
                )}
              >
                {isDone ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </span>

              {step.label}

              {isActive && (
                <motion.div
                  layoutId="step-indicator"
                  className="absolute inset-0 -z-10 rounded-lg bg-[#8B1E24]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}