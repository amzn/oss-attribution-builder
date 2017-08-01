Tags for validation purposes should be placed here.

Validation levels:
* 0 - Error
* 1 - Warning
* 2 - Note

## Exports

A tag module has the following exports:

* `validateSelf(name, text, tags)` _**(required)**_

  Validate the existence of a license on a given project. The license name, supplied text, and any other tags will be provided. This function should return a list of messages in the format:

  ```
  {level: 0, message: ''}
  ```

  where `level` is a validation level described above, and `message` is any message you want displayed in the output. Messages are displayed in the "Warnings and Notes" section before the document preview.

  The supplied text may be empty, if the license text was known and not asked for. For example, Apache 2.0 has standard license text, so it's expected that a user would not enter `text` here if `name` is `"Apache-2.0"`.

  `tags` includes all tags applied to the current license. This may be useful in the `all` tag if you want to check for the existence or absence of any other tags.

* `validateUsage(usage)` _**(required)**_

  Validate the license against how it was used in this project.
  Usage information, in the same format as stored in the database, will be supplied.

  This function should return a list of messages in the same format as `validateSelf`.

* `transformCopyright(original)` _(optional)_

  A tag may implement this to change how a copyright statement is rendered in the output document. For example, the `notice` tag clears this out in favor of showing statements in a different section of the document.

* `transformLicense(original, packages)` _(optional)_

  A tag may implement this to change how a license itself is rendered in the output document. It receives the original license text and a list of packages. For example, the `notice` tag uses this to re-locate copyright statements to a "NOTICE" section following the license.

## Meta tags

The following tags are more deeply integrated into the generator and should not be deleted:

* `all` - applied to all packages in a document
* `unknown` - applied to packages which use a license not known by the generator
* `fixed-text` - used by the UI to hide the license text box; useful for license texts that should never be changed
