import { Loader2, MessageSquare } from "lucide-react";
import Message from "./Message";
import { useContext } from "react";
import { ChatContext } from "./ChatContext";

const Messages = () => {
  const { isLoading: isAiThinking, messages } = useContext(ChatContext);

  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: "loading-message",
    isUserMessage: false,
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    ),
  };

  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] w-full border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          return <Message {...message} key={message.id} />;
        })
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
          <p className="text-zinc-500 text-sm">
            Depending on where you paused the video,
          </p>
          <p className="text-zinc-500 text-sm">
            your prompt will include the words spoken
          </p>
          <p className="text-zinc-500 text-sm">
            around that moment in the video as context.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
