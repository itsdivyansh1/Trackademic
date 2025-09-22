export interface S3File extends Express.Multer.File {
  location: string; // this comes from multer-s3
  key: string;
}
