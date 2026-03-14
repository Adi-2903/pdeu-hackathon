---
description: How to handle repetitive refactoring and code cleanup tasks
---

This workflow outlines the steps to perform large-scale, repetitive code modifications, such as folder reorganization, import path updates, and component flattening.

### 1. Preparation
- **Check Repository Status**: Ensure the working directory is clean using `git status`.
- **Plan the Changes**: Create a mapping of old file paths to new file paths.
- **Identify Repeated Patterns**: Note frequent import path segments that will need updating.

### 2. Execution
- **Create Folder Structure**: Use `mkdir -p` (or PowerShell equivalent) to create all destination directories first.
- **Move Files**: Use `git mv` for each file to preserve history.
  - If moving multiple files in a folder, use a loop:
    ```powershell
    Get-ChildItem -Path "source/folder" -File | ForEach-Object { git mv $_.FullName "destination/folder/$($_.Name)" }
    ```
- **Consolidate Logic**: Identify repeated code/queries and move them to a shared library file (e.g., `lib/db/queries.ts`).

### 3. Updating Imports
- **Batch Replacement**: Use a script to perform search-and-replace for import paths across all relevant files.
  - Update `tsconfig.json` path aliases if necessary.
  - Update `next.config.js` if internal directories change.

### 4. Verification
- **Run Build**: Execute `npm run build` to catch broken imports or type errors.
- **Fix Errors**: Sequentially address any errors reported by the compiler or linter.
- **Test Core Functionality**: Verify that the application still runs and key features work as expected.

### 5. Finalizing
- **Remove Empty Directories**: Clean up any remaining empty source folders.
- **Commit Changes**: Once verified, commit the changes with a descriptive message.
