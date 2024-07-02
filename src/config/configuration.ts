import { config } from 'dotenv';
config();
export default () => {
  const env = process.env.ENVIRONMENT;
  switch (env) {
    case 'debug': {
      return {
        database: {
          dialect: 'mysql',
          host: process.env.LOCAL_DB_HOST,
          port: process.env.LOCAL_DB_PORT,
          user: process.env.LOCAL_DB_USERNAME,
          password: process.env.LOCAL_DB_PASSWORD,
          database: process.env.LOCAL_DB_NAME,
          synchronize: true,
          autoLoadModels: true,
          logging: true,
        },
        jwt: {
          secret: process.env.ENCRYPTION_KEY,
        },
        encryptionKey: process.env.ENCRYPTION_KEY,
        timezone: process.env.TIMEZONE,
        mailgun_api: process.env.MAILGUN_API,
        mailgun_domain: process.env.MAILGUN_DOMAIN,
        api_key: process.env.API_KEY,
        stripe_secret: process.env.STRIPE,
      };
    }
    case 'dev': {
      return {
        database: {
          dialect: 'mysql',
          host: process.env.DEV_DB_HOST,
          port: process.env.DEV_DB_PORT,
          user: process.env.DEV_DB_USERNAME,
          password: process.env.DEV_DB_PASSWORD,
          database: process.env.DEV_DB_NAME,
          synchronize: true,
          autoLoadModels: true,
          logging: true,
        },
        jwt: {
          secret: process.env.ENCRYPTION_KEY,
        },
        encryptionKey: process.env.ENCRYPTION_KEY,
        timezone: process.env.TIMEZONE,
        mailgun_api: process.env.MAILGUN_API,
        mailgun_domain: process.env.MAILGUN_DOMAIN,
        api_key: process.env.API_KEY,
        stripe_secret: process.env.STRIPE,
      };
    }
    case 'prod': {
      return {
        database: {
          dialect: 'mysql',
          host: process.env.PROD_DB_HOST,
          port: 3306,
          user: process.env.PROD_DB_USERNAME,
          password: process.env.PROD_DB_PASSWORD,
          database: process.env.PROD_DB_NAME,
          synchronize: false,
          autoLoadModels: true,
          logging: false,
        },
        jwt: {
          secret: process.env.ENCRYPTION_KEY,
        },
        encryptionKey: process.env.ENCRYPTION_KEY,
        timezone: process.env.TIMEZONE,
        mailgun_api: process.env.MAILGUN_API,
        mailgun_domain: process.env.MAILGUN_DOMAIN,
        api_key: process.env.API_KEY,
        stripe_secret: process.env.STRIPE,
      };
    }
  }
};
