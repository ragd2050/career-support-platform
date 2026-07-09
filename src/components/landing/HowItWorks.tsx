"use client";

import { motion } from "framer-motion";
import { UserPlus, Edit3, Download, Rocket } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up free in seconds. No credit card required to get started.",
  },
  {
    step: "02",
    icon: Edit3,
    title: "Fill Your Information",
    description: "Enter your experience, skills, and education with AI assistance at every step.",
  },
  {
    step: "03",
    icon: Download,
    title: "Export Your Resume",
    description: "Download a pixel-perfect PDF resume ready to submit to any employer.",
  },
  {
    step: "04",
    icon: Rocket,
    title: "Land the Interview",
    description: "Apply with confidence knowing your resume is ATS-optimized and professionally designed.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900"
          >
            From Zero to Job-Ready in Minutes
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />

          {steps.map(({ step, icon: Icon, title, description }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center relative"
            >
              <div className="relative inline-flex mb-6">
                <div className="w-16 h-16 bg-white border-2 border-blue-100 rounded-2xl flex items-center justify-center shadow-md shadow-blue-50 mx-auto">
                  <Icon className="w-7 h-7 text-blue-600" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
