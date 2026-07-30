import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function Layout() {
  return (
    <div className="min-h-screen bg-ig-bg">
      <Sidebar />
      <main className="md:ml-[245px] xl:ml-[335px] max-w-[935px] mx-auto pb-16 md:pb-0 pt-4">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
