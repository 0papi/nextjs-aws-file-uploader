/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import S3 from "aws-sdk/clients/s3";
import bodyParser from "body-parser";

const s3 = new S3({
  region: "eu-north-1",
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Invalid request method" });
  }

  // Use the bodyParser middleware to parse the request body
  await bodyParser.json({ limit: "8mb" });

  try {
    console.log("REQUEST BODY", req.body);
    let { name, type } = req.body;

    const fileParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: name,
      Expires: 600,
      ContentType: type,
      ACL: "public-read",
    };

    const url = await s3.getSignedUrlPromise("putObject", fileParams);

    console.log("URL", url);

    res.status(200).json({ url });
  } catch (error) {
    console.log("ERROR", error);
    res.status(400).json({ message: error });
  }
};
