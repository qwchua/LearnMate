import { LessonsList } from "@/components/lesson-list";
import { useCourseId, useGetLessonsByCourseId } from "@/services/queries";
import { useParams } from "react-router-dom";

const StudentsLessonPage = () => {
  const { courseId } = useParams();
  const { data } = useGetLessonsByCourseId(courseId!);
  const { data: course } = useCourseId(courseId!);
  // return (
  //   <div className="h-full dark:bg-gray-900">
  //     <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50 dark:bg-gray-900">
  //       <Navbar />
  //     </div>

  //     <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50 dark:bg-gray-900">
  //       <Sidebar />
  //     </div>
  //     {/* pt or pull top pushes the content down accounting for the height of the navbar
  //       1:26:33 / 10:41:03 - https://youtu.be/Big_aFLmekI?si=P2rTnadq2IYS_90F */}
  //     <main className="md:pl-56 pt-[80px] h-full dark:bg-gray-900"></main>
  //   </div>
  // );
  return (
    <>
      <h1 className="p-6 text-2xl">{course?.title}</h1>
      <LessonsList lessons={data || []} />
    </>
  );
};

export default StudentsLessonPage;
