"use client"

import React from "react"
import { Check, Smartphone, Info } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full bg-[#f2f4f7] md:bg-transparent overflow-hidden px-4 md:px-0 py-4 md:pr-4 pb-24 md:pb-4 gap-4">
      <div className="flex-1 overflow-y-auto w-full relative h-[calc(100vh-2rem)]">
        <div className="w-full flex flex-col xl:flex-row gap-5">
          
          {/* Left Column */}
          <div className="flex flex-col flex-1 gap-5">

            <div className="bg-[#dee1e5] rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.06)] border border-white/40">
              <h2 className="text-center text-subheading text-gray-900 mb-6">
                Overall Class Performance Summary
              </h2>
              
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">

                <div className="bg-[#2a2a2a] rounded-[24px] p-6 lg:w-[38%] flex flex-col items-center justify-between text-white shadow-[0_12px_40px_rgba(0,0,0,0.2)] shrink-0 min-h-[300px]">
                  <h3 className="text-normal mb-auto self-start text-gray-100">Submissions</h3>
                  <div className="relative w-full max-w-[200px] aspect-[2/1] mb-6 mt-6 flex flex-col items-center justify-end">
                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 50">
                      <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="#3a3a3a" strokeWidth="18" strokeLinecap="round" />
                      <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="#ff5a22" strokeWidth="18" strokeLinecap="round" strokeDasharray="141.37" strokeDashoffset="14.13" />
                    </svg>
                    <div className="absolute w-full bottom-0 flex flex-col items-center justify-end translate-y-2">
                      <div className="text-[40px] font-extrabold leading-none tracking-tight">
                        45<span className="text-[18px] font-medium text-gray-400">/50</span>
                      </div>
                      <div className="text-[12px] font-medium text-gray-400 mt-0.5">Submissions</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 mt-auto w-full px-2 text-[12px] font-medium">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-[#ff5a22]"></div>
                      <span className="text-gray-100">Submitted</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-[#3a3a3a]"></div>
                      <span className="text-gray-400">Not Submitted</span>
                    </div>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4 lg:gap-5 flex-1 w-full">
                  <div className="bg-white rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-gray-50">
                    <span className="text-[42px] font-extrabold text-[#11b76b] leading-tight tracking-tight mb-1">82%</span>
                    <span className="text-[14px] font-medium text-gray-600">Average Score</span>
                  </div>
                  <div className="bg-white rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-gray-50">
                    <span className="text-[42px] font-extrabold text-[#fc582e] leading-tight tracking-tight mb-1">95%</span>
                    <span className="text-[14px] font-medium text-gray-600">TopScore</span>
                  </div>
                  <div className="bg-white rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-gray-50">
                    <span className="text-[42px] font-extrabold text-[#2a2a2a] leading-tight tracking-tight mb-1">
                      20<span className="text-[24px] text-gray-900">/25</span>
                    </span>
                    <span className="text-[14px] font-medium text-gray-600">Class Median</span>
                  </div>
                  <div className="bg-white rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.03)] border border-gray-50">
                    <span className="text-[42px] font-extrabold text-[#a0a5b1] leading-tight tracking-tight mb-1">40%</span>
                    <span className="text-[14px] font-medium text-gray-600">Lowest Score</span>
                  </div>
                </div>
              </div>
            </div>


            <div className="bg-[#fe5b2b] rounded-[32px] flex flex-col lg:flex-row relative overflow-hidden shadow-[0_12px_40px_rgba(254,91,43,0.15)] p-3 gap-3 min-h-[260px]">
              <div className="bg-white rounded-[24px] px-8 py-6 lg:w-[62%] z-10 flex flex-col items-center justify-center h-full">
                <h2 className="text-center text-[15px] font-extrabold text-gray-900 mb-6 w-full tracking-tight">
                  Student Segmentation (Based on grades)
                </h2>
                <div className="grid grid-cols-4 gap-3 w-full max-w-[400px]">
                  <div className="bg-[#4ebf7b] rounded-[20px] p-4 flex flex-col items-center justify-center text-white text-center shadow-sm aspect-[4/6]">
                    <span className="text-[44px] font-extrabold leading-none mb-1">A</span>
                    <span className="text-[11px] font-semibold tracking-wide">12<br/>Students</span>
                  </div>
                  <div className="bg-[#fac748] rounded-[20px] p-4 flex flex-col items-center justify-center text-white text-center shadow-sm aspect-[4/6]">
                    <span className="text-[44px] font-extrabold leading-none mb-1">B</span>
                    <span className="text-[11px] font-semibold tracking-wide">15<br/>Students</span>
                  </div>
                  <div className="bg-[#fa8550] rounded-[20px] p-4 flex flex-col items-center justify-center text-white text-center shadow-sm aspect-[4/6]">
                    <span className="text-[44px] font-extrabold leading-none mb-1">C</span>
                    <span className="text-[11px] font-semibold tracking-wide">13<br/>Students</span>
                  </div>
                  <div className="bg-[#cd5c6f] rounded-[20px] p-4 flex flex-col items-center justify-center text-white text-center shadow-sm aspect-[4/6] relative">
                    <span className="absolute top-3 text-[9px] font-bold text-white/90 uppercase tracking-wider">Below</span>
                    <span className="text-[44px] font-extrabold leading-none top-2 relative mb-1 mt-1">D</span>
                    <span className="text-[11px] font-semibold tracking-wide top-2 relative">10<br/>Students</span>
                  </div>
                </div>
              </div>
              <div className="lg:flex-1 h-32 lg:h-auto flex items-center justify-center relative shrink-0">

                <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none">
                  <div className="w-[280px] h-[280px] rounded-full border border-white/20 absolute"></div>
                  <div className="w-[200px] h-[200px] rounded-full border border-white/30 absolute"></div>
                  <div className="w-[140px] h-[140px] rounded-full bg-white/10 absolute"></div>
                </div>

                <div className="relative z-10 w-[100px] h-[100px] rounded-full bg-white border border-gray-100 flex items-center justify-center p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#fafafa]">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Teacher&backgroundColor=transparent" alt="Teacher" className="w-[130%] h-[130%] object-cover -translate-y-2 -translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
            

            <div className="w-full flex justify-center mt-2 mb-4 relative z-0">
              <div className="bg-white/80 backdrop-blur-3xl rounded-[32px] p-6 lg:p-8 lg:w-[85%] shadow-[0_12px_40px_rgba(0,0,0,0.04)] w-full relative overflow-hidden border border-white/50">
                <h2 className="text-[17px] font-extrabold text-gray-900 mb-6">
                  AI Feedback Summary
                </h2>
                <div className="flex flex-col gap-4 relative z-10 px-1">
                  <div className="flex items-center gap-5">
                    <div className="w-[34px] h-[34px] rounded-full bg-[#34c759] flex items-center justify-center shrink-0">
                      <Check size={20} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="text-[15px] font-semibold text-gray-700">
                      Assignment Graded : <span className="font-extrabold text-gray-900">87</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gray-100/80 w-full ml-12 my-0.5" />
                  
                  <div className="flex items-center gap-5">
                    <div className="w-[34px] h-[34px] rounded-full bg-[#111111] flex items-center justify-center shrink-0">
                      <Smartphone size={16} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-[15px] font-semibold text-gray-700">
                      Concept Understanding : <span className="font-extrabold text-gray-900">Strong</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gray-100/80 w-full ml-12 my-0.5" />

                  <div className="flex items-center gap-5">
                    <div className="w-[34px] h-[34px] rounded-full bg-[#ff5a22] flex items-center justify-center shrink-0">
                      <Info size={20} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="text-[15px] font-semibold text-gray-700">
                      Suggested Improvement : <span className="font-extrabold text-gray-900">Revise Ohm&apos;s Law</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>


          <div className="lg:w-[380px] shrink-0 bg-[#dee1e5] rounded-[32px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.06)] border border-white/40 flex flex-col gap-6">
            <h2 className="text-subheading text-gray-900 ml-1">
              Learning Gaps Analysis
            </h2>
            

            <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
              <h3 className="text-title text-gray-800 mb-5">
                Frequently missed concepts
              </h3>
              <ul className="flex flex-col gap-4 text-[13px] font-medium text-gray-800">
                <li className="flex justify-between items-center gap-3">
                  <span>1. Ohm&apos;s Law Application</span>
                  <span className="font-extrabold text-[#e02424]">23%</span>
                </li>
                <li className="flex justify-between items-center gap-3">
                  <span>2. Resistance in Parallel Circuits</span>
                  <span className="font-extrabold text-[#e02424]">18%</span>
                </li>
                <li className="flex justify-between items-center gap-3">
                  <span>3. Potential Difference and EMF</span>
                  <span className="font-extrabold text-[#e02424]">15%</span>
                </li>
                <li className="flex justify-between items-center gap-3">
                  <span>4. Interpreting Circuit Diagrams</span>
                  <span className="font-extrabold text-[#e02424]">12%</span>
                </li>
                <li className="flex justify-between items-center gap-3">
                  <span>5. Series vs Parallel Circuits</span>
                  <span className="font-extrabold text-[#e02424]">8%</span>
                </li>
              </ul>
            </div>


            <div className="bg-transparent rounded-[24px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex-1">
              <h3 className="text-title text-gray-800 mb-5">
                Recommended Actions for teachers
              </h3>
              <ul className="flex flex-col gap-4 text-[13px] font-medium text-gray-800 leading-snug">
                <li className="flex gap-2">
                  <span className="shrink-0 w-3 text-right">1.</span>
                  <span>Simran Kaur – Misinterprets series vs parallel logic; needs circuit-building demo.</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 w-3 text-right">2.</span>
                  <span>Revise in class : Ohm&apos;s Law – Use real-life problem-solving (e.g., fan, heater)</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 w-3 text-right">3.</span>
                  <span>Concept of Power – Clarify derivations and differences between formulas.</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 w-3 text-right">4.</span>
                  <span>Extra classes for students who scored less than D</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 w-3 text-right">5.</span>
                  <span>Extra classes for students who scored less than D</span>
                </li>
              </ul>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  )
}
