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

### `landing-after`

Add additional information to the landing/home page, after the "jumbotron" description and buttons.

A [React functional component].

* Input:
    * `props` - React props. Empty.
* Return: a rendered React component.

### `landing-description`

Add to or replace the description on the landing page, above the project buttons.

A [React functional component].

* Input:
    * `props` - React props:
        * `children` - default description
* Return: a rendered React component.

### `navbar-logo`

Replace the "Attribution Builder" text with your own text or logo.

A [React functional component].

* Input:
    * `props` - React props:
        * `children` - the default header text
* Return: a rendered React component.

### `navbar-end`

Add additional items to the end of the navbar.

A [React functional component].

* Input:
    * `props` - React props. Empty.
* Return: a rendered React component.

### `package-editor-end`

Add additional instructions or logic after the package editor form (but before the save/add button).

A [React functional component].

* Input:
    * `props` - React props:
        * `project` - An object describing the current project. See [WebProject].
        * `pkg` - An object describing the package information. See [WebPackage].
        * `usage` - An object describing usage information. See [PackageUsage].
        * `license` - An object describing the selected license. See [WebLicense].
        * `questions` - A list of questions displayed on the form. Selections will be present in `usage`, not here. See [TagQuestion].
* Return: a rendered React component.

### `page-end`

Add content to the end of the page.

A [React functional component].

* Input:
    * `props` - React props. Empty.
* Return: a rendered React component.

### `page-not-found`

Customize the 404 page (for client-side routes).

A [React functional component].

* Input:
    * `props` - React props:
        * `children` - Default 404 error content, inside a Bootstrap card body.
        * `match` - A react-router match object; see its `path` property for the current location.
* Return: a rendered React component.

### `page-start`

Add content to the beginning of the page.

A [React functional component].

* Input:
    * `props` - React props. Empty.
* Return: a rendered React component.

[React functional component]: https://reactjs.org/docs/components-and-props.html#functional-and-class-components
[WebProject]: ../../server/api/projects/interfaces.ts
[WebPackage]: ../../server/api/packages/interfaces.ts
[PackageUsage]: ../../server/api/projects/interfaces.ts
[WebLicense]: ../../server/api/licenses/interfaces.ts
[TagQuestion]: ../../server/licenses/interfaces.ts