![logo](./src/assets/icon/icon.svg)

ohm is a platform for open source music built on top of [ipfs](https://ipfs.io/).

songs and albums are licensed under an All Rights Reserved license.

files included with a song are licensed under a Creative Commons license of the artist's choosing.

\[[read more](https://ohm.rip)\] \[[ohm back-end](https://github.com/jurelik/ohm-be)\]

![screenshot](screenshot.jpg)

## run ohm
Download the latest release [here](https://github.com/jurelik/ohm/releases) or run from source:
```
git clone https://github.com/jurelik/ohm.git && cd ohm
npm install
npm start
```

#### Windows
If you are a Windows user you should change the npm scripts in `package.json` to the following if you use Powershell:
```
"start": "$env:NODE_ENV=\"production\"; electron ."
"dev": "$env:NODE_ENV=\"development\"; electron ."
"test": "$env:NODE_ENV=\"test\"; electron ."
```
or the following if you use CMD:
```
"start": "set NODE_ENV=production&&electron ."
"dev": "set NODE_ENV=development&&electron ."
"test": "set NODE_ENV=test&&electron ."
```

If you get the following error when trying to run inside Powershell:
```
electron : File ...\AppData\Roaming\npm\electron.ps1 cannot be loaded because running scripts is disabled on this system.
```
Use the following command and select "A" when prompted:
```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted
```

## build ohm
```
npm run build_osx
npm run build_linux
npm run build_win
```

## contributing
This project needs your help - please read our [CONTRIBUTING.md](CONTRIBUTING.md) for basic information on branching and code styling. Pull requests are more than welcome.

<sub>design inspired by [100r](https://100r.co/) | fonts by [DJR](https://djr.com/) | icons made with [dotgrid](https://100r.co/site/dotgrid.html)</sub>
