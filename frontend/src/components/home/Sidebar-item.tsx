import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
  return (
    <Link to={href}>
      <button
        type="button"
        className={cn(
          "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
          true &&
            `dark:text-slate-200 dark:bg-sky-200/20 dark:hover:bg-sky-200/20 dark:hover:text-sky-700 text-gray-900 bg-gray-200/20 hover:bg-gray-200/20 hover:text-gray-900`
        )}
      >
        <div className="flex items-center gap-x-2 py-4">
          <Icon
            size={22}
            className={cn(
              "text-slate-500",
              true && `dark:text-sky-300 text-gray-900`
            )}
          />
          {label}
        </div>
        <div
          className={cn(
            "ml-auto opacity-0 border-2",
            true &&
              `dark:border-sky-700 dark:text-white border-gray-900 bg-gray-200/20 dark:bg-sky-200/20 h-full transition-all opacity-100`
          )}
        />
      </button>
    </Link>
  );
};

export default SidebarItem;
