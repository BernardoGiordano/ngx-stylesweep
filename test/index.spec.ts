import { componentHandler } from '../src/program';
import { Stats } from 'node:fs';

describe('componentHandler', () => {
  it('should return undefined for non-empty style file', () => {
    const componentFilePath = "./src/app/test/test.component.ts";
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrl: './test.component.css'
    })`;
    const result = componentHandler(
      () => ({ size: 10 }) as Stats,
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeUndefined();
  });

  it('should handle exception when style file does not exist', () => {
    const componentFilePath = "./src/app/test/test.component.ts";
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrl: './test.component.css'
    })`;
    const result = componentHandler(
      () => {
        throw new Error('File not found');
      },
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeUndefined();
  });

  it('should return modification object for empty style file when style url is defined with \'', () => {
    const componentFilePath = "./src/app/test/test.component.ts";
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrl: './test.component.css'
    })`;
    const result = componentHandler(
      () => ({ size: 0 }) as Stats,
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeTruthy();
    expect(result!.styles.length).toBe(1);
    expect(result!.component.content).not.toContain('styleUrl');
  });

  it('should return modification object for empty style file when style url is defined with "', () => {
    const componentFilePath = "./src/app/test/test.component.ts";
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrl: "./test.component.css"
    })`;
    const result = componentHandler(
      () => ({ size: 0 }) as Stats,
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeTruthy();
    expect(result!.styles.length).toBe(1);
    expect(result!.component.content).not.toContain('styleUrl');
  });

  it('should return modification object for empty style file when style url is defined with `', () => {
    const componentFilePath = "./src/app/test/test.component.ts";
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrl: \`./test.component.css\`
    })`;
    const result = componentHandler(
      () => ({ size: 0 }) as Stats,
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeTruthy();
    expect(result!.styles.length).toBe(1);
    expect(result!.component.content).not.toContain('styleUrl');
  });

  it('should do nothing when style url is not defined', () => {
    const componentFilePath = "./src/app/test/test.component.ts";
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
    })`;
    const result = componentHandler(
      () => {
        throw new Error('File not found');
      },
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeUndefined();
  });

  it('should return modification object for empty style file when style urls is defined', () => {
    const componentFilePath = "./src/app/test/test.component.ts";
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrls: ['./test.component.css']
    })`;
    const result = componentHandler(
      () => ({ size: 0 }) as Stats,
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeTruthy();
    expect(result!.styles.length).toBe(1);
    expect(result!.component.content).not.toContain('styleUrls');
  });
});
