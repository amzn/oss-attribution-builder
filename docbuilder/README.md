This is a project being built to extract the "document generation" piece from oss-attribution-builder, so that you don't need a whole website & project manager just to create attribution documents.

It is/will be a library, and a command-line tool.

It's very much a work in progress, and will probably be split into its own repository and be renamed at some point.

TODO of wants:

* Flexible input formats
* Flexible output formats (full-scale templates? use an existing template engine?)
* Integrate "tags" from parent project in some fashion:
  * License transformations
  * Validations, annotations
  * Custom text input, maybe
* Use SPDX as default license source, but allow for others (this may already be done, kinda)

Ideally this'd look like a processor in a pipeline:

```
  * generic package structures --.
  * npm license data ------------|                  .--> text output
  * cargo license data ----------+--- generator ----+--> html output
  * pypi license data -----------|    & validator   |--> android activity
  * clearlydefined data ---------'                  '--> ...
  * ...
```