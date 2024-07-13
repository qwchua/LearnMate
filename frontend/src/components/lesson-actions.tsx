import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { deleteLesson } from "@/services/api";
import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ChapterActionsProps {
  courseId: string;
  lessonId: string;
}

export const LessonActions = ({ courseId, lessonId }: ChapterActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await deleteLesson(courseId, lessonId);
      toast.success("Lesson deleted");
      navigate(`/teacher/courses/${courseId}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmModal onConfirm={onDelete}>
        <Button disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
