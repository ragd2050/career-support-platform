"use client";

interface StepWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function StepWrapper({ title, description, children }: StepWrapperProps) {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#F0EAE6]">{title}</h2>
        {description && <p className="text-sm text-gray-500 dark:text-[#8A8078] mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}