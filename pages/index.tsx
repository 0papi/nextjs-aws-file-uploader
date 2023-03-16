import { ChangeEvent, useState } from "react";
import axios from "axios";

/* eslint-disable react/no-unescaped-entities */
export default function Home() {
  const [file, setFile] = useState<any>();
  const [uploading, setUploading] = useState(false);
  const selectedFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  async function uploadFile() {
    setUploading(true);

    const formData = new FormData();

    formData.append("file", file);
    formData.append("fileName", file.fileName);

    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };

    try {
      const data = await axios.post("/api/upload", formData, config);
      console.log("successful data", data);
    } catch (error) {
      console.log("error from file", error);
    }
  }
  return (
    <div>
      <h2>Let's get the AWS Show on the Road</h2>

      <input type="file" onChange={(e) => selectedFile(e)} />

      <button onClick={() => uploadFile()}>Upload File to AWS</button>
    </div>
  );
}
