import { getS3Config } from "./auth";

let s3Config: { bucketName: string; region: string } | null = null;

// Initialize S3 config
const initS3Config = async () => {
  if (!s3Config) {
    try {
      const response = await getS3Config();
      s3Config = response.config;
      
      // If config is null or undefined, use defaults
      if (!s3Config || !s3Config.bucketName || !s3Config.region) {
        console.warn('S3 utils - Invalid S3 config received, using defaults');
        s3Config = {
          bucketName: 'trackademic-bucket',
          region: 'us-east-1'
        };
      }
    } catch (error) {
      console.warn('S3 utils - Failed to fetch S3 config, using defaults:', error);
      s3Config = {
        bucketName: 'trackademic-bucket',
        region: 'us-east-1'
      };
    }
  }
  return s3Config;
};

export async function getS3Url(key: string | null | undefined): Promise<string | undefined> {
  if (!key) {
    return undefined;
  }
  
  // If it's already a full URL, return as is
  if (key.startsWith('http')) {
    return key;
  }
  
  const config = await initS3Config();
  const url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
  return url;
}
