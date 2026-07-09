"use client";

import { motion } from "framer-motion";

export function TemplatePreview() {
  return (
    <section id="templates" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3"
          >
            Templates
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            Professional Resume Templates
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            ATS-friendly templates designed by hiring managers and career experts.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Professional", tag: "Most Popular", tagColor: "bg-blue-100 text-blue-700" },
            { name: "Executive", tag: "Premium", tagColor: "bg-purple-100 text-purple-700" },
            { name: "Modern", tag: "New", tagColor: "bg-green-100 text-green-700" },
          ].map(({ name, tag, tagColor }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* Miniature resume preview */}
              <div className="p-6 bg-gray-50 min-h-[280px]">
                <div className="bg-white rounded-lg shadow-md p-4 text-[7px]">
                  <div className={`${i === 0 ? "bg-gray-900" : i === 1 ? "bg-blue-900" : "bg-slate-800"} text-white p-3 rounded-md mb-3`}>
                    <div className="font-bold text-[9px] mb-0.5">Full Name</div>
                    <div className="opacity-70 text-[7px]">Professional Title</div>
                    <div className="opacity-50 text-[6px] mt-1">email@example.com | +966 50 000 0000</div>
                  </div>
                  {["SUMMARY", "SKILLS", "EXPERIENCE", "EDUCATION"].map((s) => (
                    <div key={s} className="mb-2">
                      <div className="font-bold text-gray-500 text-[6px] uppercase tracking-widest border-b border-gray-200 pb-0.5 mb-1">{s}</div>
                      <div className="space-y-0.5">
                        <div className="h-1 bg-gray-200 rounded w-full" />
                        <div className="h-1 bg-gray-200 rounded w-4/5" />
                        {s === "SKILLS" && (
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            {["React", "Node.js", "TypeScript", "AWS"].map(skill => (
                              <span key={skill} className="bg-gray-100 text-gray-600 px-1 rounded text-[5px]">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{name}</h3>
                    <p className="text-xs text-gray-500">ATS-Optimized</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tagColor}`}>
                    {tag}
                  </span>
                </div>
              </div>
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
