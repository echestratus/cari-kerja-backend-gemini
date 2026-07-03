# Git & DevOps Workflow Rules

- **Always Create a Branch for Changes**: Before making any code modifications, create and checkout a new branch following the conventional naming standard (e.g., `feat/feature-name`, `fix/bug-name`, `refactor/component-name`, `chore/task-name`). Never push directly to `main` without creating a branch first.
- **Commit and Push Automatically**: After finishing a task or making meaningful changes, automatically stage, commit (using Conventional Commits), and push the branch to the repository.
- **Pull Request Flow**: The branch will be merged to `main` via Pull Request later. Let the user know the branch has been pushed.
