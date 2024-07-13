// import { NavbarRoutes } from "@/components/navbar-routes";
import { NavbarRoutes } from "../Navbar-routes";

export const Navbar = () => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm">
      <NavbarRoutes />
    </div>
  );
};
