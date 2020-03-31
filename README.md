# Vanity GRS

NodeJS based tool to generate vanity groestlcoin addresses

# Features!

  - Generate multiple addresses
  - Supports Multi-core processors
  - log to file
  - checksum based vanity address

### Installation
```sh
$ npm install -g vanity-grs
$ vanitygrs -i cafe
```
### Examples

Generate groestlcoin address:
```sh
$ vanitygrs
```

generate 10 groestlcoin addresses:
```sh
$ vanitygrs -n 10
```

generate 10 groestlcoin addresses with Cafe as starting characters:
```sh
$ vanitygrs -n 10 -i Cafe
```
log to file
```sh
$ vanitygrs -n 10 -l
```
help me
```sh
$ vanitygrs -h
```

License
----

MIT
