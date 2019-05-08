Pluto combs your Mongo database for bugs.

Its operation is simple – you give it a list of queries to check against, and Pluto will inform you if it finds any records.

### Required Files
- `config.js` - a JSON file containing the databases, collections, and an array of queries to check in a hierarchical format
- `keys.js` – a JSON file containing API keys and important configurations

## config.js
```
{
	Gmail: {
		Accounts: [
			{_id: null},
			{unread: {$lt: 5000}},
		],
		Messages: [
			{htmlContent: {$not:{$type: 'string'}}},
		],
	},
	Maps: {
		Locations: [
			lat: {$exists: false},
			lng: {$exists: false},
		],
		Images: [
			height: {$exists: false},
		]
	}
}
```

In the above example, Pluto starts with the `Gmail` database. It would then loop through both collections, `Accounts` and `Messages`, and check for any records that match the specified queries. 

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