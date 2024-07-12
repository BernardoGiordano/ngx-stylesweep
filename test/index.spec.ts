import { componentHandler } from '../src/program';
import { Stats } from 'node:fs';

describe('componentHandler', () => {
  it('should return undefined for non-empty style file', () => {
    const componentFilePath = './src/app/test/test.component.ts';
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
    const componentFilePath = './src/app/test/test.component.ts';
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

  it("should return modification object for empty style file when style url is defined with '", () => {
    const componentFilePath = './src/app/test/test.component.ts';
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
    const componentFilePath = './src/app/test/test.component.ts';
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
    const componentFilePath = './src/app/test/test.component.ts';
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
    const componentFilePath = './src/app/test/test.component.ts';
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
    const componentFilePath = './src/app/test/test.component.ts';
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrls: [
        './test.component.css'
      ]
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

  it('should do nothing when styles are not empty', () => {
    const componentFilePath = './src/app/test/test.component.ts';
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrls: [
        './test.component.css',
        './test2.component.css',
      ]
    })`;
    const result = componentHandler(
      () => ({ size: 10 }) as Stats,
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeUndefined();
  });

  it('should replace the style urls with an array only containing non empty files', () => {
    const componentFilePath = './src/app/test/test.component.ts';
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrls: [
        './test.component.css',
        './test2.component.css',
        './test3.component.css',
      ]
    })`;

    let calledAtLeastOnce = false;
    const statFn = () => {
      if (!calledAtLeastOnce) {
        calledAtLeastOnce = true;
        return { size: 0 } as Stats;
      }
      return { size: 10 } as Stats;
    };
    const result = componentHandler(
      statFn,
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeTruthy();
    expect(result!.styles.length).toBe(1);
    expect(result!.component.content).toContain(
      "styleUrls: ['./test2.component.css', './test3.component.css']"
    );
  });

  it('should handle exception when styleUrls files do not exist', () => {
    const componentFilePath = './src/app/test/test.component.ts';
    const fileContent = `@Component({
      selector: 'app-test',
      templateUrl: './test.component.html',
      styleUrls: [
        './test.component.css',
        './test2.component.css',
        './test3.component.css',
      ]
    })`;

    const statFn = () => {
      throw new Error('File not found');
    };
    const result = componentHandler(
      statFn,
      componentFilePath,
      fileContent,
      fileContent
    );

    expect(result).toBeUndefined();
  });
});
