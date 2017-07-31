# Contribs

Create a page that can be embedded on a website that lists project contributors.

## Dependencies

* [Node.js](https://nodejs.org/) >= 6
* [Hugo](https://gohugo.io/)

## Create a new project page

```sh
node scripts/bin/create my-project-name --title "My project Name" --org all --size 240
# N.B. `node scripts/bin/create --help` for usage instructions
```

## Update an existing project page

```sh
node scripts/bin/update my-project-name
# You can also pass the same args to the update script as you can to the create
# script, but configuration is saved on create so you don't have to \o/
# N.B. `node scripts/bin/update --help` for usage instructions
```

## Delete an existing project page

```sh
node scripts/bin/delete my-project-name
# N.B. `node scripts/bin/delete --help` for usage instructions
```

## Verbose logging

Add a DEBUG environment variable to see some logs.

```sh
DEBUG=contribs:* node scripts/bin/update my-project-name
```
