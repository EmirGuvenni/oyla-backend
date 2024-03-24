const config = {
  PORT: process.env.PORT,

  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  JWT_SECRET: process.env.JWT_SECRET,

  BASE_DIR: __dirname,
} as const;

for (const key in config) {
  if (config[key as keyof typeof config] === undefined)
    throw new Error(`Missing config key: ${key}`);
}

export default config as DeepNonNullable<typeof config>;
