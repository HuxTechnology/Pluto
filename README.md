Pluto combs your Mongo database for bugs.

Its operation is simple – you give it a list of queries to check against, and Pluto will inform you if it finds any records. Here's an example:

## config.js
```
{
	Products: [
		{sku: null},
		{price: {$gt: 5000}},
	],
	Stores: [
		{storeID: null},
	],
}
```

Pluto would check the `Products` collection for any records with no `sku` field or prices greater than $50. It would then check the `Stores` collection for records without `storeID`s.

### Required Files
- `keys.js` – a JSON file containing API keys and important configurations
- `config.js` - a JSON file containing the collections and an array of queries to check