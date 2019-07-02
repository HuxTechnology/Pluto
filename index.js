const {MongoClient} = require('mongodb');
const Mailgun = require("mailgun-js");
const keys = require('./keys');
const config = require('./config');

const MailgunInstance = Mailgun({apiKey: keys.mailgun.apiKey, domain: keys.mailgun.domain});

MongoClient.connect(keys.mongoConnectionURL, {useNewUrlParser: true}, (mongoError, client) => {
	if(mongoError) {
		MailgunInstance.messages().send({
			from: keys.mailgun.fromAddress,
			to: keys.mailgun.toAddress,
			subject: 'Error Initializing Pluto',
			html: JSON.stringify(mongoError),
		}, (mailgunError, body) => {
			if(mailgunError) return console.log("Error sending email", mailgunError);
		});
		
		return;
	}
	
	let mailgunData = [];
	let queryPromises = [];
	
	// Loop through databases
	for (const databaseName in config) {
		const currentDatabase = client.db(databaseName);
		
		// Loop through collections
		for (const collectionName in config[databaseName]) {
			const collection = currentDatabase.collection(collectionName);
			
			// Check that the database isn't empty
			const generalCursor = collection.find({});
			queryPromises.push({
				cursor: generalCursor,
				collectionName,
				promise: generalCursor.count(),
				text: 'No documents found.',
				pipeline: [{}],
			});
			
			// Loop through queries
			queryPromises = queryPromises.concat(
				config[databaseName][collectionName].map(({pipeline, text}) => {
					const cursor = collection.aggregate(pipeline);
					return {
						pipeline,
						cursor,
						text,
						collectionName,
						promise: cursor.next(),
					};
				})
			);
		}
	}
	
	// Resolve all document retrieval promises
	Promise.all(queryPromises.map(item => item.promise)).then(values => {
		values.forEach((record, index) => {
			const {collectionName, text, cursor, pipeline} = queryPromises[index];
			
			if (record instanceof Object || record === 0) {
				mailgunData.push({
					collectionName,
					_id: record? record._id : 'N/A',
					pipe: JSON.stringify(pipeline[0]),
					text,
				});
			}
			
			cursor.close();
		});
		
		if (mailgunData.length > 0) {
			let email = {
				from: keys.mailgun.fromAddress,
				to: keys.mailgun.toAddress,
				subject: `Pluto Error Found [${keys.environment}]`,
				html: `<style>table{border-collapse: collapse;} tr {text-align:left;} td {border: 1px solid black;border-collapse: collapse;padding:5px;}</style><table><tr>
					<th>Collection</th>
					<th>Text</th>
					<th>1st Pipe</th>
					<th>Example Id</th>
				</tr>`,
			};
			
			mailgunData.forEach(data => {
				email.html += `<tr>
					<td>${data.collectionName}</td>
					<td>${data.text}</td>
					<td>${data.pipe}</td>
					<td>${data._id}</td>
				</tr>`;
			});
			
			email.html += `</table>`;
			
			MailgunInstance.messages().send(email, (mailgunError, body) => {
				if(mailgunError) return console.log("Error sending email", mailgunError);
			});
		}
		
		client.close();
	});
});