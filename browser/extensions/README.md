# Display Extensions

Display extensions allow site administrators to change how the attribution builder looks and functions on the client side. You can think of them like plugins for a template engine. They can alter things like the site name/logo, footer, and other pieces as functionality is added.

## Format

An extension must:

* Be located in the `extensions` directory (this one).
* Have an extension of `.ext.ts`, `.ext.tsx`, `.ext.js`, or `.ext.jsx`.
* Import/require the `register` function from `../ext`.
* Call `register` with two parameters:
    * `extensionPoint` _(string)_ - The name of the extension point (hook) where your extension will run.
    * `ext` _(function)_ - The function that will be called when this extension is triggered. Parameters and return values may vary for each extension point; see below.

### Example

See `DemoFooter.ext.tsx` in this directory. This extension adds a link to this project's GitHub page in the footer.

## Extension Points

The following are the current extension points shipped with oss-attribution-builder. If you think there should be another, feel free to submit an issue or pull request.

### `footer`

Add a page footer with links to your site/company's support resources.

A [React functional component].

* Input:
    * `props` - React props. Empty.
* Return: a rendered React component.

### `navbar-logo`

Replace the "Attribution Builder" text with your own text or logo.

A [React functional component].

* Input:
    * `props` - React props:
        * `children` - the default header text
* Return: a rendered React component.

[React functional component]: https://reactjs.org/docs/components-and-props.html#functional-and-class-components