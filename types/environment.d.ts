interface CustomEnvironment extends NodeJS.ProcessEnv {
  BOT_TOKEN: string;
  HEMEROTECA_SITE: string;
}

declare global {
  namespace NodeJS {
    interface Process {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      env: CustomEnvironment;
    }
  }
}

export {};
