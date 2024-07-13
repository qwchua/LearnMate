import { Logo } from "./../logo.tsx";
import { SidebarRoutes } from "./Sidebar-routes.tsx";
import { SignoutButton } from "./SignOutButton.tsx";

export const Sidebar = () => {
  return (
    <>
      <div
        className={`h-full border-r flex flex-col overflow-y-auto bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white`}
      >
        <div className="p-6">
          <Logo />
        </div>
        <div className="flex flex-col w-full">
          <SidebarRoutes />
        </div>
        <div className="p-6 mt-auto">
          <SignoutButton />
        </div>
      </div>
    </>
  );
};
