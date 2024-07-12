# ngx-stylesweep

`ngx-stylesweep` is a command-line tool that removes empty style files from your Angular components.

## Support

This tool traverses your Angular project's source directory, identifies Angular components with style files, and deletes
any style files that are
empty. It also updates the respective component files to remove references to the deleted style files.

This tool comes with support for Angular `@Component`'s `styleUrl` and `styleUrls` attribute. 
Support for other style attributes, if available, will come soon.

## Installation

Install `ngx-stylesweep` globally using npm:

```bash
npm install -g @bernardogiordano/ngx-stylesweep
```

## Usage

To use `ngx-stylesweep`, run the following command in your project's root directory:

```bash
ngx-stylesweep -p /path/to/your/angular/project

Options:
  -V, --version      output the version number
  -p, --path <path>  Path to the root source directory (default: ".")
  -d, --dry-run      Dry run (no changes will be made) (default: false)
  -y, --yes          Automatically apply changes (default: false)
  -v, --verbose      Verbose output (default: false)
  -h, --help         display help for command
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

`ngx-stylesweep` is licensed under the MIT License.
