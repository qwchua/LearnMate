import { CoursesList } from "@/components/course-list";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useGetTeacherCourses } from "@/services/queries";

const ManageCourses = () => {
  const { data } = useGetTeacherCourses();
  return (
    <div>
      <div className="p-6">
        <Link to="/teacher/create">
          <Button>New Course</Button>
        </Link>
      </div>
      <CoursesList courses={data || []} teacher={true} />
    </div>
  );
};

export default ManageCourses;
