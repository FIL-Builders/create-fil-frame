# create-filecoin-app

A command-line interface (CLI) for creating Filecoin applications with zero configuration. Based on [fil-frame](https://github.com/FIL-Builders/fil-frame), a ready-to-use template for building Filecoin applications.

## Quick Start

```bash
npx create-filecoin-app my-app
cd my-app
yarn dev
```

## Features

- 🚀 Zero-config setup
- 📦 Pre-configured Filecoin development environment
- 🔄 Git repository initialization
- 💻 Automatic dependency installation
- 💾 Pre-configured integration with storage onramp provider of choice.
- 🎨 Ready-to-use template with best practices

## Usage

The CLI offers two modes: interactive mode and flag mode.

### Interactive Mode

To use the interactive mode, simply run:

```bash
npx create-filecoin-app
```

You will be prompted to answer a series of questions to configure your new project. This includes your project name, selecting your preferred integrations (Lighthouse, Storacha, Akave, Pyth, Axelar, Lit + Lighthouse, and the Deal Client), and choosing whether to install project packages (using yarn).

### Flag Mode

If you prefer to skip the prompts, you can use the flag mode to specify your options directly. 

#### Flag Options

- Storage Provider (--provider): This contains 7 options currently: storacha, lighthouse, akave, pyth, axelar, lit+lighthouse and main.
- Skip package installation (--skip-install)

For example, to initialise a project named `my-app`, with lighthouse as the storage onramp:

```bash
npx create-filecoin-app my-app --provider lighthouse
```

This command initializes a new repository named `my-app` with Lighthouse as the storage onramp.

### Provider Options

#### Storacha NFTs

To initialize a project with Storacha NFT integration, we make use of the `--storacha` option:

```bash
npx create-filecoin-app my-app --provider storacha
```

#### Lighthouse NFTs

To initialize a project with Lighthouse NFT integration, we make use of the `--lighthouse` option:

```bash
npx create-filecoin-app my-app --provider lighthouse
```

#### Akave

To initialize a project with an Akave integration, we make use of the `akave` option:

```bash
npx create-filecoin-app my-app --provider akave
```

## Project Structure

After running the CLI, your project will have the following structure:

```
my-app/
├── packages/
│   ├── hardhat/
│   │   │── contracts
│   │   │── deploy
│   │   │── scripts
│   │   │── .env.example
│   │   │── README.md
│   │   │── package.json
│   │   └── ...
│   └── nextjs/
│       │── app
│       │── components
│       │── contracts
│       │── hooks/fil-frame
│       │── utils/fil-frame
│       │── .env.example
│       │── package.json
│       └── ...
│   
├── LICENSE
├── package.json
├── README.md
└── ...
```

## Requirements

- Node.js 18.17.0 or later
- Yarn package manager

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

<!-- ## License

MIT © -->
