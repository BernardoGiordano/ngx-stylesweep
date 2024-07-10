import { PathLike } from 'node:fs';
import fs from 'fs';
import { Modification } from './types';
import path from 'path';

const STYLE_URL_REGEX = /[ \t]*styleUrl\s*:\s*['|"](.+)['|"]\s*,?[\n*]?/;

export function componentHandler(
  statFn: (p: PathLike) => fs.Stats,
  componentFilePath: string,
  fileContent: string,
  originalComponentBody: string
): Modification | undefined {
  let modification: Modification | undefined = undefined;

  const styleUrlMatches = originalComponentBody.match(STYLE_URL_REGEX);
  if (!!styleUrlMatches && styleUrlMatches.length > 1) {
    const originalStyleUrl = styleUrlMatches[1];
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
        modification = {
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
      console.error('Unable to access styles file', styleFilePath);
    }
  }

  return modification;
}