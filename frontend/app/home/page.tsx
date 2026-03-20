"use client"

import React from "react"
import { Sparkles, MoreVertical, Plus, Users, ChevronRight, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col h-full bg-[#f2f4f7] md:bg-transparent overflow-hidden px-4 md:px-0 py-4 md:pr-4 pb-24 md:pb-4 gap-6">
      <div className="flex-1 overflow-y-auto w-full relative h-[calc(100vh-2rem)] flex flex-col gap-6">
        

        <div className="flex flex-col xl:flex-row gap-5">
          

          <div className="bg-white rounded-[32px] p-8 lg:p-10 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:w-full xl:w-[57%] min-h-[380px] border border-gray-50/50">
            

            <div className="flex items-start justify-between mb-8">
              <div className="flex flex-col">
                <h1 className="text-[34px] font-extrabold text-[#111111] mb-2 tracking-tight">Hi Madhur!</h1>
                <p className="text-[15px] font-medium text-[#9ca3af] max-w-[260px] leading-relaxed">
                  Welcome back, John. Here&apos;s your teaching summary
                </p>
              </div>
              
              <div className="relative w-[130px] h-[130px] flex items-center justify-center shrink-0">

                <div className="absolute inset-0 rounded-full bg-[#fef5f0] scale-[0.85] border border-[#fceee6]"></div>
                

                <div className="absolute top-4 right-2 w-3.5 h-3.5 rounded-full bg-[#fe5b2b] shadow-sm border-2 border-white"></div>
                <div className="absolute bottom-6 -left-1 w-3 h-3 rounded-full bg-[#fe5b2b] shadow-sm border-2 border-white"></div>
                <div className="absolute top-10 -right-2 w-2 h-2 rounded-full bg-[#fde1d3]"></div>
                

                <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-white z-10 flex items-center justify-center border-4 border-white shadow-md">
                   <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Jessica&backgroundColor=transparent" alt="Teacher Avatar" className="w-[140%] h-[140%] object-cover mt-4" />
                </div>
              </div>
            </div>

            <div className="bg-[#f9fafb] border border-gray-200 rounded-[28px] p-6 flex items-center justify-between mt-auto shadow-sm">
              <div className="flex flex-col pr-4">
                <h2 className="text-[20px] font-extrabold text-[#111111] mb-2 tracking-tight">AI Teacher&apos;s Toolkit</h2>
                <p className="text-[14px] font-medium text-[#7a818c] max-w-[340px] leading-relaxed">
                  Quickly create lesson plans, question papers, and curriculum-aligned teaching materials.
                </p>
              </div>
              <button className="bg-[#fe5b2b] text-white px-9 py-4 rounded-full font-bold text-[14.5px] shadow-[0_10px_30px_rgba(254,91,43,0.35)] hover:bg-[#eb4e1e] transition-colors shrink-0 ml-4">
                Continue Now
              </button>
            </div>
          </div>


          <div className="flex flex-col lg:flex-row xl:w-[43%] gap-5 h-full">

            <div className="bg-[#2a2a2a] rounded-[32px] p-8 flex flex-col items-center flex-1 shadow-[0_16px_40px_rgba(0,0,0,0.15)] shrink-0 min-h-[380px] justify-between border-0">
              <h3 className="text-[15.5px] font-extrabold text-white/90 tracking-tight">Reviewed this week</h3>
              
              <div className="relative w-full max-w-[210px] aspect-[2/1] mt-10 flex flex-col items-center justify-end">
                <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 50">
                  <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="#333333" strokeWidth="18" strokeLinecap="round" />
                  <path 
                    d="M 5 50 A 45 45 0 0 1 95 50" 
                    fill="none" 
                    stroke="#fe5b2b" 
                    strokeWidth="18" 
                    strokeLinecap="round" 
                    strokeDasharray="141.37" 
                    strokeDashoffset={141.37 * (1 - 0.858)} 
                  />
                  {/* Ending Star UI at the tip of the Progress */}
                  <g transform="translate(90.5, 30.5) rotate(25.6)">
                     <path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z" fill="white" />
                  </g>
                </svg>
                <div className="absolute w-full bottom-0 flex flex-col items-center justify-end translate-y-[6px]">
                  <div className="text-[54px] font-extrabold leading-none tracking-tighter text-white flex items-baseline">
                    103<span className="text-[21px] font-bold text-gray-400 ml-1">/ 120</span>
                  </div>
                  <div className="text-[13px] font-extrabold text-gray-400 mt-2 tracking-widest uppercase">Reviews</div>
                </div>
              </div>

              <button className="mt-10 bg-white text-gray-900 font-extrabold px-6 py-4 rounded-full text-[14.5px] w-full hover:bg-gray-50 transition-colors shadow-lg">
                Continue to classroom
              </button>
            </div>


            <div className="flex flex-col gap-5 flex-1 min-w-[200px]">

              <div className="bg-white rounded-[32px] p-6 flex flex-col items-center justify-center flex-1 shadow-[0_12px_44px_rgba(0,0,0,0.04)] min-h-[140px] border-0">
                <span className="text-[44px] font-extrabold text-[#111111] leading-none tracking-tight mb-2">81</span>
                <span className="text-[14px] font-[800] text-[#111111] text-center">Assignments Graded</span>
              </div>
              <div className="bg-[#303030] rounded-[32px] p-6 flex flex-col items-center justify-center flex-1 shadow-[0_16px_40px_rgba(42,42,42,0.2)] min-h-[140px] relative border-0">
                <span className="text-[13px] font-medium text-white/90 text-center mb-1.5">Time Saved By AI</span>
                <span className="text-[38px] font-extrabold text-white leading-none tracking-tight mb-2">6.7 hrs</span>
                <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-gray-400 text-center">
                  <span>1.5 hrs more than last week</span>
                  <TrendingUp size={14} className="text-[#4ebf7b] shrink-0 ml-1" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#4ebf7b] mr-3 shadow-[0_0_12px_rgba(78,191,123,0.6)] border-2 border-[#dcf4e5] blur-[0.5px]"></div>
            <h2 className="text-[21px] font-extrabold text-[#111111] tracking-tight">Recent Assignments</h2>
          </div>
          <button className="bg-[#1c1c1c] text-white pl-5 pr-4 py-2.5 rounded-full text-[13.5px] font-extrabold flex items-center transition-colors hover:bg-black shadow-[0_4px_16px_rgba(0,0,0,0.1)] h-11">
            View All <ChevronRight size={16} strokeWidth={3} className="ml-1" />
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100/50 flex flex-col relative overflow-hidden group">
             <div className="flex items-start justify-between">
                <div className="flex items-center">
                   <h3 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Quiz on Electricity</h3>
                   <span className="ml-3 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-[#dcf4e5] text-[#3ea468]">Active</span>
                </div>
                <button className="text-gray-500 hover:text-gray-900 transition-colors p-1">
                   <MoreVertical size={20} />
                </button>
             </div>
             <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 mt-1.5 ml-0.5">
                <Users size={14} className="mb-0.5" />
                <span>Class 10-A</span>
                <span className="mx-1">•</span>
                <span>Science</span>
             </div>
             <div className="flex items-end justify-between mt-10 w-full px-1">
                <div className="flex items-baseline gap-1.5">
                   <span className="text-[34px] font-extrabold text-gray-900 leading-none tracking-tight">50/50</span>
                   <span className="text-[13px] font-bold text-gray-400 mb-1">Submitted</span>
                </div>
                <div className="flex flex-col items-end gap-1.5 text-[12px] font-bold text-gray-400 pb-1">
                   <p className="tracking-tight"><span className="text-gray-900">Assigned on : </span>20-06-2025</p>
                   <p className="tracking-tight"><span className="text-gray-900">Due : </span>21-06-2025</p>
                </div>
             </div>
             <div className="w-full h-1 bg-[#fe5b2b] rounded-full mt-4 opacity-90"></div>
          </div>


          <div className="bg-white rounded-[32px] p-7 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border-0 flex flex-col relative overflow-hidden group">
             <div className="flex items-start justify-between">
                <div className="flex items-center">
                   <h3 className="text-[20px] font-extrabold text-[#111111] tracking-tight">Quiz on Electricity</h3>
                   <span className="ml-3 px-3.5 py-1.5 rounded-full text-[11px] font-[800] tracking-wide bg-[#f4f4f4] text-[#a0a0a0]">Closed</span>
                </div>
                <button className="text-gray-500 hover:text-gray-900 transition-colors pr-1">
                   <MoreVertical size={20} />
                </button>
             </div>
             <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 mt-1 ml-0.5">
                <Users size={14} className="mb-[1px]" />
                <span>Class 10-A</span>
                <span className="mx-1">•</span>
                <span>Science</span>
             </div>
             <div className="flex items-end justify-between mt-10 w-full">
                <div className="flex items-baseline gap-1.5 relative top-1.5">
                   <span className="text-[36px] font-extrabold text-[#111111] leading-none tracking-tight">50/50</span>
                   <span className="text-[13px] font-bold text-gray-400 mb-[4px]">Submitted</span>
                </div>
                <div className="flex flex-col items-end gap-1.5 text-[12px] font-[700] text-gray-400 pb-1">
                   <p className="tracking-tight"><span className="text-[#111111]">Assigned on : </span>20-06-2025</p>
                   <p className="tracking-tight"><span className="text-[#111111]">Due : </span>21-06-2025</p>
                </div>
             </div>
             <div className="w-full h-1 bg-[#fe5b2b] rounded-full mt-4"></div>
          </div>


          <div className="bg-white rounded-[32px] p-7 shadow-[0_12px_44px_rgba(0,0,0,0.04)] border-0 flex flex-col relative overflow-hidden group">
             <div className="flex items-start justify-between">
                <div className="flex items-center">
                   <h3 className="text-[20px] font-extrabold text-[#111111] tracking-tight">Quiz on Electricity</h3>
                   <span className="ml-3 px-3.5 py-1.5 rounded-full text-[11px] font-[800] tracking-wide bg-[#dcf4e5] text-[#3ea468]">Active</span>
                </div>
                <button className="text-gray-500 hover:text-gray-900 transition-colors pr-1">
                   <MoreVertical size={20} />
                </button>
             </div>
             <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 mt-1 ml-0.5">
                <Users size={14} className="mb-[1px]" />
                <span>Class 10-A</span>
                <span className="mx-1">•</span>
                <span>Science</span>
             </div>
             <div className="flex items-end justify-between mt-10 w-full">
                <div className="flex items-baseline gap-1.5 relative top-1.5">
                   <span className="text-[36px] font-extrabold text-[#111111] leading-none tracking-tight">50/50</span>
                   <span className="text-[13px] font-bold text-gray-400 mb-[4px]">Submitted</span>
                </div>
                <div className="flex flex-col items-end gap-1.5 text-[12px] font-[700] text-gray-400 pb-1">
                   <p className="tracking-tight"><span className="text-[#111111]">Assigned on : </span>20-06-2025</p>
                   <p className="tracking-tight"><span className="text-[#111111]">Due : </span>21-06-2025</p>
                </div>
             </div>
             <div className="w-full h-1 bg-[#fe5b2b] rounded-full mt-4"></div>
          </div>


          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100/50 flex flex-col relative overflow-hidden group">
             <div className="flex items-start justify-between">
                <div className="flex items-center">
                   <h3 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Quiz on Electricity</h3>
                   <span className="ml-3 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-[#f0f0f0] text-gray-500">Closed</span>
                </div>
                <button className="text-gray-500 hover:text-gray-900 transition-colors p-1">
                   <MoreVertical size={20} />
                </button>
             </div>
             <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 mt-1.5 ml-0.5">
                <Users size={14} className="mb-0.5" />
                <span>Class 10-A</span>
                <span className="mx-1">•</span>
                <span>Science</span>
             </div>
             <div className="flex items-end justify-between mt-10 w-full px-1">
                <div className="flex items-baseline gap-1.5">
                   <span className="text-[34px] font-extrabold text-gray-900 leading-none tracking-tight">50/50</span>
                   <span className="text-[13px] font-bold text-gray-400 mb-1">Submitted</span>
                </div>
                <div className="flex flex-col items-end gap-1.5 text-[12px] font-bold text-gray-400 pb-1">
                   <p className="tracking-tight"><span className="text-gray-900">Assigned on : </span>20-06-2025</p>
                   <p className="tracking-tight"><span className="text-gray-900">Due : </span>21-06-2025</p>
                </div>
             </div>
             <div className="w-full h-1 bg-[#fe5b2b] rounded-full mt-4 opacity-70"></div>
          </div>
        </div>


        <div className="bg-white rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between shadow-[0_12px_44px_rgba(0,0,0,0.04)] mt-1 w-full gap-4">
          <div className="flex items-center gap-3 md:ml-2 text-center md:text-left">
            <Sparkles size={20} strokeWidth={2.5} className="text-[#111111] shrink-0" />
            <span className="text-[16px] font-extrabold text-[#111111]">Manage your assignments and track submissions</span>
          </div>
          <button className="bg-[#1c1c1c] w-full md:w-auto text-white px-7 py-3 rounded-full text-[14px] font-bold flex items-center justify-center transition-colors hover:bg-black shrink-0">
            <Plus size={16} strokeWidth={3} className="mr-2" />
            Create Assignment
          </button>
        </div>

      </div>
    </div>
  )
}
