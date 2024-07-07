import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { version } from '../package.json';

const ANGULAR_COMPONENT_DIRECTIVE = /@\s*Component\s*\(\s*\{[^]*?}\s*\)/g;
const STYLE_URL_REGEX = /[ \t]*styleUrl\s*:\s*['|"](.+)['|"]\s*,?[\n*]?/;

const deletedStylesPaths = new Set<string>();
const modifiedComponentFilesPaths = new Set<string>();

function traverseDirectory(
  rootDirectory: string,
  consumerFn: (filePath: string) => void
) {
  const files = fs.readdirSync(rootDirectory);
  files.forEach(file => {
    if (file.includes('node_modules')) {
      return;
    }
    const filePath = path.join(rootDirectory, file);
    if (fs.statSync(filePath).isDirectory()) {
      traverseDirectory(filePath, consumerFn);
    } else if (filePath.endsWith('.ts')) {
      consumerFn(filePath);
    }
  });
}

function componentHandler(
  componentFilePath: string,
  fileContent: string,
  originalComponentBody: string
) {
  const styleUrlMatches = originalComponentBody.match(STYLE_URL_REGEX);
  if (!!styleUrlMatches && styleUrlMatches.length > 1) {
    const originalStyleUrl = styleUrlMatches[1];
    const styleFilePath = path.join(
      path.dirname(componentFilePath),
      originalStyleUrl
    );

    try {
      const stats = fs.statSync(styleFilePath);
      if (stats.size === 0) {
        deletedStylesPaths.add(styleFilePath);
        modifiedComponentFilesPaths.add(componentFilePath);
        fileContent = fileContent.replace(STYLE_URL_REGEX, '');
        fs.unlinkSync(styleFilePath);
      }
    } catch (e) {
      console.error('Unable to access styles file', styleFilePath);
    }
  }

  return fileContent;
}

const program = new Command()
  .name('ngx-stylesweep')
  .version(version)
  .description('Remove empty styles files from Angular components')
  .option('-p, --path <path>', 'Path to the root source directory', '.')
  .parse(process.argv);

const options = program.opts();
traverseDirectory(options.path, filePath => {
  let fileContent = fs.readFileSync(filePath).toString();
  const components = fileContent.match(ANGULAR_COMPONENT_DIRECTIVE);
  if (!!components) {
    components.forEach(component => {
      fileContent = componentHandler(filePath, fileContent, component);
    });
  }
  fs.writeFileSync(filePath, fileContent);
});

if (deletedStylesPaths.size + modifiedComponentFilesPaths.size === 0) {
  console.log('👍 No changes!');
} else {
  deletedStylesPaths.forEach(stylePath =>
    console.log('Deleted:', path.relative(options.path, stylePath))
  );
  modifiedComponentFilesPaths.forEach(componentPath =>
    console.log('Modified:', path.relative(options.path, componentPath))
  );
  console.log(
    `🧹 ${deletedStylesPaths.size} files deleted, ${modifiedComponentFilesPaths.size} files modified!`
  );
}
