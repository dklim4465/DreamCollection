import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTopButton from "@/common/components/ScrollToTopButton";
import ChatWidget from "@/chat/components/ChatWidget";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <Navbar />

      <div className="max-w-container-max mx-auto px-margin-desktop py-stack-lg w-full flex-1">
        <main
          id="main-content"
          className="main-content flex flex-col gap-stack-xl min-w-0"
        >
          <Outlet />
        </main>
      </div>

      <Footer />

      <ScrollToTopButton />

      {/* 모바일 FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 md:hidden">
        <span className="material-symbols-outlined">add</span>
      </button>

      <ChatWidget />
    </div>
  );
}
