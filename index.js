const {MongoClient} = require('mongodb');
const Mailgun = require("mailgun-js");
const keys = require('./keys');
const config = require('./config');

exports.handler = (event, context, callback) => {
	MongoClient.connect(keys.mongoConnectionURL, {useNewUrlParser: true}, (err, client) => {
		if(err) return console.log("Error!", err);
		
		const db = client.db('hux');
		
		let mailgunData = [];
		let queryPromises = [];
		
		// Loop through collections
		for (collectionName in config) {
			collection = db.collection(collectionName);
			
			// Loop through queries
			queryPromises = queryPromises.concat(
				config[collectionName].map(qry => ({
					promise: collection.findOne(qry),
					qry,
					collectionName,
				}))
			);
		}
		
		Promise.all(queryPromises.map(item => item.promise)).then(values => {
			values.forEach((record, index) => {
				if (record !== null) {
					let {collectionName, qry} = queryPromises[index];
					
					mailgunData.push({
						collectionName,
						_id: record._id,
						qry: JSON.stringify(qry),
					});
				}
			});
			
			if (mailgunData.length > 0) {
				const MailgunInstance = Mailgun({apiKey: keys.mailgun.apiKey, domain: keys.mailgun.domain});
				
				let email = {
					from: keys.mailgun.fromAddress,
					to: keys.mailgun.toAddress,
					subject: 'Pluto Error Found',
					html: '',
				};
				
				mailgunData.forEach(data => {
					email.html += `Malformed record found! Collection = ${data.collectionName} _id = ${data._id} qry = ${data.qry}<br>`;
				});
				
				MailgunInstance.messages().send(email, (error, body) => {
					if(err) return console.log("Error!", err);
				});
			}
			
			client.close();
		});
	});
	
	callback(null, "success");
}