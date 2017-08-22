# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html), as much as
a website reasonably can. Backwards incompatible changes (requiring a major version bump) will be
described here, and may involve database changes, significant workflow changes, or changes that
require manual edits to pluggable interfaces.

## Unreleased

### Added
- Auth backends can now specify how a user should be authenticated, via Passport. They should
  provide an `initialize` method that is called during app start-up. This can be used to register
  Passport strategies, login URLs, or any other session activities.
- SPDX license texts are now shipped with the attribution builder.
- License tags can now specify presentation options to influence how they appear in the package
  editor. They can be sorted first, annotated with text (both in menu and below), and control
  whether users are asked for the full license text.

### Removed
- JWT sessions are no longer in use. See the above addition about auth backends for an alternative.

### Changed
- Project ACLs are now sanely validated, with levels of "owner", "editor", and "viewer". A viewer
  can only view a project. An editor can change project details, except for the ACL. An owner can
  change everything about a project.
- Users on a project contact list implicitly have "viewer" permissions unless otherwire specified.

### Fixed
- Some lingering Bootstrap CSS issues were cleaned up.
- The `validateUsage` function (used in tags) was incorrectly documented.

## 0.8.0 - 2017-08-04

- Initial release.