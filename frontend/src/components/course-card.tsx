import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { IconBadge } from "./ui/icon-badge";

interface CourseCardProps {
  courseId: string;
  title: string;
  teacher: boolean;
}

export const CourseCard = ({ courseId, title, teacher }: CourseCardProps) => {
  const link = teacher
    ? `/teacher/courses/${courseId}`
    : `/courses/${courseId}`;

  return (
    <Link to={link}>
      <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <img
            className="object-cover"
            alt={title}
            // src={"https://source.unsplash.com/random/" + courseId}
            src={"https://picsum.photos/800/400?random=" + courseId}
          />
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-xl md:text-base font-medium group-hover:text-sky-700 transition  dark:group-hover:text-sky-500  line-clamp-2">
            {title}
          </div>
          <div className="my-2 flex items-center gap-x-2 text-sm md:text-xs"></div>
        </div>
      </div>
    </Link>
  );
};
