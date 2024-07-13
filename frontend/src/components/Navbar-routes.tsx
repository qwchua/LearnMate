import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const NavbarRoutes = () => {
  const userRole = useUserRole();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const isTeacherPage = pathname?.startsWith("/teacher");
  const isPlayerPage = pathname?.startsWith("/courses");
  const isTeacher = userRole === "teacher";

  const goBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <>
      <div className="flex gap-x-2 ml-auto">
        {isTeacherPage || isPlayerPage ? (
          <Button size="sm" variant="ghost" onClick={goBack}>
            <LogOut className="h-4 w-4 mr-2" />
            Exit
          </Button>
        ) : isTeacher ? (
          <Link to="/teacher/courses">
            <Button size="sm" variant="ghost">
              Manage Courses
            </Button>
          </Link>
        ) : null}
      </div>
    </>
  );
};
