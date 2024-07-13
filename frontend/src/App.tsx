import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { VideoPage } from "./pages/VideoPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { BackendStack } from "../../backend/outputs.json";
import RootLayout from "./pages/Root.tsx";
import ManageCourses from "./pages/ManageCourses.tsx";
import CreateCoursePage from "./pages/CreateCoursePage.tsx";
import { ToastProvider } from "./components/providers/toaster-provider.tsx";
import CourseIdPage from "./pages/CourseIdPage.tsx";
import TokenPage from "./pages/TokenPage.tsx";
import LessonIdPage from "./pages/LessonIdPage.tsx";
import StudentsLessonPage from "./pages/StudentLessonsPage.tsx";
import { UserRoleProvider } from "./hooks/useUserRole.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";

Amplify.configure({
  aws_project_region: "ap-southeast-1",
  aws_user_pools_id: BackendStack.CognitoLmUserPoolId2F411095,
  aws_user_pools_web_client_id: BackendStack.CognitoLmUserPoolClientIdB4F0E516,
  oauth: {},
  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: ["SMS"],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_cognito_verification_mechanisms: ["EMAIL"],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Set retry to 1
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/teacher/courses", element: <ManageCourses /> },
      { path: "/teacher/create", element: <CreateCoursePage /> },
      { path: "/teacher/courses/:courseId", element: <CourseIdPage /> },
      {
        path: "/teacher/courses/:courseId/lessons/:lessonId",
        element: <LessonIdPage />,
      },

      {
        path: "/courses/:courseId",
        element: <StudentsLessonPage />,
      },
    ],
  },
  {
    path: "/videos/:videoId",
    element: <VideoPage />,
  },
  {
    path: "/courses/:courseId/lessons/:lessonId",
    element: <VideoPage />,
  },
  {
    path: "/token",
    element: <TokenPage />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

function App() {
  return (
    <Authenticator>
      <QueryClientProvider client={queryClient}>
        <UserRoleProvider>
          <RouterProvider router={router} />
          <ToastProvider />
        </UserRoleProvider>
      </QueryClientProvider>
    </Authenticator>
  );
}

export default App;
