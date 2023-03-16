import { NextApiResponse } from "next";
import { NextApiRequest } from "next";
import busboy from "busboy";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3Client({
  region: process.env.REGION_NAME,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ err: "Wrong request method" });
  }

  const bb = busboy({ headers: req.headers });

  bb.on("file", async (_, file, info) => {
    const fileName = info.filename;

    try {
      const getObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
      };

      const uploads = new Upload({
        client: s3,
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
        leavePartsOnError: false,
        params: {
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Body: file,
        },
      });

      await uploads.done();

      const command = new GetObjectCommand(getObjectParams);

      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

      res.status(200).json({ url });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload file to AWS" });
    }
  });

  req.pipe(bb);
  return;
}
