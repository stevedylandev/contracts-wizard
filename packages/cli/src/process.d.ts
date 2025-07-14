declare var process: {
  cwd(): string;
  exit(code?: number): void;
  env: Record<string, string>;
  argv: string[];
};
