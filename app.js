const http = require('http');
const https = require('https');
const url = require('url'); 
const fs = require('fs');

const visitData = require('./data/visit.json');
const clientData = require('./data/client.json');
const sitterVisitData =  require('./data/sitterVisit.json');

const port = 3300;
const maxLength = 10;
const sitter_login = ['dlifebri','bball1','hollydobel','geoff789'];

var clientProfile = [];

http.createServer((req, res) => {
	var typeRequest = url.parse(req.url,true).query;
	var theType = typeRequest.type;

	res.writeHead(200, { 'Content-Type': 'application/json','Access-Control-Allow-Origin':'*'});

	if (theType == "visits") {
		res.write(JSON.stringify(visitData));
		res.end();
	
	} else if (theType == "clients") {
		res.write(JSON.stringify(clientData));
		res.end();
	
	} else if(theType == "visitreport") {

		res.write(JSON.stringify(visitReportData));
		res.end();
	
	} else if (theType == "cancel") {

		res.write(JSON.stringify({ "response" : "ok"}));
		visitCancel(typeRequest.visitid, typeRequest.note);
		res.end();
	
	} else if(theType == "uncancel") {

		res.write(JSON.stringify({ "response" : "ok"}));
		visitUncancel(typeRequest.visitid, typeRequest.note);
		res.end();
	
	} else if(theType == "change") {

		res.write(JSON.stringify({ "response" : "ok"}));
		visitChange(typeRequest.visitid, typeRequest.note);
		res.end();
	
	} else if(theType == "sitterClientProfile") {

		res.write(JSON.stringify(clientProfile));
		res.end();
	
	} else if(theType == "managerVisits") {
		let userName = typeRequest.username;
		let password = typeRequest.password;
		let dateBegin = typeRequest.startdate;
		let dateEnd = typeRequest.enddate;

		let promiseArray = [];
		let parsedData = '';

		password = 'QVX992DISABLED';

		sitter_login.forEach((sitter)=> {
			let url_base = 'https://leashtime.com/native-prov-multiday-list.php?loginid='+sitter+'&password='+password+'&start='+dateBegin+'&end='+dateEnd;

			let sitterVisitsPromise = new Promise((resolve,reject)=>{
				let rawData = '';
				https.get(url_base, (res) => {
					res.on('data',(chunk)=> {
						rawData += chunk;
					});
					res.on('end',()=> {
						let parsedData = JSON.parse(rawData);
						resolve(parsedData);
					});
				}).on("error", (err) => {
						reject(err);
				});
			})
			promiseArray.push(sitterVisitsPromise);
		});

		var allRequests = Promise.all(promiseArray);
		allRequests.then((data) => {

			let returnStream = [];
			clientProfile = [];

			data.forEach(function(visitInfo) {

				let visitData = visitInfo.visits;
				let clientProfileData = visitInfo.clients;
				let flagData = visitInfo.flags;

				visitData.forEach(function(visitDetails) {
					returnStream.push(visitDetails);
				});

				let cProfKeys = Object.keys(clientProfileData);
				cProfKeys.forEach((key)=> {
					clientProfile.push(clientProfileData[key]);
				});
			});

			let streamJson = JSON.stringify(returnStream);
			res.write(JSON.stringify(streamJson));
			res.end();
		})
		.catch((error) => {
			console.log("Error executing all promises: " + error);
		});
	
	} else if(theType == "getPetPic") {

		let petid = typeRequest.petid;
		let url_base = 'https://leashtime.com/pet-photo.php?petid='+petid;
		console.log(url_base);
		https.request(url)
			.on('response'), function(res) {
				if (res.headers['content-length'] > maxLength*1024*1024) {
					callbak(new Error('Image too large'));
				} else if (!~[200,304].indexOf(res.statusCode)) {
					callbak(new Error('Invalid status code'));
				} else if (!res.headers['content-type'].match(/image/)) {
					callbak(new Error('Not image'));
				} else {
					let body = '';
					res.setEncoding('binary');
					res.on('error', function(err) {
						callback(err);
					})
					.on('data', function(chunk) {
						body += chunk;
					})
					.on('end', function() {
						var path= '/tmp' + Math.random().toString().split('.').pop();
						fs.writeFile(path, body, 'binary', function(err) {
							callback(err,path);
						})
					})
				}
			}
	}
}).listen(port);


function getFlagData() {

}
function visitCancel(appointmentid, note) {

	console.log("CANCEL VISIT REQUEST FOR: " + appointmentid);
}
function visitUncancel(appointmentid, note) {

	console.log("UNCANCEL VISIT REQUEST FOR: " + appointmentid);
}
function visitChange(appointmentid, note) {
	
	console.log("VISIT CHANGE FOR " + appointmentid);
}
function requestVisits(visitInfoArray) {

	visitInfoArray.forEach((visitDict)=> {

			let date = visitDict.date;
			let timeWindow = visitDict.timewindow;
			let serviceID = visitDict.serviceid;
			let pets = visitDict.pets;
			let note = visitDict.note;
			let isStart = visitDict.isstart;
			let isEnd = visitDict.isend;
			let visitCharge = visitDict.visitcharge;


	})
}


