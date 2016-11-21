# Get started

## Instalation & Setup

1. Follow [this steps](http://pandoc.org/installing.html) to install pandoc.
1. Add pandoc binaries to your path which is highly recommended.
1. Follow [this steps](https://toolchain.gitbook.com/setup.html) to install gitbook.
1. Create initial gitbook project arhitecture and test if you can execute `gitbook build` command with success.

## Plugin setup

1. Add **GPP** plugin to `(book.json).plugins` array, see gitbook [info about plugins](https://toolchain.gitbook.com/plugins).
1. Add **GPP** configuration to `(book.json).pluginsConfig.pandoc` object, or leave it empty to use default configuration...

    ```json
    {
      "bin": "pandoc",
      "args": [],
      "opts": {},
      "template": "_layouts/main.tex",
      "output": {
        "path": "build/main.tex",
        "format": "latex"
      }
    }
    ```

1. To se which formats

## Usage

Add `--pandoc` flag to you gitbook command to start **GPP** build.
**GPP** will create output file base on [gitbook summary file](https://toolchain.gitbook.com/pages.html)...

```
gitbook serve --pandoc
gitbook build --pandoc
```

## Template

If you don't like how **GPP** creates output file you can setup custom
template which will follow your rules for compiling output file.

1. Create file on path `(book.json).pluginsConfig.pandoc.template`.
1. Use [ejs templating](http://www.embeddedjs.com/) to parse `summary` array. Here is default template...

    ```javascript
    <% for(let article in summary) {%>
    <%- article.content %>
    <% } %>
    ```

1. Article object (`summary[i]`) structure... 

    ```json
    {
      "title": <String>,    // Summary title.
      "content": <String>,  // Compiled content.
      "path": <String>,     // Relative source file path.
      "rawPath": <String>,  // Full source file path.
      "type": <String>      // Src file type (markdown or asciidoc).
    }
    ```

## Report bugs & missing features

If you think this project is missing some important feature please
let contributors know about your thoughts! And of course we would
like to know about your bugs too! We like them but we will **smash** them!

1. Create new issue on [issues page](https://github.com/urosjarc/gitbook-plugin-pandoc/issues).
1. Fill issue form and report your bug.




