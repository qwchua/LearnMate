import { ReactNode, createContext, useContext, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Message from "./Message";
import { VideoContext } from "../VideoContext";
import {
  filterTranscriptItems,
  getContentInRange,
} from "../../../util/videoSearch";
import { Lesson } from "@/types/types";
import { useGetTranscription } from "@/services/queries";
import { createMessage } from "@/services/api";

type Message = {
  isUserMessage: boolean;
  text: string | JSX.Element;
  id: string;
  createdAt: string;
};

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  messages?: Message[];
  handleImageButton: () => void;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
  messages: [],
  handleImageButton: () => {},
});

interface Props {
  lesson: Lesson;
  children: ReactNode;
  courseTitle: string;
}

export const ChatContextProvider = ({
  children,
  lesson,
  courseTitle,
}: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { data, isFetched } = useGetTranscription(lesson?.transcriptionURL!);
  const lessonTitle = lesson?.title;
  const lessonDescription = lesson?.description;

  let transcript;

  if (isFetched) {
    //console.log(data.results.items);
    transcript = filterTranscriptItems(data.results.items);
  }

  const { captureFrame, currentTimeRef } = useContext(VideoContext);

  const backupMessage = useRef("");

  const [isImage, setIsImage] = useState<boolean>(false);

  const handleImageButton = () => {
    setIsImage(!isImage);
  };

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      let imageUrl = "false";

      if (isImage) {
        imageUrl = captureFrame();
      }

      const previousSixMessages = messages.slice(0, 6);

      //Get lecture context
      const currentTimestamp = currentTimeRef?.current ?? 0; // seconds
      const windowSize = 30; // seconds
      const messageContext = transcript?.length
        ? getContentInRange(transcript, currentTimestamp, windowSize)
        : "";

      console.log(
        JSON.stringify({
          message,
          imageUrl,
          previousSixMessages,
          messageContext,
          lessonTitle,
          lessonDescription,
          courseTitle,
        })
      );

      const body = {
        message,
        imageUrl,
        previousSixMessages,
        messageContext,
        lessonTitle,
        lessonDescription,
        courseTitle,
      };

      //UNCOMMENT THIS
      const response = await createMessage(body);

      // const response = await fetch(
      //   "https://2b4n20ffmg.execute-api.ap-southeast-1.amazonaws.com/prod/message",
      //   {
      //     method: "POST",
      //     body: JSON.stringify({
      //       message,
      //       imageUrl,
      //       previousSixMessages,
      //       messageContext,
      //     }),
      //   }
      // );

      //UNCOMMENT THIS
      return response;

      // if (!response.ok) {
      //   throw new Error("Failed to send message");
      // }

      // const responseData = await response.json();
      // return responseData;
    },

    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");

      const newMessage: Message = {
        id: Math.floor(Math.random() * 10001).toString(),
        isUserMessage: true,
        text: message,
        createdAt: new Date().toISOString(),
      };
      setMessages([newMessage, ...messages]);
    },

    onSuccess: (data) => {
      setIsLoading(false);
      const message = data.data.data.content;

      const botMessage = {
        createdAt: new Date().toISOString(),
        id: Math.floor(Math.random() * 10001).toString(),
        isUserMessage: false,
        text: message,
      };

      setMessages([botMessage, ...messages]);
    },
    onSettled: async () => {
      setIsLoading(false);
    },
    onError: async () => {
      setIsLoading(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const addMessage = () => {
    setIsLoading(true);
    sendMessage({ message });
  };

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
        messages,
        handleImageButton,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
