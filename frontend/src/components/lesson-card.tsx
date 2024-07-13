import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Lesson } from "@/types/types";

export const LessonCard = ({
  title,
  lessonId,
  createdAt,
  courseId,
}: Lesson) => {
  return (
    <Link to={`/courses/${courseId}/lessons/${lessonId}`}>
      <div className=" relative isolate my-4 flex flex-col gap-4 rounded-2xl border hover:bg-gray-100 lg:flex-row ">
        <div className="aspect-[16/9] sm:aspect-[2/1] lg:w-64 lg:shrink-0">
          <div className="relative w-full aspect-video rounded-md overflow-hidden">
            <img
              className="object-cover"
              alt={title}
              // src={"https://source.unsplash.com/random/" + lessonId}
              src={"https://picsum.photos/800/400?random=" + lessonId}
            />
          </div>
        </div>
        <div className="mt-2 flex w-full flex-col items-start overflow-hidden text-xs  max-lg:mx-2">
          <h1
            className={`max-w-md font-semibold leading-6 text-gray-900 group-hover:text-gray-600`}
          >
            {title}
          </h1>
          <div className="mt-1 flex max-h-6 items-start overflow-hidden text-sm">
            <li className="pl-2 text-sm text-gray-500"></li>
            <p className=" text-gray-600">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>

          <div className="relative mt-2 flex flex-row items-center gap-x-4"></div>
        </div>
      </div>

      {/* <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <img
            className="object-cover"
            alt={title}
            src={"https://source.unsplash.com/random/" + courseId}
            // src={"https://picsum.photos/800/400?random=" + id}
          />
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-xl md:text-base font-medium group-hover:text-sky-700 transition  dark:group-hover:text-sky-500  line-clamp-2">
            {title}
          </div>
          <div className="my-2 flex items-center gap-x-2 text-sm md:text-xs"></div>
        </div>
      </div> */}
    </Link>
  );
};
