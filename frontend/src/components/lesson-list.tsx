import { Lesson } from "@/types/types";
import { LessonCard } from "./lesson-card";

interface LessonsListProps {
  lessons: Lesson[];
}

export const LessonsList = ({ lessons }: LessonsListProps) => {
  return (
    <div>
      <div className="pl-4">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.lessonId}
            lessonId={lesson.lessonId}
            courseId={lesson.courseId}
            title={lesson.title}
            createdAt={lesson.createdAt}
          />
        ))}
      </div>
      {lessons.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No lessons found
        </div>
      )}
    </div>
  );
};
