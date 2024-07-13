import { ReactNode, createContext, useRef } from "react";

type StreamResponse = {
  currentTimeRef: React.MutableRefObject<number> | null;
  handleProgress: (progress: { playedSeconds: number }) => void;
  captureFrame: () => string | undefined;
  playerRef: React.MutableRefObject<null> | null;
};

export const VideoContext = createContext<StreamResponse>({
  currentTimeRef: null,
  handleProgress: () => {},
  captureFrame: () => "",
  playerRef: null,
});

interface Props {
  children: ReactNode;
}

export const VideoContextProvider = ({ children }: Props) => {
  const currentTimeRef = useRef<number>(0);
  const playerRef = useRef(null);

  const handleProgress = (progress: { playedSeconds: number }) => {
    currentTimeRef.current = progress.playedSeconds;
  };

  const captureFrame = () => {
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();

      if (!player) {
        console.error("Player is null or undefined.");
        return "";
      }

      const canvas = document.createElement("canvas");
      canvas.width = player.videoWidth;
      canvas.height = player.videoHeight;

      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Failed to get 2D context from canvas.");
        return "";
      }

      ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL();

      // console.log("Screenshot captured:", dataUrl);

      // Now `dataUrl` contains the base64-encoded image data
      return dataUrl;
      // console.log("Screenshot captured:", dataUrl);
    } else {
      console.error("PlayerRef is null or undefined.");
      return "";
    }
  };

  return (
    <VideoContext.Provider
      value={{
        currentTimeRef,
        handleProgress,
        captureFrame,
        playerRef,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};
