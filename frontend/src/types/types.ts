export type Course = {
  courseId: string;
  title: string;
  description: string;
};

export type Lesson = {
  courseId: string;
  lessonId: string;
  title: string;
  createdAt: string;
  description?: string;
  transcriptionURL?: string;
  videoURL?: string;
};
