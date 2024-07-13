"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { createLesson } from "@/services/api";
import LessonsList from "./lesson-list";
import { useNavigate } from "react-router-dom";
import { Lesson } from "@/types/types";

interface LessonsFormProps {
  lessons: Lesson[];
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1),
});

export const LessonsForm = ({ lessons, courseId }: LessonsFormProps) => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreating = () => {
    setIsCreating((current) => !current);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createLesson(courseId, values);
      toast.success("Lesson created");
      toggleCreating();
      navigate(0);
      // window.location.reload();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onEdit = (id: string) => {
    navigate(`/teacher/courses/${courseId}/lessons/${id}`);
  };
  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4 dark:bg-gray-800">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Lessons
        <Button onClick={toggleCreating} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a Lesson
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction to the course'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type="submit">
              Create
            </Button>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "text-sm mt-2",
            !lessons.length && "text-slate-500 italic"
          )}
        >
          {!lessons.length && "No chapters"}
          {!lessons.length}
          <LessonsList lessons={lessons || []} onEdit={onEdit} />
        </div>
      )}
    </div>
  );
};
export default LessonsForm;
