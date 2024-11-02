// This is used for getting user input.
import { createInterface } from "node:readline/promises";
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

export async function main() {
  // Create an interface to prompt the user for input
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Prompt for the bucket name
  const bucketName = await prompt.question("Enter a bucket name: ");
  prompt.close();

  // Initialize the S3 client
  const s3Client = new S3Client({});

  // Create an Amazon S3 bucket
  await s3Client.send(
    new CreateBucketCommand({
      Bucket: bucketName,
    }),
  );

  // Put an object into the Amazon S3 bucket
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: "my-first-object.txt",
      Body: "Hello JavaScript SDK!",
    }),
  );

  // Read the object
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: "my-first-object.txt",
    }),
  );

  console.log(await Body.transformToString());

  // Confirm resource deletion
  const deletePrompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const result = await deletePrompt.question("Empty and delete bucket? (y/n) ");
  deletePrompt.close();

  if (result === "y") {
    // Paginate through the bucket objects and delete them
    const paginator = paginateListObjectsV2(
      { client: s3Client },
      { Bucket: bucketName },
    );
    for await (const page of paginator) {
      const objects = page.Contents;
      if (objects) {
        for (const object of objects) {
          await s3Client.send(
            new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key }),
          );
        }
      }
    }

    // Delete the bucket
    await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
  }
}

// Call the function if this file is run directly
import { fileURLToPath } from "node:url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
