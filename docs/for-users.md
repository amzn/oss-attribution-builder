# For Users

The attribution builder revolves around projects. A project is just a version of software that you plan on distributing. For example, a mobile app would be a project. A project contains a list of open source packages used, along with information on how they were used and licensed. A project ultimately outputs a single attribution document

From the front page of the website, you have the option of creating a new project or exploring existing projects that you have access to.

## Working with Projects

A project includes information needed to generate your attribution document. You can create your project at any time and update its information whenever you need.

To start, just click "New Project" from the homepage. You will be asked for some basic information about your project, such as:

* What it is
* Who your legal contact is
* Your release date
* Who manages the project

Once you've filled those details out, hit Next and you'll be shown your project:

((IMAGE))

You can click anything underlined with dashes to edit the details.

### Adding Packages

Now we get to the fun part: adding the list of open source packages you used. You will be asked for a lot of information here, but it's all used to speed up the process of building and reviewing your document. The website will save everything you input here in a shared database so that future projects you create will have some information already completed.

To add a package, click the blue "Add Package" button. You'll see a form with a bunch fun buttons to press, but the most important thing is this box:

((IMAGE))

As it suggests, start typing in the name of an open source package used in your project. If the exact version already exists in our database, select it. If not, select the option to create a new package. You will need to fill out information about the package. If you were lucky, some of these fields will already be filled out.

((IMAGE))

When picking a license, you might not have to paste in the text of the license if we already have it stored. If you're unsure what the name of the license is, paste the text into the larger box below the dropdown instead.

The copyright statement is common across most open source packages, and usually looks something like "Copyright © 2008-2012 Michael Bluth". For some packages, there may be a "NOTICE" file; you can paste that in here as well.

Finally, we'll ask you if you modified this package, and if it was linked dynamically or statically. You can add notes about your usage of this package for others; these notes won't appear in your attribution document but may be useful for your team for review.

If you've made a mistake and need to remove a package, just click the "X" on the top right corner of the package in your project.

If you need to edit a package's details instead, remove it and re-add it -- the details of the package are saved and you won't need to re-enter everything.

## Attribution Documents

This is the simplest step: once you've added your packages, click the big green Build button. You'll be taken to a screen with the text of your attribution document and any warnings/issues we have found. Clicking on a warning will highlight the relevant section in your document.

When you've decided your document looks finished, scroll back up to the top and press "Save & Download". You'll get a copy of the document to distribute, and it will be stored in the attribution builder database in case it ever needs to be recovered.