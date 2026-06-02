import { motion } from 'motion/react';

export function AnalysisSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="border-b border-[var(--border-subtle)] pb-16 mb-16 relative">
         <div className="absolute -top-12 left-0 right-0 h-px bg-[var(--border-subtle)] hidden lg:block -z-10" />
         
         <div className="flex flex-col mb-12">
            <div className="h-4 bg-[var(--surface-raised)] w-48 mb-6 rounded"></div>
            <div className="h-[4rem] sm:h-[5rem] lg:h-[7rem] bg-[var(--surface-raised)] w-3/4 max-w-[12ch] rounded"></div>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8">
            <div className="lg:col-span-5 flex flex-col justify-end">
               <div className="h-4 bg-[var(--surface-raised)] w-32 mb-6 rounded"></div>
               <div className="h-[5rem] lg:h-[6rem] bg-[var(--surface-raised)] w-48 rounded block"></div>
            </div>
            
            <div className="lg:col-span-7 pb-2 relative">
               <div className="absolute -left-8 top-0 bottom-0 w-px bg-[var(--border-subtle)] hidden lg:block" />
               <div className="h-4 bg-[var(--surface-raised)] w-32 mb-6 rounded"></div>
               <div className="h-[3.5rem] lg:h-[4rem] bg-[var(--surface-raised)] w-32 mb-6 rounded"></div>
               <div className="h-8 bg-[var(--surface-raised)] w-full max-w-2xl rounded mb-2"></div>
               <div className="h-8 bg-[var(--surface-raised)] w-4/5 max-w-2xl rounded"></div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative">
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--border-subtle)] hidden lg:block -z-10" />
          
          <div className="lg:col-span-6 lg:pr-8">
            <div className="h-4 bg-[var(--surface-raised)] w-40 mb-10 rounded"></div>
            <div className="flex flex-col gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-baseline border-b border-[var(--border-subtle)] pb-6">
                      <div className="h-6 bg-[var(--surface-raised)] w-24 rounded"></div>
                      <div className="h-[2.5rem] lg:h-[3.5rem] bg-[var(--surface-raised)] w-24 rounded"></div>
                  </div>
                ))}
                <div className="flex gap-16 pt-4">
                   <div>
                      <div className="h-3 bg-[var(--surface-raised)] w-16 mb-3 rounded"></div>
                      <div className="h-8 bg-[var(--surface-raised)] w-20 rounded"></div>
                   </div>
                   <div>
                      <div className="h-3 bg-[var(--surface-raised)] w-16 mb-3 rounded"></div>
                      <div className="h-8 bg-[var(--surface-raised)] w-20 rounded"></div>
                   </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col lg:pl-4">
              <div className="h-4 bg-[var(--surface-raised)] w-40 mb-10 rounded"></div>
               <ul className="flex flex-col gap-6 w-full">
                 {[1, 2, 3, 4].map((i) => (
                   <li key={i} className="flex justify-between items-end border-b border-[var(--border-subtle)] pb-4">
                     <div className="h-6 bg-[var(--surface-raised)] w-32 rounded"></div>
                     <div className="h-5 bg-[var(--surface-raised)] w-16 rounded"></div>
                   </li>
                 ))}
               </ul>
          </div>
      </div>
    </div>
  );
}
