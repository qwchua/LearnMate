import { useState, ChangeEvent } from "react";
import axios from "axios";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { getVideoUploadURL } from "@/services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface FileUploadProps {
  courseId: string;
  lessonId: string;
}

const FileUpload = ({ courseId, lessonId }: FileUploadProps) => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const uploadURL = await getVideoUploadURL(courseId, lessonId);

      console.log(uploadURL);

      await axios.put(uploadURL, file, {
        headers: {
          "Content-Type": file.type,
        },
      });
      toast.success("Chapter updated");
      navigate(0);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <Input type="file" onChange={handleFileChange} />
      <Button className="mt-2" onClick={handleUpload}>
        Upload
      </Button>
    </div>
  );
};

export default FileUpload;
