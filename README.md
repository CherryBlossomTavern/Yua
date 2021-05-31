# Yua

Official repository for our cutie, savior, and deity Yua.

*You must do your daily prayers worshipping Yua my brothers or else....*

## Getting Started

#### `Installing Dependencies`
```npm
npm install
```
#### `Run in Dev Mode`
```npm
npm run dev
```
#### `Building`
```npm
npm run build
```
#### `Run In Production`
```npm
npm start
```
#### `Manual Lint`
```npm
npm run lint
```
#### `Manual Lint, Auto Fix Issues`
```npm
npm run lint:fix
```

#### `Extra Notes`

When running Yua in `dev` mode be sure there is no `dist/` folder otherwise it will run the built code rather than the `src/` typescript

Only `build` and `start` when testing if something will work in production mode locally. Never push the built code directory a.k.a `dist/`.

## Contributing

- Fork the repository
- Make changes on fork
- Create pull request explaining what you did

#### `Notes`
Every time you create a pull request make sure to bump the version in `package.json`. See versioning below on how to handle bumping the version

If the Yua repo is ahead in commits then yours. A.K.A Yua repo has been updated and you don't have the most recent code run.
```git
git clone --recurse-submodules --remote-submodules https://github.com/CherryBlossomTavern/Yua.git
```

## Versioning

`package.json` utilizes [semantic versioning](https://semver.org/) thus we follow this format when updating Yua.
> When creating a pull request be sure to bump the version in package.json accordingly

![Semantic Versioning Example](https://user-images.githubusercontent.com/61068742/114731685-8fedf280-9d07-11eb-9977-9d844e7c8efc.png)

#### `A [Major Change]`
This will/needs to be bumped up whenever there is a major change. What would classify as a major change is something that "breaks the API" or rather in Yua's case something that is heavily changing her functionality or layout.
#### `B [Minor Change]`
This will/needs to be bumped whenever there is a minor change. What classifies as a minor change would be something like adding or removing features from the current major version. In Yua's case, this may be something along the lines of adding/removing commands, etc.
#### `C [Bug Fix]`
This will/needs to be bumped whenever there is a bug fix. This will be the most commonly bumped value. What would classify a bug fix is changes to any minor features. In Yua's case, tweaking a command, etc.

#### `A.B.C`
In conclusion, `A` will be bumped whenever there is a new version that is significantly different from or breaks the last version. `B` will be bumped when there are any changes/tweaks to the current version `A`. `C` will be bumped when there are any changes/tweaks made to the current `B` version of `A`

##### EX: `1.5.24`
Means Yua is on her 1st major version, 5th minor version, and 24 bug fixes to the current minor version 

#### Notes
Whenever a version is bumped all versions following it will reset to 0.
For example if Yua's current version is `1.5.24` and we make a minor change the version will become `1.6.0` __**not**__ `1.6.24`

## License
[AGPL-3.0](https://choosealicense.com/licenses/agpl-3.0/)
