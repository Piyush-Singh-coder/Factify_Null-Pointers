import React, { useState } from "react";
import { Bot, Mic, Server, Zap, Menu, FileText, Text } from "lucide-react";
import Verification from "../pages/Verification";
import Transcriber from "../pages/Transcriber";
import HealthCheck from "../pages/HealthCheck";
import { Link } from "react-router-dom";
import TextVerification from "../pages/TextVerification";

const Main = () => {
  const [currentPage, setCurrentPage] = useState("verify");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pages = {
    
    verify: { name: "Video Verify", icon: Zap, component: <Verification /> },
    Textverify: { name: "Content Verify", icon: Text, component: <TextVerification /> },
    transcribe: { name: "Transcriber", icon: Mic, component: <Transcriber /> },
    health: { name: "API Status", icon: Server, component: <HealthCheck /> },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-base-100 text-base-content">
      {/* --- Mobile Navbar --- */}
      
      <header className="flex items-center justify-between px-4 py-3 bg-base-200 border-b border-base-300 lg:hidden">
      <Link to = "/">
       <h1 className="text-lg font-bold text-primary" > Factify API</h1>
      </Link>
      
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* --- Sidebar --- */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static top-0 left-0 h-full lg:h-auto w-64 bg-base-200 border-r border-base-300 shadow-lg lg:shadow-none transform transition-transform duration-300 z-30`}
      >
        <div className="p-4 border-b border-base-300 hidden lg:block">
          <Link to ="/">
          <h1 className="text-lg font-bold text-primary">Factify API</h1>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {Object.entries(pages).map(([key, { name, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => {
                setCurrentPage(key);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === key
                  ? "bg-primary text-primary-content shadow-md"
                  : "hover:bg-base-300 text-base-content"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* --- Main Content --- */}
      <main className={currentPage !== 'landing' ? "flex-1 p-6 overflow-y-auto bg-base-100" : ""}>
        <div className="max-w-5xl mx-auto">
          {pages[currentPage].component}
        </div>
      </main>

      {/* --- Overlay for mobile sidebar --- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Main;
