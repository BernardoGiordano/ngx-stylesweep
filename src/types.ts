export interface ProgramOptions {
  path: string;
  dryRun: boolean;
  yes: boolean;
  verbose: boolean;
}

export interface ModifiedFile {
  path: string;
  content: string;
}

export interface Modification {
  component: ModifiedFile;
  styles: string[];
}