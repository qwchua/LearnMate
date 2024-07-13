import { useGetLesson } from "@/services/queries";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Video } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import LessonTitleForm from "@/components/lesson-form/lesson-title-form";
import LessonDescriptionForm from "@/components/lesson-form/lesson-desc-form";
import { LessonVideoForm } from "@/components/lesson-form/lesson-video-form";
import { LessonActions } from "@/components/lesson-actions";

const LessonIdPage = () => {
  const { courseId, lessonId } = useParams();

  const { data: lesson, isLoading } = useGetLesson(courseId!, lessonId!);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  //   const lesson = data?.data;
  //   if (isError) {
  //     navigate("/");
  //   }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              to={`/teacher/courses/${courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Lesson Setup</h1>
              </div>
              <LessonActions courseId={courseId!} lessonId={lessonId!} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl font-medium">Customize your lesson</h2>
              </div>
              <LessonTitleForm
                initialData={lesson}
                courseId={courseId!}
                chapterId={lessonId!}
              />
              <LessonDescriptionForm
                initialData={lesson}
                courseId={courseId!}
                chapterId={lessonId!}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl font-medium">Add a video</h2>
            </div>
            <LessonVideoForm
              videoUrl={lesson.videoURL || ""}
              courseId={courseId!}
              lessonId={lessonId!}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonIdPage;
