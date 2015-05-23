# auth
Ideas for simpler authentication.

## Why
Usernames and passwords are annoying.

## How
1) Your app creates an invisible iframe pointed at the service  
2) Your app sends the service a nonce  
3) The service responds with a dictionary of identities: `{ publicKey1: nonceSignature, publicKey2: nonceSignature ... }`  
4) Your app permits access to resources owned by the identities with valid signatures  

## Example
```
$ npm install
$ bin/start &
$ cd example
$ bin/start 
```

## Goals:
* A single asymmetric keypair (ECDSA, P-256) represent a single identity
* Any number of identities may be generated for a particular origin
* Friendly for offline, and / or local-only use cases
* Easy to leverage - run the service in an iframe and talk to it with the included JavaScript client
* No need to explicitly "sign up" to use new apps
* Hosted version to ease onboarding that can be "unplugged" later

## Inspiration
* [SQRL](https://www.grc.com/sqrl/sqrl.htm)
* [keyboot](https://github.com/substack/keyboot)

## Note
Just and experiment for now!

## License
WTFPL
