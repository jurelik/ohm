# contributing
Thank you for your interest in contributing to the ohm project.

Please be aware that we are using [git-flow](https://nvie.com/posts/a-successful-git-branching-model/) as our branching model. Please base any pull requests off of the latest dev branch and title your branches accordingly - e.g. use `feature/` when implementing a new feature and `fix/` when fixing an issue. Title any other types of branches in a way that makes sense semantically.

Please look at the surrounding code before making changes and try to emulate the linting style of the existing codebase for consistency. As a rule of thumb:
1. Keep your code clean and easy to understand. Avoid using non-descriptive names for variables and functions and instead use semantic names that make code easy to read:
```
const logMessage = (msg) => console.log(msg);

// instead of

const lm = (x) => console.log(x);
```
2. Keep code in one line if possible:
```
if (condition === true) console.log('hello');

// instead of

if (condition === true) {
  console.log('hello');
}
```
3. Nest to a maximum of 5 levels - if you need to nest further consider refactoring.
4. Functions have a maximum of 3 arguments - if more are needed consider replacing the arguments with an `options` object.
