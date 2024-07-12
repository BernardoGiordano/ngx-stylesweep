import { PathLike } from 'node:fs';
import fs from 'fs';
import { Modification } from './types';
import path from 'path';

const STYLE_URL_REGEX = /[ \t]*styleUrl\s*:\s*['"`](.+)['"`]\s*,?[\n*]?/;
const STYLE_URLS_REGEX = /[ \t]*styleUrls\s*:\s*\[(\s*[^\]]+\s*)],?[\n*]?/;

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

function handleStyleUrls(
  statFn: (p: PathLike) => fs.Stats,
  componentFilePath: string,
  fileContent: string,
  originalComponentBody: string,
  originalStyleUrls: string
): Modification | undefined {
  const relativeStylePaths = originalStyleUrls
    .split(',')
    .map(styleUrl => styleUrl.trim().replace(/['"`]/g, ''))
    .filter(styleUrl => !!styleUrl);
  const stylePathsToKeep = relativeStylePaths.filter(stylePath => {
    const realStylePath = path.join(path.dirname(componentFilePath), stylePath);
    try {
      const stats = statFn(realStylePath);
      return stats.size > 0;
    } catch (e) {
      console.warn('Unable to access styles file', realStylePath);
      return true;
    }
  });
  const stylePathsToRemove = relativeStylePaths.filter(
    stylePath => !stylePathsToKeep.includes(stylePath)
  );

  if (stylePathsToKeep.length === relativeStylePaths.length) {
    return undefined;
  }

  let replacedComponentBody = originalComponentBody;
  if (stylePathsToKeep.length === 0) {
    replacedComponentBody = originalComponentBody.replace(STYLE_URLS_REGEX, '');
  } else if (stylePathsToKeep.length < relativeStylePaths.length) {
    replacedComponentBody = originalComponentBody.replace(
      STYLE_URLS_REGEX,
      `styleUrls: [${stylePathsToKeep.map(stylePath => `'${stylePath}'`).join(', ')}],`
    );
  } else {
    return undefined;
  }

  return {
    component: {
      path: componentFilePath,
      content: fileContent.replace(
        originalComponentBody,
        replacedComponentBody
      ),
    },
    styles: stylePathsToRemove.map(stylePath =>
      path.join(path.dirname(componentFilePath), stylePath)
    ),
  };
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

  const styleUrlsMatches = originalComponentBody.match(STYLE_URLS_REGEX);
  if (!!styleUrlsMatches && styleUrlsMatches.length > 1) {
    return handleStyleUrls(
      statFn,
      componentFilePath,
      fileContent,
      originalComponentBody,
      styleUrlsMatches[1]
    );
  }

  return undefined;
}
