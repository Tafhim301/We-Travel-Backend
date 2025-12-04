import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  BCRYPT_SALT_ROUND: number;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  MONTHLY_SUBSCRIPTION_PRICE: string;
  YEARLY_SUBSCRIPTION_PRICE: string;
  FRONTEND_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  BACKEND_URL: string;
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVAriables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
    "BCRYPT_SALT_ROUND",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "FRONTEND_URL",
    "STRIPE_WEBHOOK_SECRET",
    "BACKEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "MONTHLY_SUBSCRIPTION_PRICE",
    "YEARLY_SUBSCRIPTION_PRICE",
    "STRIPE_SECRET_KEY",
  ];
  requiredEnvVAriables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    BCRYPT_SALT_ROUND: Number(process.env.BCRYPT_SALT_ROUND as string),
    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    MONTHLY_SUBSCRIPTION_PRICE: process.env.MONTHLY_SUBSCRIPTION_PRICE as string,
    YEARLY_SUBSCRIPTION_PRICE: process.env.YEARLY_SUBSCRIPTION_PRICE as string,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
    BACKEND_URL: process.env.BACKEND_URL as string,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
  };
};

export const envVars = loadEnvVariables();
