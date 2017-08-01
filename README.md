# OSS Attribution Builder

OSS Attribution Builder is a website that helps teams create attribution documents for software products. An attribution document is a text file, web page, or screen in just about every software application that lists the software components used and their licenses. They're often in the About screens, and are sometimes labeled "Open Source Notices", "Credits", or other similar jargon.

## Quickstart

1. Install [Docker](https://www.docker.com/)
2. Clone this repository
3. Run `docker-compose up`

## Caveats

The attribution builder was originally an Amazon-internal tool. Some portions had to be removed to make this a sensible open source project. As such, there are some warts:

* Projects have ACLs, but they aren't properly enforced. The `owner` level is the only one that currently has any effect.
* Projects also have contact lists, but at the moment the UI only supports one contact (the legal contact).
* There are only two sample license texts included. Texts from SPDX licenses need to be imported.
* The UI was recently migrated from Bootstrap 3 to 4. Some styles might be messy.
* The default auth backend (`nullauth`) is a useful demo, but not useful as an authentication solution. Do **not** launch into production without implementing an authentication backend fitting your environment.
* JWTs are used for sessions. These are going to be removed and replaced with something more maintainable (Passport or equivalent).
* Selenium tests are likely very broken. These were created for use in an Amazon environment and have not yet been updated.
* The website needs Node 6.x to build, due to usage of Gulp 3. It should still _run_ on 8, however.
* Other dependencies are fairly out of date as well.
* tslint rules are included, but a lot of files do not pass style checks. These rules were recently updated.

These will all be fixed in time, but be aware that some things might be weird for a while.

## Custom deployment

### Configuration

### Licenses

### Authentication module

## Using the Website

### Working with Projects

### Administration

### Verifying Packages

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for information.

### Development

(TODO)

`npm install` and then `npm run dev` will get you off the ground for local development. This will start a Docker container for PostgreSQL, but will use a local copy of gulp, node, etc so you can iterate quickly.
