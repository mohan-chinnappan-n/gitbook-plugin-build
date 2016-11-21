This document describes how to set up your development environment to build and test project. 
It also explains the basic mechanics of using `git`, `node`, `npm`, `gulp`.

See the [contribution guidelines](/contribution)
if you'd like to contribute.

## Prerequisite Software

Before you can build and test project, you must install and configure the
following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version `>=0.10 <6`) which is used to run,
  run tests, source files. We also use Node's Package Manager, `npm`
  which comes with Node. Depending on your system, you can install Node either from
  source or as a pre-packaged bundle.

## Getting the Sources

Fork and clone the project repository:

1. Login to your GitHub account or create one by following the instructions given
   [here](https://github.com/signup/free).
2. [Fork](http://help.github.com/forking) the [main project 
   repository](https://github.com/urosjarc/generator/generator2).
3. Clone your fork of the Angular repository and define an `upstream` remote pointing back to
   the Angular repository that you forked in the first place.

```shell
# Clone your GitHub repository:
git clone git@github.com:<github username>/generator-generator2.git

# Go to the project directory:
cd generator-generator2

# Add the main project repository as an upstream remote to your repository:
git remote add upstream https://github.com/urosjarc/generator-generator2.git
```

## Installing NPM Modules

Next, install the JavaScript modules needed to build and test project:

```shell
# Install project dependencies (package.json)
npm install
```

**Optional**: In this document, we make use of project local `npm` package scripts and binaries
(stored under `./node_modules/.bin`) by prefixing these command invocations with `$(npm bin)`; in
particular `gulp` commands. If you prefer, you can drop this path prefix by either:

*Option 1*: globally installing these two packages as follows:

* `npm install -g gulp` (you might need to prefix this command with `sudo`)

Since global installs can become stale, and required versions can vary by project, we avoid their
use in these instructions.

## Running Tests Locally

```shell
#Runing test suite:
gulp test

#Simulate CI testing:
gulp test:CI
```
