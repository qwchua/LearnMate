import { Pencil, PlusCircle, Video } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import ReactPlayer from "react-player";
import FileUpload from "./fileupload";

interface LessonVideoFormProps {
  courseId: string;
  lessonId: string;
  videoUrl?: string;
}

export const LessonVideoForm = ({
  videoUrl,
  courseId,
  lessonId,
}: LessonVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4  dark:bg-gray-800 dark:text-slate-300">
      <div className="font-medium flex items-center justify-between">
        Lesson video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          )}
          {!isEditing && videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!videoUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md  dark:bg-gray-800 dark:text-slate-300">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <ReactPlayer
              controls
              width="100%"
              height="100%"
              url={videoUrl}
              style={{ position: "absolute", top: 0, left: 0 }}
            />
          </div>
        ))}
      {isEditing && (
        <div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <FileUpload courseId={courseId} lessonId={lessonId} />
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            Upload this lesson&apos;s video (only .mp4 files)
          </div>
        </div>
      )}
      {videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process. Refresh the page if video
          does not appear.
        </div>
      )}
    </div>
  );
};
