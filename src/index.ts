import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { description, version } from '../package.json';
import { ModifiedFile, ProgramOptions } from './types';
import { componentHandler } from './program';

const ANGULAR_COMPONENT_DIRECTIVE_REGEX = /@\s*Component\s*\(\s*\{[^]*?}\s*\)/g;

const stylePathsToDelete = new Set<string>();
const componentPathsToModify = new Set<ModifiedFile>();

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

function deleteFiles(options: ProgramOptions) {
  for (const stylePath of stylePathsToDelete) {
    if (options.verbose) {
      console.log('🗑 Deleting', stylePath);
    }
    fs.unlinkSync(stylePath);
  }
}

function modifyFiles(options: ProgramOptions) {
  for (const component of componentPathsToModify) {
    if (options.verbose) {
      console.log('🛠 Modifying', component.path);
    }
    fs.writeFileSync(component.path, component.content);
  }
}

function logResults() {
  if (stylePathsToDelete.size + componentPathsToModify.size === 0) {
    console.log('👍 No changes!');
    process.exit(0);
  }

  console.log(
    '🔍 Found',
    stylePathsToDelete.size,
    'style files to delete and',
    componentPathsToModify.size,
    'components to modify!'
  );
}

function applyChanges(options: ProgramOptions) {
  deleteFiles(options);
  modifyFiles(options);
  console.log(
    `🧹 ${stylePathsToDelete.size} files deleted, ${componentPathsToModify.size} files modified!`
  );
}

function confirmAndApplyChanges(options: ProgramOptions) {
  if (options.yes /* proceed without confirmation */) {
    applyChanges(options);
  } else {
    console.log(
      '🚨 Are you sure you want to apply changes to the filesystem? (y/n)'
    );

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (text: string) => {
      if (text === 'y\n') {
        applyChanges(options);
      } else {
        console.log('🚫 Changes were not applied!');
      }
      process.exit(0);
    });
  }
}

function main(args: string[]) {
  const program = new Command()
    .name('ngx-stylesweep')
    .version(version)
    .description(description)
    .option('-p, --path <path>', 'Path to the root source directory', '.')
    .option('-d, --dry-run', 'Dry run (no changes will be made)', false)
    .option('-y, --yes', 'Automatically apply changes', false)
    .option('-v, --verbose', 'Verbose output', false)
    .parse(args);
  const options = program.opts() as ProgramOptions;

  traverseDirectory(options.path, filePath => {
    let fileContent = fs.readFileSync(filePath).toString();
    const components = fileContent.match(ANGULAR_COMPONENT_DIRECTIVE_REGEX);
    if (!!components) {
      components.forEach(component => {
        const modification = componentHandler(
          fs.statSync,
          filePath,
          fileContent,
          component
        );

        if (!!modification) {
          componentPathsToModify.add(modification.component);
          modification.styles.forEach(stylePath => {
            stylePathsToDelete.add(stylePath);
          });
        }
      });
    }
  });

  logResults();
  if (!options.dryRun) {
    confirmAndApplyChanges(options);
  }
}

main(process.argv);
