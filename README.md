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

If you're ready to integrate the attribution builder into your own environment, there are some things to set up:

### Configuration

Open up [config/default.js](config/default.js) and poke around. This configuration launches when you run `docker-compose` or otherwise launch the application.

### Licenses

The attribution builder has support for two types of license definitions:

* SPDX identifiers
* "Known" license texts and tags

SPDX identifiers are just used for pre-filling the license selector, but do not (currently) have texts. The more useful type of license is a "known" license, where **you** (the administrator) supply the text of the license and any tags you'd like to apply.

For information on adding your own "known" licenses, see [the license README](server/licenses/known/README.md). There are two existing licenses in the same directory you can look at for examples.

#### Tags

Tags allow you to add arbitrary validation rules to a license. They can be useful for:

* Verifying a license is being used in the right way (e.g., LGPL and how a package was linked)
* Annotating a particular license as needing follow up, if your business has special processes
* Providing guidance on attribution for licenses with many variants
* Modifying the how a license is displayed in an attribution document

For information on what tags can do and how to create your own, see [the tags README](server/licenses/tags/README.md).

### Authentication module

The attribution builder supports being able to restrict access to certain people or groups using project ACLs. These can also be used for administration and to "verify" packages (details on that in a later section). The default implementation `nullauth` is not very useful for most environments; you will want to write your own when launching more broadly.

See [the base auth interface](server/auth/base.ts) for implementation details.

### Running

To start up the server, you should run `build/server/localserver.js` after building with `gulp`. There are some environment variables you'll probably want to set when running:

* `NODE_ENV` should most likely be set to `production`
* `CONFIG_NAME` should be set to the basename (no extension) of your configuration file you created above. The default is "default".

The server runs in HTTP only. You probably want to put a thin HTTPS web server or proxy in front of it.

## Using the Website

See documentation:

* [For users](docs/for-users.md)
* [For administrators](docs/for-admins.md)

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for information.

### Development

`npm install` and then `npm run dev` will get you off the ground for local development. This will start a Docker container for PostgreSQL, but will use a local copy of gulp, node, etc so you can iterate quickly.

Once things have started up, you can open http://0.0.0.0:8010/webpack-dev-server/. This will automatically reload on browser changes, and the backend will also automatically restart on server-side changes.

Handy environment variables:

* `NODE_ENV`: when unset or `development`, you'll get full source maps & debug logs
* `DEBUG_SQL`: when set (to anything), this will show SQL queries on the terminal as they execute

#### Testing

`npm test` or `gulp test` will run unit tests. These are primarily server focused.

`gulp test-ui` will run Selenium tests. You can set the environment variable `SELENIUM_DRIVER` if you want a custom driver -- by default, it'll try to use Chrome, and if that's not available it'll fall back to PhantomJS.