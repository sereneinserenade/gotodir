#!/usr/bin/env node
const program = require('commander');
const omelette = require('omelette');

const pkg = require('../package.json');
const commands = require('../lib/commands');
const db = require('../lib/database');

const complete = omelette('gotodir|to <folder> <folder>');

complete.on('folder', () => {
  const folders = db.get('folders').value();

  complete.reply(folders.map(folder => folder.name));
});

complete.init();

program.version(pkg.version);

program.option('--setup', 'Install completion script', () => {
  console.log('Installing completion script...');
  console.log('Restart your shell.');
  complete.setupShellInitFile();
});

program
  .command('add [name] [path]')
  .description('Add a directory to gotodir. Current directory is added by default.')
  .action(commands.addFolder);

program
  .command('mv <oldName> <newName>')
  .description('Rename a directory in gotodir')
  .alias('rename')
  .action(commands.renameFolder);

program
  .command('rm <name>')
  .alias('remove')
  .alias('delete')
  .description('Remove a directory from gotodir')
  .action(commands.deleteFolder);

// Only for use in the gotodir bash script
program
  .command('path [name]', null, { noHelp: true })
  .description('Get path of given folder')
  .action(commands.getPath);

program.command('help', null, { noHelp: true }).action(() => {
  program.outputHelp();
});

program.command('*', null, { noHelp: true }).action(commands.findFolder);

program.on('--help', () => {
  console.log(`  Instalation:

    Add this to your .bashrc or .zshrc:

       alias to=". gotodir"

    Then you can run this to enable shell completion:

      to --setup
      source ~/.bashrc  # OR ~/.zshrc
    `);
});

// If no command provided
if (!process.argv.slice(2).length) {
  if (commands.getFolders().length) {
    commands.showAllFolders();
  } else {
    program.outputHelp();
  }
}

program.parse(process.argv);
