import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

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
import { deleteStudent, enrollStudentInCourse } from "@/services/api";
import { useNavigate } from "react-router-dom";
import StudentsList from "./student-list";

interface Student {
  studentId: string;
  courseId: string;
  email: string;
}

interface StudentsFormProps {
  students: Student[];
  courseId: string;
}

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" }),
});

export const StudentsForm = ({ students, courseId }: StudentsFormProps) => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreating = () => {
    setIsCreating((current) => !current);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await enrollStudentInCourse(courseId, values);
      toast.success("Lesson created");
      toggleCreating();
      navigate(0);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onEdit = async (studentId: string, courseId: string) => {
    try {
      await deleteStudent(courseId, studentId);
      toast.success("Student deleted");
      navigate(0);
    } catch {
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4 dark:bg-gray-800">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Students
        <Button onClick={toggleCreating} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a Student
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Enter Email"
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
            !students.length && "text-slate-500 italic"
          )}
        >
          {!students.length && "No students"}
          {!students.length}
          <StudentsList students={students || []} onEdit={onEdit} />
        </div>
      )}
    </div>
  );
};
export default StudentsForm;
