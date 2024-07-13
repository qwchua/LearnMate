import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/home/Navbar";
import { Sidebar } from "@/components/home/Sidebar";

const RootLayout = () => {
  return (
    <>
      <div className="h-full dark:bg-gray-900">
        <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50 dark:bg-gray-900">
          <Sidebar />
        </div>
        <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50 dark:bg-gray-900">
          <Navbar />
        </div>

        <main className="md:pl-56 pt-[80px] h-full dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default RootLayout;
