import { useNavigate, useParams } from "react-router-dom";
import {
  useCourseId,
  useGetLessonsByCourseId,
  useGetStudentsByCourseId,
} from "@/services/queries";
import { IconBadge } from "@/components/ui/icon-badge";
import { LayoutDashboard, ListChecks, UsersRound } from "lucide-react";
import { TitleForm } from "@/components/course-form/title-form";
import { DescriptionForm } from "@/components/course-form/description-form";
import LessonsForm from "@/components/course-form/lesson-form";
import { StudentsForm } from "@/components/course-form/student-form";
import { CourseActions } from "@/components/course-actions";

const CourseIdPage = () => {
  const navigate = useNavigate();

  const { courseId } = useParams();
  const {
    data: course,
    isLoading,
    isError,
    isFetched,
  } = useCourseId(courseId!);
  const { data: lessons } = useGetLessonsByCourseId(courseId!);

  const { data: studentsData } = useGetStudentsByCourseId(courseId!);

  let requiredFields;
  let totalFields;
  let completedFields;
  let completionText;

  if (isFetched && !isError) {
    requiredFields = [course?.title, course?.description];
    totalFields = requiredFields.length;
    completedFields = requiredFields.filter(Boolean).length;
    completionText = `(${completedFields}/${totalFields})`;
  }

  // const isComplete = requiredFields.every(Boolean);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    navigate("/");
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-slate-700">
            Complete all fields {completionText}
          </span>
        </div>
        <CourseActions courseId={courseId!} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h2 className="text-xl">Customize your course</h2>
          </div>
          <TitleForm initialData={course} courseId={course.courseId} />
          <DescriptionForm initialData={course} courseId={course.courseId} />
          <div className="pt-6">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={UsersRound} />
              <h2 className="text-xl">Student Management</h2>
            </div>
            <StudentsForm
              students={studentsData || []}
              courseId={course.courseId}
            />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecks} />
              <h2 className="text-xl">Lessons</h2>
            </div>
            <LessonsForm lessons={lessons || []} courseId={course.courseId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;
