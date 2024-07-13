import { useQuery } from "@tanstack/react-query";
import {
  getCourseById,
  getEnrolledCourses,
  getLesson,
  getLessonsByCourseId,
  getStudentsByCourseId,
  getTeacherCourses,
  getTranscription,
} from "./api.ts";

export function useGetTranscription(URL: string) {
  return useQuery({
    queryKey: ["useGetTranscription", URL],
    queryFn: () => getTranscription(URL),
    refetchOnWindowFocus: false,
    enabled: !!URL,
  });
}

export function useCourseId(id: string) {
  return useQuery({
    queryKey: ["courseId"],
    queryFn: () => getCourseById(id),
    refetchOnWindowFocus: false,
  });
}

export function useGetLessonsByCourseId(id: string) {
  return useQuery({
    queryKey: ["useGetLessonsByCourseId"],
    queryFn: () => getLessonsByCourseId(id),
    refetchOnWindowFocus: false,
  });
}

export function useGetStudentsByCourseId(id: string) {
  return useQuery({
    queryKey: ["useGetStudentsByCourseId"],
    queryFn: () => getStudentsByCourseId(id),
    refetchOnWindowFocus: false,
  });
}

export function useGetLesson(courseId: string, lessonId: string) {
  return useQuery({
    queryKey: ["useGetLesson"],
    queryFn: () => getLesson(courseId, lessonId),
    refetchOnWindowFocus: false,
  });
}

export function useGetTeacherCourses() {
  return useQuery({
    queryKey: ["useGetTeacherCourses"],
    queryFn: getTeacherCourses,
    refetchOnWindowFocus: false,
  });
}

export function useGetEnrolledCourses() {
  return useQuery({
    queryKey: ["useGetEnrolledCourses"],
    queryFn: getEnrolledCourses,
    refetchOnWindowFocus: false,
  });
}
