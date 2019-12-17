# Pluto

Pluto combs your Mongo database for bugs.

Its operation is simple – you give it a list of queries to check against, and Pluto will inform you if it finds any records. It works in two steps:

1. Scans your database for any records that match the specified query
2. Sends your team an email with a list of any matching documents

### Getting started
1. Read the [Required Files](#required-files) section
2. Read the [Running Pluto](#running-pluto) section

### Required Files
- `config.js` - a JSON file containing the databases, collections, and an array of queries to check in a hierarchical format
- `keys.js` – a JSON file containing API keys and important configurations

## config.js
```
{
	Gmail: {
		Accounts: [
			{
				pipeline: [{$match:{_id: null}}],
				text: 'Accounts without MongoDB IDs.',
			},
			{
				pipeline: [{$match:{unread: {$lt: 5000}}}],
				text: 'Accounts with unread counts higher than 5,000.',
			},
		],
		Messages: [
			{
				pipeline: [{$match:{htmlContent: {$not:{$type: 'string'}}}}],
				text: 'Messages with htmlContents that are not strings.',
			},
		],
	},
	Maps: {
		Locations: [
			{
				pipeline: [{$match:{lat: {$exists: false}}}],
				text: 'Map locations that are missing latitude values.',
			},
			{
				pipeline: [{$match:{lng: {$exists: false}}}],
				text: 'Map locations that are missing longitude values.',
			},
		],
		Images: [
			{
				pipeline: [{$match:{height: {$exists: false}}}],
				text: 'Map image that are missing height values.',
			},
		]
	}
}
```

In the above example, Pluto starts with the `Gmail` database. It would then loop through both collections, `Accounts` and `Messages`, and check for any records that match the specified aggregation pipelines.  The `text` value is a simple English-readable sentence that describes what it's looking for. These are only referenced in the email notification.

Pluto can be executed with any frequency (we run it hourly for Hux) but will not notify you of duplicates within the period defined as `NOTIFICATION_FREQUENCY` in `constants.js`. Continuing the above example, say Pluto encounters a record of a map image missing its height value. Pluto will send you an email, then ignore that failed check for the next day to avoid inundating you with emails. This value can be easily modified via `NOTIFICATION_FREQUENCY` in `constants.js`.

## keys.js
```
module.exports = {
	environment: 'production',	// Arbitrary string displayed in email
	mailgun: {
		apiKey: 'key-abc123',
		domain: 'hux.com',
		fromAddress: 'mongoBugs@hux.com',
		toAddress: 'developers@hux.com',
	},
	mongoConnectionURL: 'mongodb://user:password@hux.com:27017',
};
```

### Editable Files
- `constants.js` - Think of this as an advanced settings file. Most users won't need to tweak these settings.

## constants.js
- `ERROR_FILE` Contains information about how Pluto stores the failed checks
- `NOTIFICATION_FREQUENCY` Dictates how often, in milliseconds, Pluto should notify you of the same failed check

## Running Pluto
Running Pluto couldn't be easier - simply execute `./exec.sh` in your shell of choice (Bash preferred).

### exec.sh
Arguments
- `remoteConfigFile.com` [_optional_] This flag replaces your local `config.js` file with one hosted remotely. Helpful if you tie config files to your version control system (e.g. git, mercurial, etc).
  - `./exec.sh` Runs Pluto with the local `config.js`
  - `./exec.sh https://remoteConfigFile.com` Runs Pluto with the config file hosted on that domain. It ignores the local config.