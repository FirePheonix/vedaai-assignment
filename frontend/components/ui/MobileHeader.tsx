import Image from "next/image";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";

export default function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between bg-white px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-b border-gray-100/50 w-full z-40 sticky top-0">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/vedaai-logo.svg" alt="VedaAI Logo" width={32} height={32} priority className="w-8 h-8 object-contain drop-shadow-sm" />
        <span className="text-heading text-lg text-gray-900 tracking-tight">VedaAI</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <button className="relative text-gray-600 hover:text-gray-900 transition-colors">
          <Bell size={20} strokeWidth={2} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full border-2 border-white translate-x-1/2 -translate-y-1/2"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shadow-sm border border-gray-100/50">
          <Image src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" width={32} height={32} unoptimized className="w-full h-full object-cover" />
        </div>
        <button className="text-gray-600 hover:text-gray-900 transition-colors">
          <Menu size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
