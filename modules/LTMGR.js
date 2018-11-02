var LTMGR = (function() {
	
	"use strict";

	var mapMarkers = [];
	var visitList = []; 
	var sitterList = {};
	var allClients = [];

	class SitterProfile {
		constructor(sitterInfo) {
			this.sitterID = sitterInfo.sitterid;
			this.sitterName = sitterInfo.sittername;
		}
	}
	class SitterVisit {
		constructor(visitInfo) {
			this.visitID = visitInfo.appointmentid;
			this.sitterID = visitInfo.providerptr;
			this.sitterName = visitInfo.sitter;
			this.service = visitInfo.service;
			this.status = visitInfo.status;
			this.starttime = visitInfo.starttime;
			this.endtime = visitInfo.endtime;
			this.lat = visitInfo.lat;
			this.lon = visitInfo.lon;
			this.pets = visitInfo.pets;
			this.clientID = visitInfo.clientptr;
			this.clientName = visitInfo.clientname;
			this.timeOfDay = visitInfo.timeofday;
			this.visitNote = visitInfo.note;
		}
	};

	class Pet {
		constructor(pet_data) {
			this.petID = pet_data['petid'];
			this.petName = pet_data['name'];
			this.petType = pet_data['type'];
			this.age = pet_data['birthday'];
			this.breed = pet_data['breed'];
			this.gender = pet_data['sex'];
			this.petColor = pet_data['color'];
			this.fixed = pet_data['fixed'];
			this.description = pet_data['description'];
			this.notes = pet_data['name'];
		}
	};

	class PetOwnerProfile {
		constructor(clientProfileInfo) {

			this.customFields = [];
			this.petImages = [];
			this.pets = [];

			this.client_id = clientProfileInfo['clientid'];
			this.petOwnerName = clientProfileInfo['clientname'];
			this.lname = clientProfileInfo['lname'];
			this.fname = clientProfileInfo['fname'];
			this.lname2 = clientProfileInfo['lname2'];
			this.lat = clientProfileInfo['lat'];
			this.lon = clientProfileInfo['lon'];
			this.zip = clientProfileInfo['zip'];
			this.city = clientProfileInfo['city'];
			this.email = clientProfileInfo['email'];
			this.state = clientProfileInfo['state'];
			this.street1 = clientProfileInfo['street1'];
			this.street2 = clientProfileInfo['street2'];
			this.email2 = clientProfileInfo['email2'];
			this.cellphone = clientProfileInfo['cellphone'];
			this.cellphone2 = clientProfileInfo['cellphone2'];
			this.homephone = clientProfileInfo['homephone'];
			this.garagegatecode = clientProfileInfo['garagegatecode'];
			this.alarmcompany = clientProfileInfo['alarmcompany'];
			this.alarminfo = clientProfileInfo['alarminfo'];
			this.vetptr = clientProfileInfo['vetptr'];
			this.notes = clientProfileInfo['cellphone'];
			this.leashloc = clientProfileInfo['leashloc'];
			this.directions = clientProfileInfo['directions'];
			this.parkinginfo = clientProfileInfo['parkinginfo'];
			this.foodloc = clientProfileInfo['foodloc'];
			this.keyid = clientProfileInfo['keyid'];
			this.keydescription = clientProfileInfo['keydescription'];
			this.showkeydescriptionnotkeyid = clientProfileInfo['showkeydescriptionnotkeyid'];
			
			this.clinicname = clientProfileInfo['clinicname'];
			this.clinicstreet1 = clientProfileInfo['clinicstreet1'];
			this.clinicstreet2 = clientProfileInfo['clinicstreet2'];
			this.cliniccity = clientProfileInfo['cliniccity'];
			this.clinicstate = clientProfileInfo['clinicstate'];
			this.cliniczip = clientProfileInfo['cliniczip'];
			this.clinicphone = clientProfileInfo['clinicphone'];
			this.cliniclat = clientProfileInfo['cliniclat'];
			this.cliniclon = clientProfileInfo['cliniclon'];
			
			this.vetname = clientProfileInfo['vetname'];
			this.vetstreet1 = clientProfileInfo['vetstreet1'];
			this.vetstreet2 = clientProfileInfo['vetstreet2'];
			this.vetstate = clientProfileInfo['vetstate'];
			this.vetzip = clientProfileInfo['vetzip'];
			this.vetphone = clientProfileInfo['vetphone'];
			this.clinicphone = clientProfileInfo['clinicphone'];
			this.vetlat = clientProfileInfo['vetlat'];
			this.vetlon = clientProfileInfo['vetlon'];

			this.emergency_dict = clientProfileInfo['emergency'];
			this.neighbor_dict = clientProfileInfo['neighbor'];

			this.emergency_name =this.emergency_dict['name'];
			this.emergency_location = this.emergency_dict['location'];
			this.emergency_homephone = this.emergency_dict['homephone'];
			this.emergency_workphone = this.emergency_dict['workphone'];
			this.emergency_cellphone= this.emergency_dict['cellphone'];
			this.emergency_note = this.emergency_dict['note'];
			this.emergency_hasKey = this.emergency_dict['haskey'];

			this.neighbor_name = this.neighbor_dict['name'];
			this.neighbor_location = this.neighbor_dict['location'];
			this.neighbor_homephone = this.neighbor_dict['homephone'];
			this.neighbor_workphone = this.neighbor_dict['workphone'];
			this.neighbor_cellphone= this.neighbor_dict['cellphone'];
			this.neighbor_note = this.neighbor_dict['note'];
			this.neighbor_hasKey = this.neighbor_dict['haskey'];

			this.parseCustomFields(clientProfileInfo);

			if (clientProfileInfo['pets'] != 0) {
				this.parsePetInfo(clientProfileInfo['pets']);
			}
		}
		parsePetInfo(petArr) {
			if(petArr != null) {
				let number_pets = petArr.length;
				petArr.forEach((petDict)=> {
					let clientPet = new Pet(petDict);	
					this.pets.push(clientPet);
				});
			}
			
		}
		parseCustomFields(customClient) {
			let re = new RegExp('custom[0-9]+');
			let keys = Object.keys(customClient);
			let customFieldsLocal = [];

			keys.forEach((clientKey) => { 

				if(re.exec(clientKey)) {
					let custom_dictionary = customClient[clientKey];
					let custom_key_val = {};
					if(custom_dictionary['value'] != null){
						custom_key_val[custom_dictionary['label']] = custom_dictionary['value'];
						customFieldsLocal.push(custom_key_val);
					}
				}
			});

			this.customFields = customFieldsLocal;
		}
	}

	function getSitters(){
		return sitterList;
	}
	function getVisitList() {
		return visitList;
	}
	function getVisits(urlget, startDate, endDate) {
		let url = 'http://localhost:3300?type=managerVisits&username=manager&password=pass&startdate='+startDate+'&enddate='+endDate;
		fetch(url)
			.then((response)=> {
				return response.json()
			})
			.then((myJson)=> {
				let parseJson = JSON.parse(myJson);
				parseJson.forEach((sitterVisits) => {
						let visit = new SitterVisit(sitterVisits);
						visitList.push(visit);
						if(sitterList.hasOwnProperty(sitterVisits.providerptr)) {

						} else {
							sitterList[sitterVisits.providerptr] = sitterVisits.sitter;
							//console.log(sitterVisits.sitter)
						}
				})
				getClients();
			});
	}
	function getClients() {
		//console.log("Getting clients");
		let url = 'http://localhost:3300?type=sitterClientProfile';
		fetch(url)
			.then((response)=> {
				return response.json();
			})
			.then((clientJSON)=> {
				clientJSON.forEach(function(clientDict){	
					let allClientInfo = new PetOwnerProfile(clientDict);
					allClients.push(allClientInfo);
				});
			});
	}
	function getClientList() {

		return allClients;
	}
	function getVisitsBySitterID(sitterID) {
	}
	function sendVisitReport(visitID) {

	}
	async function getPetPhoto(petID) {

		let url = 'http://localhost:3300?type=getPetPic&petid='+petID;
		let response = await fetch(url);
		let imageData = await response.json();

		
		fetch(url)
			.then((response) => {
				return response.json();
			})
			.then((petPhoto) => {
				console.log('pet photo request response')
			})

	}

	function getVisitsBySitter(sitterID) {

		let visitListForSitter = [];

		visitList.forEach((visitDetails) => {

			if (visitDetails.sitterID == sitterID) {
				visitListForSitter.push(visitDetails);
			}

		});

		return visitListForSitter;

	}

	return {

		getSitters : getSitters,
		getVisits : getVisits,
		sendVisitReport : sendVisitReport,
		getVisitList : getVisitList,
		getClients : getClients,
		getVisitsBySitterID : getVisitsBySitterID,
		getClientList : getClientList,
		getPetPhoto : getPetPhoto,
		getVisitsBySitter : getVisitsBySitter
	}

	modules.exports = {
		mapMarkers : mapMarkers,
		sitterList : listOfSitters,
		statusTable : statusTable,
		SitterVisit : SitterVisit
	}

} ());