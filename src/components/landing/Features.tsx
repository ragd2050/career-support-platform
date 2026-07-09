"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  Brain,
  Download,
  Globe,
  BarChart2,
  Layers,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Writing",
    description:
      "Generate professional summaries, bullet points, and skill suggestions using advanced AI that understands your industry.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Shield,
    title: "ATS Optimization",
    description:
      "Our ATS scanner analyzes your resume against job descriptions and suggests keywords to beat applicant tracking systems.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Zap,
    title: "Instant PDF Export",
    description:
      "Generate pixel-perfect, print-ready PDF resumes in seconds. Professional quality guaranteed.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    icon: Globe,
    title: "Arabic & English",
    description:
      "Full bilingual support with proper RTL layout for Arabic and LTR for English. Perfect for MENA job market.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Layers,
    title: "Multiple Templates",
    description:
      "Choose from professionally designed templates crafted by HR experts and top designers.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: BarChart2,
    title: "Resume Analytics",
    description:
      "Track views, ATS scores, and get actionable insights to improve your resume performance.",
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description:
      "Export as PDF, DOCX, or share via unique public link. Compatible with all major job portals.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Clock,
    title: "Live Preview",
    description:
      "See your resume update in real-time as you type. No more guessing what the final output looks like.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3"
          >
            Why CareerSupport
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            Everything You Need to Land Your Dream Job
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Professional tools built for modern job seekers in the MENA region and beyond.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
              >
                <div
                  className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
