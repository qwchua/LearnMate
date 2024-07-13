import { useContext } from "react";
import ReactPlayer from "react-player";
import { VideoContext } from "./VideoContext";
import { Lesson } from "@/types/types";

const videoConfig = {
  file: {
    attributes: {
      crossOrigin: "anonymous",
    },
  },
};

const VideoPlayer = ({ videoURL }: Lesson) => {
  //DO NOT TOUCH
  const { handleProgress, playerRef } = useContext(VideoContext);

  return (
    <div style={{ position: "relative", paddingTop: `${100 / (16 / 9)}%` }}>
      <ReactPlayer
        ref={playerRef}
        controls
        width="100%"
        height="100%"
        url={videoURL}
        style={{ position: "absolute", top: 0, left: 0 }}
        onProgress={handleProgress}
        config={videoConfig}
      />
    </div>
  );
};

export default VideoPlayer;
