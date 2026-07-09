"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Free",
    icon: Zap,
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    features: [
      "1 Resume",
      "Professional template",
      "Basic PDF export",
      "ATS-friendly format",
      "Email support",
    ],
    notIncluded: ["AI suggestions", "ATS score & review", "Multiple templates", "Priority support"],
    cta: "Get Started Free",
    href: "/auth/sign-up",
    highlight: false,
    color: "border-gray-200",
  },
  {
    name: "Premium",
    icon: Crown,
    price: { monthly: 9.99, yearly: 7.99 },
    description: "For serious job seekers",
    features: [
      "Unlimited resumes",
      "All premium templates",
      "AI summary generator",
      "AI bullet points",
      "ATS score & review",
      "Missing keywords analysis",
      "Advanced PDF export",
      "Priority support",
      "Arabic & English support",
    ],
    notIncluded: [],
    cta: "Start Premium",
    href: "/auth/sign-up?plan=premium",
    highlight: true,
    color: "border-blue-500",
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3"
          >
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Start free, upgrade when you need more power.
          </motion.p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !yearly ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                yearly ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const price = yearly ? plan.price.yearly : plan.price.monthly;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-white rounded-2xl p-8 border-2 ${plan.color} ${
                  plan.highlight ? "shadow-2xl shadow-blue-100 scale-105" : "shadow-md"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    ✨ Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.highlight ? "bg-blue-600" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${plan.highlight ? "text-white" : "text-gray-600"}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-black text-gray-900">
                    ${price === 0 ? "0" : price.toFixed(2)}
                  </span>
                  <span className="text-gray-500 ml-1">/month</span>
                  {yearly && price > 0 && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Billed ${(price * 12).toFixed(0)}/year — Save $
                      {((plan.price.monthly - price) * 12).toFixed(0)}
                    </div>
                  )}
                </div>

                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all mb-8 ${
                    plan.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
