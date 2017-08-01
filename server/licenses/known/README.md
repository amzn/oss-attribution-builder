Each license in this directory must be a JavaScript (TypeScript) module with the following exports:

* `tags` - a list of tags relevant to this license
* `text` - the full text of the license, used if license text was not supplied by the user

For a description of tags, see the README in the tags directory next to this one.

The license text will be automatically stripped of leading and trailing newlines; other kinds of whitespace will be preserved.

The name of the license is inferred from the filename, and _should_ be an SPDX ID, however nothing will break if it isn't.