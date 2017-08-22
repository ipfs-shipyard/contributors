# Contribs

Create a page that can be embedded on a website that lists project contributors.

## Examples

```sh
node scripts/bin/create protocol.ai --org all --duration 180 --spacing 10 --background "black" --title "Protocol Labs Contributors"
```

![screen shot 2017-08-01 at 17 13 36-fullpage](https://user-images.githubusercontent.com/152863/28835323-dd126eb0-76dc-11e7-99a7-e7ae4495b203.png)

```sh
node scripts/bin/create libp2p.io --org libp2p --rows 5 --width 124 --title "libp2p contributors"
```

![screen shot 2017-08-01 at 17 13 11-fullpage](https://user-images.githubusercontent.com/152863/28835317-db6147c6-76dc-11e7-9717-0d86f0656405.png)

## Install

```sh
git clone https://github.com/...
```

Install dependencies:

* [Node.js](https://nodejs.org/) >= 6
* [Hugo](https://gohugo.io/)

Note that `sharp` (image manipulation library) has additional dependencies that should just work:

> Most recent Linux-based operating systems with glibc running on x64 and ARMv6+ CPUs should "just work"

If you're having a bad time then check the [installation requirements here](http://sharp.dimens.io/en/stable/install/).

## Usage

### Create a new project page

```sh
node scripts/bin/create my-project-name --title "My project Name" --org all --size 240
```

N.B. `node scripts/bin/create --help` for [usage instructions](scripts/bin/create.usage.txt)

### Update an existing project page

Using the existing config, this will fetch an updated list of contributors from the API, update the avatars for each contributor, and apply any config changes passed.

```sh
node scripts/bin/update my-project-name
# You can also pass the same args to the update script as you can to the create
# script, but configuration is saved on create so you don't have to \o/
```

N.B. `node scripts/bin/update --help` for [usage instructions](scripts/bin/update.usage.txt)

### Delete an existing project page

```sh
node scripts/bin/delete my-project-name
```

N.B. `node scripts/bin/delete --help` for [usage instructions](scripts/bin/delete.usage.txt)

### Verbose logging

Add a DEBUG environment variable to see some logs.

```sh
DEBUG=contribs:* node scripts/bin/update my-project-name
```

### Embedding a page

```html
<!doctype html>
<html>
<head>
  <style>
    body {
      margin: 0;
      background: red;
    }
    iframe {
      border: 0;
      width: 100%;
      height: 312px;
    }
    @media (min-width: 570px) {
      iframe {
        height: 606px;
      }
    }
  </style>
</head>
<body>
  <iframe src="http://localhost:1313/projects/protocol.ai/"></iframe>
</body>
</html>
```

### Deploy

To deploy the site, run:

```sh
# Build out the optimised site to ./public, where you can check it locally.
make

# Add the site to your local ipfs, you can check it via /ipfs/<hash>
make deploy
```

The following commands are available:

#### `make`

Build the optimised site to the `./public` dir

#### `make serve`

Preview the production ready site at http://localhost:1313 _(requires `hugo` on your `PATH`)_

#### `make dev`

Start a hot-reloading dev server on http://localhost:1313 _(requires `hugo` on your `PATH`)_

#### `make minify`

Optimise all the things!

#### `make deploy`

Build the site in the `public` dir and add to `ipfs` _(requires `hugo` & `ipfs` on your `PATH`)_
