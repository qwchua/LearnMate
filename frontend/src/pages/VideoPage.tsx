import { VideoContextProvider } from "@/components/VideoContext";
import VideoPlayer from "@/components/VideoPlayer";
import ChatWrapper from "@/components/chat/ChatWrapper";
import { Navbar } from "@/components/home/Navbar";
import { Logo } from "@/components/logo";
import { useCourseId, useGetLesson } from "@/services/queries";
import { useParams } from "react-router-dom";

export const VideoPage = () => {
  const { courseId, lessonId } = useParams();
  const { data: lesson } = useGetLesson(courseId!, lessonId!);
  const { data: course } = useCourseId(courseId!);

  return (
    <>
      <div className="h-[80px] inset-y-0 w-full z-50 dark:bg-gray-900 flex items-center justify-between">
        <div className="p-6">
          <Logo />
        </div>
        <Navbar />
      </div>
      <div className="flex-1 justify-between flex flex-col h-[calc(100vh)]">
        <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
          <VideoContextProvider>
            <div className="flex-[1.75] xl:flex">
              <div className=" px-4 py-6 max-h-screen p-4 overflow-scroll flex-[1.75]">
                <VideoPlayer {...lesson} />
                <div className="py-4">
                  <h2 className="text-3xl font-medium">{lesson?.title}</h2>
                </div>
                <p className="text-base text-slate-600">
                  {lesson?.description}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
              <ChatWrapper lesson={lesson} courseTitle={course?.title} />
            </div>
          </VideoContextProvider>
        </div>
      </div>
    </>
  );
};
