import { ScrollArea } from "@/components/ui/scroll-area";
import { Lesson } from "@/types/types";
import { Grip, Pencil } from "lucide-react";
import React from "react";

interface LessonsListProps {
  lessons: Lesson[];
  onEdit: (id: string) => void;
}

const LessonsList = ({ lessons, onEdit }: LessonsListProps) => {
  return (
    <ScrollArea className="h-72 w-full rounded-md">
      <div className="p-4">
        {lessons.map((lesson) => (
          <React.Fragment key={lesson.lessonId}>
            <div
              key={lesson.lessonId}
              className={`flex items-center gap-x-2 bg-gray-200 border-gray-200 border text-gray-700 rounded-md mb-4 text-sm
              dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300
              "}`}
            >
              <div
                className={`px-2 py-3 border-r border-r-gray-200 hover:bg-gray-300 rounded-l-md transition
                                                dark:border-r-slate-800 dark:hover:bg-slate-700
                                                }
                                            `}
              >
                <Grip className="h-5 w-5" />
              </div>
              <div>{lesson.title}</div>
              <div className="ml-auto pr-2 flex items-center gap-x-2">
                <Pencil
                  onClick={() => onEdit(lesson.lessonId)}
                  className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                />
              </div>
            </div>
            {/* <Separator className="my-2" /> */}
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
};

export default LessonsList;
