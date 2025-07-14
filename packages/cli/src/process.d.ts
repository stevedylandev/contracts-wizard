declare const process: {
  cwd(): string;
  exit(code?: number): void;
  env: Record<string, string>;
  argv: string[];
};
