# private games host bot

### about

this is a cool bot that hosts private games for you if you don't have the MVP++ rank

### usage

the bot will be waiting for party requests:

```
/p mycoolbot
```

upon joining the party, the bot will wait for the party to be transferred to them:

```
/p transfer mycoolbot
```

then the bot will enable private games, waiting for you to start using the following command (send in party chat):

```
$play <game>
```

keep in mind that `<game>` must be a valid argument to the `/play` command on hypixel, and not all games will trigger the bot to warp yet (since i'm lazy)

### instructions

**requirements: MVP++ rank of the account you are botting**

install [nodejs](https://nodejs.org/en/) (version 18.13.0 or later)

download or clone this repository

open repository in your terminal or command prompt and run

```
npm build
```

create a `.env` next to this file with the following format:

```
USERNAME="acoolusername"
PASSWORD="asecurepassword"
```

then run the following in your shell

```
node dist/index.js
```

upon the first time logging in, you may need to log in with a code - nothing complex, just follow the instructions printed in the output
