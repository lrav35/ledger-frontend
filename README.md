# React Hello World App

A simple React Hello World application that runs and builds with Bun.

## Prerequisites

Make sure you have Bun installed. If not, install it with:

```bash
curl -fsSL https://bun.sh/install | bash
```

Then restart your terminal or run:
```bash
source ~/.bashrc
```

## Installation

Install dependencies:

```bash
bun install
```

## Development

To run the development server:

```bash
bun run dev
```

This will start the development server at http://localhost:3000

## Build

To build the application for production:

```bash
bun run build
```

This will create a `dist/` directory with the bundled JavaScript file.

## Project Structure

```
├── src/
│   ├── App.tsx          # Main React component
│   └── index.tsx        # Entry point
├── public/
│   └── index.html       # HTML template
├── dist/                # Build output (created after running build)
├── package.json         # Project configuration
└── README.md           # This file
```
