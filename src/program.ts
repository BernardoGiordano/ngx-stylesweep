import { PathLike } from 'node:fs';
import fs from 'fs';
import { Modification } from './types';
import path from 'path';

const STYLE_URL_REGEX = /[ \t]*styleUrl\s*:\s*['"`](.+)['"`]\s*,?[\n*]?/;

function handleStyleUrl(
  statFn: (p: PathLike) => fs.Stats,
  componentFilePath: string,
  fileContent: string,
  originalComponentBody: string,
  originalStyleUrl: string
): Modification | undefined {
  const styleFilePath = path.join(
    path.dirname(componentFilePath),
    originalStyleUrl
  );

  try {
    const stats = statFn(styleFilePath);
    if (stats.size === 0) {
      const replacedComponentBody = originalComponentBody.replace(
        STYLE_URL_REGEX,
        ''
      );
      return {
        component: {
          path: componentFilePath,
          content: fileContent.replace(
            originalComponentBody,
            replacedComponentBody
          ),
        },
        styles: [styleFilePath],
      };
    }
  } catch (e) {
    console.warn('Unable to access styles file', styleFilePath);
  }

  return undefined;
}

export function componentHandler(
  statFn: (p: PathLike) => fs.Stats,
  componentFilePath: string,
  fileContent: string,
  originalComponentBody: string
): Modification | undefined {
  const styleUrlMatches = originalComponentBody.match(STYLE_URL_REGEX);
  if (!!styleUrlMatches && styleUrlMatches.length > 1) {
    return handleStyleUrl(
      statFn,
      componentFilePath,
      fileContent,
      originalComponentBody,
      styleUrlMatches[1]
    );
  }

  return undefined;
}