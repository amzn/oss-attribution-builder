# For Staff and Administrators

## A Note about Packages

Packages in the attribution builder are shared site-wide. This means that team A can enter in the details for (e.g.) WebKit 1.0, and team B can later on add WebKit to their document without needing to re-enter that information.

However, team B could also opt to change the information about WebKit 1.0, perhaps because they noticed it was incorrect. Their changes will update the site-wide copy of WebKit 1.0, but they _will not_ affect projects that previously added the package. Each package & version is stored with a revision ID, so teams effectively cannot tamper with projects they do not own.

## Administration

At the moment, there aren't any explicit administration actions. However, if you are an admin (i.e., your group was specified in the config file), then you will see an "Admin" link at the bottom right of every page. Clicking it will make a small checkbox appear, and at that point you will be able to browse through and edit projects while skipping access control lists.

## Verifying Packages

You may designate an additional group in the configuration as "verifiers". Verifiers have access to a hidden interface located at `[domain.com]/packages/verify`. This screen will list the most popular packages entered into the system.

Selecting a package will open a form with information about the package. A verifier can audit this information, and if everything looks OK they can check all of the boxes and save. If something looked wrong or needed corrections, they can be noted in the comments box and saved.

![screenshots/package-verify-form.png](https://raw.github.com/amzn/oss-attribution-builder/screenshots/package-verify-form.png)

So why do this? Well, on a project page, anyone using that revision of a package (see above -- there may be multiple revisions of package version) will see a checkmark or a thumbs-down icon, indicating that the information about a package was correct or that it needs to be fixed.

![screenshots/package-card-wrong.png](https://raw.github.com/amzn/oss-attribution-builder/screenshots/package-card-wrong.png)

Clicking on the icon will reveal who verified the information and any comments entered. Using this functionally you can effectively audit and curate the local information entered into your company's attribution documents.