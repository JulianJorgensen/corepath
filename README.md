# CorePath Robotics website

## 1. Technologies

Some technologies you should have already installed:

* Ruby 2.0 (type `ruby -v` to see what version you have.
* [Homebrew](http://brew.sh/)
* [Bundler](http://bundler.io)
* [Node](http://nodejs.org/)
* [npm](http://npmjs.com/)
* [Gulp](http://gulpjs.com/)

Gulp powers the CoffeeScript/Javascript/SASS compilation, transpiling, and
bundling. [Jekyll](http://jekyllrb.com/) builds out the actual site.

Front-end frameworks:
* [Jekyll static site compiler](http://jekyllrb.com/docs/home/)
* [Zurb Foundation 6](http://foundation.zurb.com/sites/docs/grid.html)


## 2. Getting Started

The very first thing you'll need to do is to fork the [Github project](https://github.com/JulianJorgensen/corepath).

Clone your fork and add the upstream:

`git remote add upstream https://github.com/JulianJorgensen/corepath`


### 2.1 Steps to install

If you are using Boxen, please run `cd /opt/boxen; bin/boxen` first and make sure there are no errors.

1. `brew update` (update brew formulas)
2. `brew install rbenv` (install rbenv, a ruby version manager)
3. `brew install nvm` (install node version manager)
4. `cd ~ && mkdir .nvm` (create a folder for node versions)
5. In your `./bash_profile` add the following (tells your shell to use nvm)
```
# NVM
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh
```
6. `cd ~/Sites/corepath` (go to corepath repo)
7. `rbenv install` (install the specified ruby version)
8. Verify you are using the correct ruby version by running `rbenv versions` or `ruby -v` (it should use the ruby version specified by `.ruby-version`)
9. `gem install bundler` (install gem (= ruby packages/libraries) management tool)
10. `bundle install` (install required gems (specified in `Gemfile`)
11. `nvm version` (see current version of node)
12. `nvm install` (install required node version)
13. Verify you are using the correct nvm version by running `nvm version` or `node -v` (to see that the system is using the right node version)
14. `bundle`
15. `npm install` (install packages based on package.json file) Note: you may need to run `npm cache clean`
16. `npm install --global foundation-cli` (install foundation)
17. `npm install --global gulp`
18. `npm start`

The site should now open automatically in a new browser using BrowserSync. You can also access the site manually here: [http://localhost.corepath.dk:3000](http://localhost.corepath.dk:3000) or simply [http://localhost:3000](http://localhost:3000), but for TypeKit and other white-listing sites, it is recommended you use the localhost.corepath.dk:3000 url.


### 2.2 BrowserSync

BrowserSync is a front-end development on steroids. Whenever you change a style file it automatically injects it into the browser. For all other files the browser automatically reloads.


## 3. Commits and branches

`master` branch is the main branch.

Any features/fixes should be developed in a feature branch based off of the latest `upstream/master`:

```
git checkout master
git fetch upstream && git merge upstream/master
git checkout -b feature-foo-bar
```

Be cognizant of your commits. That is, don't just `git commit -a`; instead,
inspect your commits and ensure you are committing what you intend to commit,
and that you are not forgetting to add any new files. The [Github desktop
application](https://mac.github.com) or [GitX](http://rowanj.github.io/gitx/)
are great tools that help with this.

After committing, do a pull request. [Hub](https://hub.github.com) makes this
easy from the command line. (We recommend not aliasing `git` to `hub`.)

`hub pull-request -b JulianJorgensen:master --browse`


## 4. Javascripts (and CoffeeScripts)


### 4.1 CoffeeScript is to Javascript, like SASS is to CSS
Our custom Javascript code should be preferably written in
[CoffeeScript](http://coffeescript.org/) and placed in `_source/_assets/js/`. Old-fashioned Javascript is also welcome.

### 4.2 Adding JS/Coffee files
Any new CoffeeScripts or Javascripts should work fine as long as they are placed in the correct folders.

| Custom JS/CoffeeScripts | Vendor JS                    |
| ----------------------- |:----------------------------:|
| `_source/_assets/js`     | `_source/_assets/vendor/js`   |

*After adding the new JS/Coffee file, remember to also add it to the gulp config file located here: `gulp/config.yml`.*

### 4.3 Third-party scripts (vendor)

All Third-party javascripts goes into `_source/_assets/vendor/js` folder, unless it is a frame-work; then it goes into `_source/_assets/vendor/` folder.

### 4.4 JS manifest and compiler

All JS/Coffee files gets compiled into one manifest .js file using the files specified in: `gulp/config.yml` (in the Javascript section).

If you want to understand how the bundling works, see the gulp files `gulp/tasks/javascript.js` and `gulp/tasks/watch.js`.

## 5. Styles

### 5.1 SASS
SASS files (using the SCSS variety) can be found in `_source/_assets/styles`. The main "manifest" for this site is found in `_source/_assets/styles/app.scss`, so if you create a new file or remove an existing, you'll need to update the manifest.

If you want to understand how the bundling works, see the gulp file `gulp/tasks/sass.js` and `gulp/tasks/watch.js`

### 5.2 Foundation
Last year we used Bootstrap 3. It does not include Flexbox support and is outdated in many ways. Bootstrap 4 is much improved, but is not quite production-ready yet. That is why we decided to switch to the newly released Zurb Foundation framework, which is very similar to Bootstrap (and often gets more acclaim from the front-end community).

Here are some documentation of the basic components using Foundation:
  [Grid (using Flex)](http://foundation.zurb.com/sites/docs/flex-grid.html)
  [More details on Flexbox here](http://foundation.zurb.com/sites/docs/flexbox.html)
  [Forms](http://foundation.zurb.com/sites/docs/forms.html)
  [Buttons](http://foundation.zurb.com/sites/docs/button.html)
  [Visibility (depending on screen widths)](http://foundation.zurb.com/sites/docs/visibility.html)

### 5.3 Customizing Foundation

You can add Foundation style modules in the file `_source/_assets/styles/foundation/_foundation.scss` simply by uncommenting the line.

Foundation variables can found in `_source/_assets/styles/foundation/_settings.scss`.
So **before** overriding any Foundation styles, check to see if there is a corresponding variable you can set in the `_source/_assets/styles/foundation/_settings.scss` configuration file.

### 5.4 Style architecture
We are using the [SMACSS (Scalable and Modular CSS)](https://smacss.com) architecture. (It is simpler than it sounds).

#### 5.4.1 Helpers
Helpers include mixins, functions and other minor style classes that are repeated throughout the site.

#### 5.4.2 Base styles
Base styles include setting heading sizes, default link styles, default font styles, and body backgrounds. There should be absolutely no need to use !important in a Base style.

#### 5.4.3 layouts
There is a distinction between layouts dictating the **major** and **minor** components of a page. The minor components—such as a callout, or login form, or a navigation item—sit within the scope of major components such as a header or footer. The minor components are often referred to as **Modules**. The major components are referred to as **Layout styles**.

#### 5.4.4 Modules
A Module is a more discrete component of the page. It is your navigation bars and your carousels and your dialogs and your widgets and so on. This is the meat of the page. Modules sit inside Layout components. Modules can sometimes sit within other Modules, too. Each Module should be designed to exist as a standalone component. In doing so, the page will be more flexible. If done right, Modules can easily be moved to different parts of the layout without breaking.

Avoid using IDs for modules - they should only use classes.

#### 5.4.5 States
A state is something that augments and overrides all other styles. For example, an accordion section may be in a collapsed or expanded state. A message may be in a success or error state.

States are generally applied to the same element as a layout rule or applied to the same element as a base module class.

#### 5.4.6 !Important
As a rule of thumb, the use of `!important` should almost **never** be used. Organizing your styles correctly, will automatically create the correct hierarchy.

**You can learn about the ordering and semantics in the style manifest file located under `_source/_assets/styles/app.scss`.**


## 6. Typography

### 6.1 Use only em and rem

When possible, use the rem and em units to size everything. Not just font size, but also padding, margins, and any length value. This ensures that your design scales up and down uniformly if the user changes their browser's text size. It's common for vision-impaired users to resize their browser up to 200% zoom.

You can use the Sass function to make it a little easier. The rem-calc() function can take one or more pixel values and convert them to proper rem values.

```
.element {
  width: rem-calc(300);
  padding: rem-calc(10 16);
}
```

### 6.2 em vs rem

While em is relative to the font-size of its direct or nearest parent, rem is only relative to the html (root) font-size.
This is crucial to understand, so if in doubt, [please read](https://j.eremy.net/confused-about-rem-and-em/)

### 6.3 Font scales for breakpoints

Foundation includes two typographic scales. One uses a narrow range of sizes for small- and medium-sized screens, and the other uses a wider range of sizes for large-sized screens. You can change these scales, or add new ones for other breakpoints, by editing the $header-sizes map in the Foundation Settings File.

### 6.4 Photoshop mock-ups conversion
`rem` is based off of body font size. Typically that font size is 16px.
So to figure out the correct *em* value from what's specified in *pt* in the
Photoshop comps, we'll multiply the *pt* value by `0.0625` (or 1/16). So a font
set to 20pt with a line-height of 24pt would be written up as:

```css
p
{
  font-size: 1.25em;
  line-height: 1.5em;
}
```

But with the power of SASS, we can do better. Let's forget about doing any math:

```css
p
{
  @include font-size-em(20);
  @include line-height-em(24);
}
```

Or, more simply:

```css
p
{
  @include font-em(20, 24);
}
```

You'll see the corresponding sizes in the Photoshop mock-ups:

![character panel](https://cloud.githubusercontent.com/assets/13967/6607224/6b628a5e-c7fa-11e4-8957-16cb763c726f.png)


## 7. TypeKit Information
