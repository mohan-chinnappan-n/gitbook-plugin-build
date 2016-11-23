# Get started

## Instalation & Setup

* Follow [this steps](http://pandoc.org/installing.html) to install pandoc.
* Add pandoc binaries to your path which is highly recommended.
* Follow [this steps](https://toolchain.gitbook.com/setup.html) to install gitbook.
* Create initial gitbook project arhitecture and test if you can execute `gitbook build` command with success.

## Plugin setup

* Add **GPB** plugin to `(book.json).plugins` array, see gitbook [info about plugins](https://toolchain.gitbook.com/plugins).
* Add **GPB** configuration to `(book.json).pluginsConfig.build` object, or leave it empty to use default configuration.
* Default configuration is located [here at the bottom](https://plugins.gitbook.com/plugin/build).
* Install gitbook plugins by running `gitbook install`.
* To se which formats pandoc provides check `man pandoc`.

## Usage

Add `--plugin-build` flag to you gitbook command to start **GPB** build.
**GPB** will create output file base on [gitbook summary file](https://toolchain.gitbook.com/pages.html)...

```shell
gitbook serve --plugin-build
gitbook build --plugin-build
```

## Template

If you don't like how **GPB** creates output file you can setup custom
template which will follow your rules for compiling output file.

* Create file on path `(book.json).pluginsConfig.build.template`.
* Use [ejs templating](http://www.embeddedjs.com/) to parse `summary` array. Here is default template...

```javascript
<% for(let article in summary) {%>
<%- article.content %>
<% } %>
```

* Article object (`summary[i]`) structure... 

```json
{
  "title": <String>,    // Summary title.
  "content": <String>,  // Compiled content.
  "path": <String>,     // Relative source file path.
  "rawPath": <String>,  // Full source file path.
  "type": <String>      // Src file type (markdown or asciidoc).
}
```
