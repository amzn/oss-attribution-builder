Tags for validation purposes should be placed here.

Validation levels:
* 0 - Error
* 1 - Warning
* 2 - Note

## Exports

A tag module has the following exports:

* `validateSelf(name, text, tags)` _**(required)**_

  Validate the existence of a license on a given project. The license name, text, and any other tags will be provided. This function should return a list of messages in the format:

  ```
  {level: 0, message: ''}
  ```

  where `level` is a validation level described above, and `message` is any message you want displayed in the output. Messages are displayed in the "Warnings and Notes" section before the document preview.

  The license text may be the internal/known/SPDX version, or it may be the user-supplied text. User-supplied text gets priority; to know when this occurs you can check for the `user-supplied` tag.

  `tags` includes all tags applied to the current license. This may be useful in the `all` tag if you want to check for the existence or absence of any other tags.

* `validateUsage(pkg, usage)` _**(required)**_

  Validate the package against how it was used in this project.
  Usage information, in the same format as stored in the database, will be supplied.

  This function should return a list of messages in the same format as `validateSelf`.

* `transformCopyright(original)` _(optional)_

  A tag may implement this to change how a copyright statement is rendered in the output document. For example, the `notice` tag clears this out in favor of showing statements in a different section of the document.

* `transformLicense(original, packages)` _(optional)_

  A tag may implement this to change how a license itself is rendered in the output document. It receives the original license text and a list of packages. For example, the `notice` tag uses this to re-locate copyright statements to a "NOTICE" section following the license. The `spdx` tag uses this to word-wrap SPDX-provided licenses to 80 characters.

* `presentation = {}` _(optional)_

  For website/UI purposes, a tag may suggest presentation options. These options are keys of an object named `presentation` (not a function). All are optional.

  Available options:

  * `sortFirst` (boolean, default false) - specifies whether this license should appear above others in a listing.
  * `shortText` (string) - can add text to license listings, for example on the license dropdown. keep it short; picking an emoji might be a good idea!
  * `longText` (string) - displayed below a license when selected.
  * `fixedText` (boolean, default false) - if set, removes the textarea for pasting a custom license when a license with this tag is selected. primarily used by the `fixed-text` tag.

  Example:

  ```
  export const presentation = { showFirst: true; }
  ```

  For more usage examples, see tags `fixed-text` and `popular`.

## Meta tags

The following tags are more deeply integrated into the generator and should not be deleted:

* `all` - applied to all packages in a document
* `unknown` - applied to packages which use a license not known by the generator -- matched by license name
* `fixed-text` - used by the UI to hide the license text box; useful for license texts that should never be changed
* `spdx` - applied to SPDX-supplied licenses (so, most that ship with the attribution builder)
* `user-supplied` - applied to any licenses where the user supplied the text, unknown license or not

Note the key differences in `user-supplied` and `unknown`; `unknown` refers to the license by name being unknown, where user-supplied is applied if any license is pasted in. So, both `unknown` and `user-supplied` will apply to a license where only the text was pasted in, but only `user-supplied` would apply if they selected BSD-3-Clause *and* pasted in a license.
