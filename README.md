# Pluto

Pluto combs your Mongo database for bugs.

Its operation is simple – you give it a list of queries to check against, and Pluto will inform you if it finds any records. It works in two steps:

1. Scans your database for any records that match the specified query
2. Sends your team an email with a list of any matching documents

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