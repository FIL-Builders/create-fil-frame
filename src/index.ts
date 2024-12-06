#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import { fileURLToPath } from 'url';
import { exit } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPOSITORY_URL = 'https://github.com/FIL-Builders/fil-frame.git';

// the issue currently is that the keyboard interruptions don't trigger a question, but the process goes on as normal.
// the process should be stopped when the user presses ctrl+c and a question should be asked to confirm if the user wants to stop the process or continue.
// I suspect that the issue is with the handleInterruption function, but I'm not sure what the issue is.
async function handleInterruption() {
  console.log('\n\nInterruption detected!');
  const { shouldExit } = await inquirer.prompt([{
    type: 'confirm',
    name: 'shouldExit',
    message: 'Do you want to terminate the process?',
    default: false
  }]);

  if (shouldExit) {
    console.log('\nProcess terminated by user.');
    exit(0);
  }
  console.log('\nContinuing process...');
  return !shouldExit;
}

let isHandlingInterrupt = false;

process.on('SIGINT', () => {
  if (isHandlingInterrupt) return;
  isHandlingInterrupt = true;

  process.stdin.resume();

  handleInterruption().then(shouldContinue => {
    isHandlingInterrupt = false;
    if (!shouldContinue) {
      process.exit(0);
    }
  });
});

function execSyncWithInterruptHandle(command: string, options?: object) {
  try {
    return execSync(command, { ...options, stdio: 'inherit' });
  } catch (error) {
    if ((error as any)?.signal === 'SIGINT') {
      throw new Error('SIGINT');
    }
    throw error;
  }
}

function initRepo(projectPath: string) {
  try {
    process.chdir(projectPath);
    if (fs.existsSync('.git')) {
      fs.rmSync('.git', { recursive: true, force: true });
      if (fs.existsSync('.github')) {
        fs.rmSync('.github', { recursive: true, force: true });
      }
    }
    execSyncWithInterruptHandle('git init');
    execSyncWithInterruptHandle('git add .');
    execSyncWithInterruptHandle('git commit -m "init"');
  } catch (error) {
    if ((error as Error).message === 'SIGINT') {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to initialize repository: ${error.message}`);
    }
  }
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
  const cloneBranch = branch === 'storacha' ? 'storacha-nfts' :
    branch === 'lighthouse' ? 'lighthouse-nfts' :
      branch === 'akave' ? 'akave-integration' : 'main';
  try {
    execSyncWithInterruptHandle(`git clone --branch ${cloneBranch} ${REPOSITORY_URL} ${projectPath}`);
    fs.rmSync(path.join(projectPath, '.git'), { recursive: true, force: true });
  } catch (error) {
    if ((error as Error).message === 'SIGINT') {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
    throw error;
  }
}

function runPackageInstall(projectPath: string, packageManager: string) {
  try {
    process.chdir(projectPath);
    execSyncWithInterruptHandle(`${packageManager} install`);
  } catch (error) {
    if ((error as Error).message === 'SIGINT') {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to install packages: ${error.message}`);
    }
    throw error;
  }
}

async function createFilecoinApp(projectName: string, branch: string, packageManager: string = 'yarn') {
  const sanitizedProjectName = sanitize(projectName);
  const projectPath = path.resolve(process.cwd(), sanitizedProjectName);
  try {

    console.log(`Creating project directory: ${sanitizedProjectName}`);
    fs.mkdirSync(projectPath);

    cloneContents(branch, projectPath);
    initRepo(projectPath);
    runPackageInstall(projectPath, packageManager);
    console.log(`Successfully created ${sanitizedProjectName}!`);
  } catch (error) {
    if ((error as Error).message === 'SIGINT') {
      const shouldContinue = await handleInterruption();
      if (!shouldContinue) {
        fs.rmSync(projectPath, { recursive: true, force: true });
        process.exit(0);
      }
    } else {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }
      process.exit(1);
    }
  }
}

async function interactiveMode() {
  try {
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
          { name: 'Deal Client', value: 'main' }
        ]
      },
    ]);

    await createFilecoinApp(answers.projectName, answers.storageProvider, 'yarn');
  } catch (error) {
    if ((error as any)?.signal === 'SIGINT') {
      await handleInterruption();
    } else {
      throw error;
    }
  }
}

program
  .version('1.0.1')
  .description('CLI to create a new Filecoin app')
  .argument('[project-name]', 'Name of the new project')
  .option('--storacha', 'Initialize the repository using Storacha as the storage provider')
  .option('--lighthouse', 'Initialize the repository using Lighthouse as the storage provider')
  .option('--akave', 'Initialize the repository using Akave as the storage provider')
  .action(async (projectName, options) => {
    if (!projectName) {
      await interactiveMode();
      return;
    }

    let branch = 'main';
    if (options.storacha) {
      branch = 'storacha';
    } else if (options.lighthouse) {
      branch = 'lighthouse';
    } else if (options.akave) {
      branch = 'akave';
    }
    await createFilecoinApp(projectName, branch, 'yarn');
  });

program.parse();