import { CourseCard } from "@/components/course-card";
import { Course } from "@/types/types";

interface CoursesListProps {
  courses: Course[];
  teacher: boolean;
}

export const CoursesList = ({ courses, teacher }: CoursesListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {courses.map((course) => (
          <CourseCard
            key={course.courseId}
            courseId={course.courseId}
            title={course.title}
            teacher={teacher}
          />
        ))}
      </div>
      {courses.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No courses found
        </div>
      )}
    </div>
  );
};
