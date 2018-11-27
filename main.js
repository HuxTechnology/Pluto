const {MongoClient} = require('mongodb');
const Mailgun = require("mailgun-js");
const keys = require('./keys');
const config = require('./config');

MongoClient.connect(keys.mongoConnectionURL, {useNewUrlParser: true}, function(err, client) {
	if(err) return console.log("Error!", err);
	
	const db = client.db('hux');
	
	let mailgunData = [];
	
	// Loop through collections
	for (collectionName in config) {
		collection = db.collection(collectionName);
		
		// Loop through queries
		config[collectionName].forEach(qry => {
			collection.find(qry, {limit:1}).toArray((err, docs) => {
				if(err) return console.log("Error!", err);
				
				if (docs.length > 0) mailgunData.push({
					collectionName,
					_id: docs[0]._id,
					qry: JSON.stringify(qry),
				});
			});
		});
	}
	
	if (mailgunData.length > 0) {
		const MailgunInstance = Mailgun({apiKey: keys.mailgun.apiKey, domain: keys.mailgun.domain});
		
		let email = {
			from: keys.mailgun.fromAddress,
			to: keys.mailgun.toAddress,
			subject: 'Pluto Error Found',
			html: '',
		};
		
		mailgunData.forEach(data => {
			email.html += `Bad value found! Collection = ${data.collectionName} _id = ${data._id} qry = ${data.qry}<br>`;
		});
				
		MailgunInstance.messages().send(email, (error, body) => {
			if(err) return console.log("Error!", err);
		});
	}
		
	client.close();
});