[![CircleCI](https://circleci.com/gh/Open-Rights-Exchange/ore-js/tree/master.svg?style=svg&circle-token=70a414d0e86f8d125d1a16eca8ddc379aef6fd1c)](https://circleci.com/gh/Open-Rights-Exchange/ore-js/tree/master)

# OREJS Spec

OREJS is a helper library (written in Javascript) to provide simple high-level access to the ore-protocol. OREJS uses EOSJS as a wrapper to the EOS blockchain.

## Example(s)

Try creating a random account on your nodeos instance...

```
npm install
cd examples
cp .env.example .env
```

Fill in the fresh .env

```
node ore/account_create_random
```

## To lint

```
npm run lint
```

You'll find more examples, and a *boot script*, inside of the examples directory. Check out the [examples/README.md](https://github.com/API-market/orejs/tree/master/examples/README.md) for more information.


# Publish NPM Package

Once published, package name will be: @open-rights-exchange/orejs@{version}
