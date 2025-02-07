#!/usr/bin/env node

import { program, Option } from 'commander';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPOSITORY_URL = 'https://github.com/FIL-Builders/fil-frame.git';

function initRepo(projectPath: string) {
  process.chdir(projectPath);
  if (fs.existsSync('.git')) {
    fs.rmSync('.git', { recursive: true, force: true });
    if (fs.existsSync('.github')) {
      fs.rmSync('.github', { recursive: true, force: true });
    }
  }
  execSync('git init');
  execSync('git add .');
  execSync('git commit -m "init"');
}

function showWelcomeMessage() {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Welcome to Create Filecoin App
   Your access point to Filecoin development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

function cloneContents(branch: string, projectPath: string) {
  const cloneBranch = branch === 'storacha' ? 'storacha-nfts' : branch === 'lighthouse' ? 'lighthouse-nfts' : branch === 'akave' ? 'akave-integration' : branch === 'axelar' ? 'axelar-integration' : branch === 'pyth' ? 'pyth-integration' : branch === 'Lit+lighthouse' ? 'light-x-lighthouse' : 'main';
  execSync(`git clone --branch ${cloneBranch} ${REPOSITORY_URL} ${projectPath}`);
  fs.rmSync(path.join(projectPath, '.git'), { recursive: true, force: true });
}

function runPackageInstall(projectPath: string, packageManager: string) {
  process.chdir(projectPath);
  execSync(`${packageManager} install`, { stdio: 'inherit' });
}

async function createFilecoinApp(projectName: string, branch: string, packageManager: string = 'yarn', shouldInstallPackages: boolean = true) {
  const sanitizedProjectName = sanitize(projectName);
  const projectPath = path.resolve(process.cwd(), sanitizedProjectName);

  console.log(`Creating project directory: ${sanitizedProjectName}`);
  fs.mkdirSync(projectPath);

  cloneContents(branch, projectPath);
  initRepo(projectPath);

  if (shouldInstallPackages) {
    console.log('Installing packages...');
    runPackageInstall(projectPath, packageManager);
  } else {
    console.log('Skipping package installation.');
  }

  console.log(`Successfully created ${sanitizedProjectName}!`);
}

async function interactiveMode() {
  showWelcomeMessage();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      validate: (input: string) => input.length > 0 || 'Project name is required'
    },
    {
      type: 'list',
      name: 'storageProvider',
      message: 'Which feature would you like to use?',
      choices: [
        { name: 'Storacha', value: 'storacha' },
        { name: 'Lighthouse', value: 'lighthouse' },
        { name: 'Akave', value: 'akave' },
        { name: 'Lit+lighthouse', value: 'lit+lighthouse' },
        { name: 'Axelar', value: 'axelar' },
        { name: 'Pyth', value: 'pyth' },
        { name: 'Deal Client', value: 'main' }
      ]
    },
    {
      type: 'confirm',
      name: 'installPackages',
      message: 'Would you like to install packages now? This might take a while.',
      default: true
    }
  ]);

  await createFilecoinApp(
    answers.projectName,
    answers.storageProvider,
    'yarn',
    answers.installPackages
  );
}

program
  .version('1.0.3')
  .description('CLI to create a new Filecoin app')
  .argument('[project-name]', 'Name of the new project')
  .addOption(new Option('--provider <type>', 'Choose storage provider')
    .choices(['storacha', 'lighthouse', 'akave', 'lit+lighthouse', 'axelar', 'pyth', 'main'])
    .default('main'))
  .option('--skip-install', 'Skip package installation')
  .action(async (projectName, options) => {
    if (!projectName) {
      await interactiveMode();
      return;
    }

    const branch = options.provider;

    await createFilecoinApp(
      projectName,
      branch,
      'yarn',
      !options.skipInstall
    );
  });

program.parse();