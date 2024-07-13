import { Library } from "lucide-react";
import SidebarItem from "./Sidebar-item";

const Routes = [
  {
    icon: Library,
    label: "Courses",
    href: "/",
  },
];

export const SidebarRoutes = () => {
  const routes = Routes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route, index) => (
        <SidebarItem
          key={index}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
