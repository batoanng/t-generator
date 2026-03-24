declare module 'yeoman-assert' {
  interface YeomanAssert {
    file(paths: string[]): void;
    fileContent(filePath: string, contents: string | RegExp): void;
  }

  const yoAssert: YeomanAssert;

  export = yoAssert;
}
