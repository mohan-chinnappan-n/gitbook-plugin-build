I would love for you to contribute to our source code and to make **GPP** even better than it is
today! Here are the guidelines for you to follow...

## Got a Question?

If you have questions about how to use **GPP**, please create new issue
in which you point out which section of documentation is lacking with information.

## Found an Issue?

If you find a bug in the source code or a mistake in the documentation, you can help by
submitting an issue to our [GitHub Repository][github]. Even better you can submit a Pull Request
with a fix.

## Want a Feature?

You can request a new feature by submitting an issue to our [GitHub Repository][github].  If you
would like to implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project make an issue explaining details.
  so that I can better coordinate efforts, prevent duplication of work, and help you to
  craft the change so that it is successfully accepted into the project.
* **Small Changes** can be crafted and submitted to the [GitHub Repository][github] as a Pull
  Request.


## Want a Doc Fix?

If you want to help improve the docs, it's a good idea to let others know what you're working on to
minimize duplication of effort. Create a new issue (or comment on a related existing one) to let
others know what you're working on.

## Submitting an Issue
Before you submit your issue search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue. Help to maximize
the effort on fixing issues and adding new features, by not reporting duplicate issues.
Providing the following information will increase the chances of your issue being dealt with
quickly.

**If you get help, help others. Good karma rulez!**

## Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

* Search [GitHub Repository][github] for an open or closed Pull Request
  that relates to your submission. You don't want to duplicate effort.
* Make your changes in a new git branch:

```shell
git checkout -b my-fix-branch master
```

* Create your patch, **including appropriate test cases**.
* Run test suite. and ensure that all tests pass.

```shell
npm test
```

* Commit your changes using a descriptive commit message.
* Push your branch to GitHub:

```shell
git push origin my-fix-branch
```

In GitHub, send a pull request to `gitbook-plugin-build:master`.

That's it! Thank you for your contribution!

## Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more tests.
* All public API methods **must be documented** with jsdoc3.
* Use our set of linting rules.

[github]: https://github.com/urosjarc/gitbook-plugin-build
