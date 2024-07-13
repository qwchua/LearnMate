import axios from "axios";
import { getAccessToken } from "../../util/auth";
import { BackendStack } from "../../../backend/outputs.json";

const COURSE_API_URL =
  BackendStack.ApiGatewaycourseApiEndpointB903B95A + "courses";

const VIDEO_API_URL =
  BackendStack.ApiGatewayvideosApiEndpoint576E54BC + "videos";

const MESSAGE_API_URL =
  BackendStack.ApiGatewaymessageApiEndpoint782F7CF9 + "message";

export const getTranscription = async (URL: string) => {
  const response = await axios.get(URL);
  return response.data;
};

export const createMessage = async (values: any) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.post(MESSAGE_API_URL, values, {
    headers,
  });
  return response;
};

export const getCourseById = async (id: string) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.get(`${COURSE_API_URL}/${id}`, { headers });
  return response.data.course;
};

export const patchCourseById = async (courseId: string, values: any) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.patch(`${COURSE_API_URL}/${courseId}`, values, {
    headers,
  });
  return response;
};

export const patchLesson = async (
  courseId: string,
  lessonId: string,
  values: any
) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.patch(
    `${COURSE_API_URL}/${courseId}/lessons/${lessonId}`,
    values,
    {
      headers,
    }
  );
  return response;
};

export const createLesson = async (courseId: string, values: any) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.post(
    `${COURSE_API_URL}/${courseId}/lessons`,
    values,
    {
      headers,
    }
  );
  return response;
};

export const getLessonsByCourseId = async (id: string) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.get(`${COURSE_API_URL}/${id}/lessons`, {
    headers,
  });

  let lessons = response.data.lessons;

  lessons.sort(
    (a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return lessons;
};

export const getStudentsByCourseId = async (id: string) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.get(`${COURSE_API_URL}/${id}/students`, {
    headers,
  });

  return response.data.students;
};

export const enrollStudentInCourse = async (courseId: string, values: any) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.post(
    `${COURSE_API_URL}/${courseId}/students`,
    values,
    {
      headers,
    }
  );
  return response;
};

export const getLesson = async (courseId: string, lessonId: string) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.get(
    `${COURSE_API_URL}/${courseId}/lessons/${lessonId}`,
    {
      headers,
    }
  );

  return response.data.lesson;
};

export const getVideoUploadURL = async (courseId: string, lessonId: string) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.get(
    `${VIDEO_API_URL}/upload-url/courses/${courseId}/lessons/${lessonId}`,
    {
      headers,
    }
  );

  const { uploadURL } = response.data;

  return uploadURL;
};

export const getTeacherCourses = async () => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.get(`${COURSE_API_URL}`, {
    headers,
  });

  return response.data.courses;
};

export const getEnrolledCourses = async () => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.get(`${COURSE_API_URL}/enrolled`, {
    headers,
  });

  return response.data.courses;
};

export const deleteLesson = async (courseId: string, lessonId: string) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.delete(
    `${COURSE_API_URL}/${courseId}/lessons/${lessonId}`,
    {
      headers,
    }
  );

  return response.data;
};

export const deleteCourse = async (courseId: string) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.delete(`${COURSE_API_URL}/${courseId}`, {
    headers,
  });

  return response.data;
};

export const deleteStudent = async (courseId: string, studentId: string) => {
  const accessToken = await getAccessToken();

  const headers = {
    Authorization: accessToken,
  };
  const response = await axios.delete(
    `${COURSE_API_URL}/${courseId}/students/${studentId}`,
    {
      headers,
    }
  );

  return response.data;
};
