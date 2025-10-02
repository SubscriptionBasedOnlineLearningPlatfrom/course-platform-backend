import AWS from 'aws-sdk';
import multer from 'multer';
import dotenv from 'dotenv'

dotenv.config();

export const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT),
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET
});

//   region: "nyc3", // replace with your Space region
//   endpoint: process.env.DO_SPACES_ENDPOINT, // e.g., https://nyc3.digitaloceanspaces.com
//   credentials: {
//     accessKeyId: process.env.DO_SPACES_KEY,
//     secretAccessKey: process.env.DO_SPACES_SECRET,
//   },
// });

export const upload = multer({ storage: multer.memoryStorage() });
