# Contribs

Create a page that can be embedded on a website that lists project contributors.

## Dependencies

* [Node.js](https://nodejs.org/) >= 6
* [Hugo](https://gohugo.io/)

## Create a new project page

```sh
node scripts/bin/create my-project-name --title "My project Name" --org all --size 240
```

## Update an existing project page

```sh
node scripts/bin/update my-project-name
# You can also pass the same args to the update script as you can to the create
# script, but configuration is saved on create so you don't have to \o/
```

## Verbose logging

Add a DEBUG environment variable to see some logs.

```sh
DEBUG=contribs:* node scripts/bin/update my-project-name
```
