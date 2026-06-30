import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <Navbar />

      <div className="max-w-container-max mx-auto px-margin-desktop flex gap-stack-lg py-stack-lg relative w-full flex-1">
        <Sidebar />
        <main className="flex-1 flex flex-col gap-stack-xl min-w-0">
          <Outlet />
        </main>
      </div>

      <Footer />

      {/* 모바일 FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 md:hidden">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
