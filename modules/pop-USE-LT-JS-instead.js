
// Pet Owner Portal Java script classes and functions to retrieve visit information, services, time windows, surcharges


service_list= [];
surcharge_list= [];
visit_list = [];
time_windows_list= [];


// ********************************************************************************************
// *       CLASS OBJECTS REPRESENTING DATA COMPONENTS
// ********************************************************************************************


class PetOwner {
	constructor(client_id,
		pet_owner_data,
		pet_info) {

		this.client_id = client_id;
		this.petOwnerData = pet_owner_data;
		this.numberOfPets = pet_info.length;
		this.parsePetInfo(pet_info);
		this.petImages = [];
		this.parseClientInfo(this.petOwnerData);
		//this.printDebug();
	}

	parseClientInfo(pData) {
		console.log('Pet Owner data: ' + pData);

		this.petOwnerName = pData['clientname'];
	}

	parsePetInfo(pet_info) {
		this.pets = [];
		let number_pets = pet_info.length;
		for (let p = 0; p < number_pets; p++) {
			let newPet = pet_info[p];
			let clientPet = new Pet(newPet);
			this.pets.push(clientPet);
		}
	}

	printDebug() {

		console.log("Client ID: " + this.client_id)
		console.log("Pet Owner name: " + this.petOwnerData['clientname']);
		console.log("Number pets: " + this.numberOfPets);
		for (let n=0; n <  this.pets.length; n++) {
			let petProfile = this.pets[n];
			console.log('--------------------------------');
			console.log(petProfile.petID + " " + petProfile.petName + ", Age: " + petProfile.age);
			console.log('--------------------------------');

		}
	}

	parseCustomFields(custom_fields) {

	}
}

class Pet {
	constructor(pet_data) {
		this.petID = pet_data['petid'];
		this.petName = pet_data['name'];
		this.type = pet_data['type'];
		this.age = pet_data['birthday'];
		this.breed = pet_data['breed'];
		this.gender = pet_data['sex'];
		this.color = pet_data['color'];
		this.fixed = pet_data['fixed'];
		this.description = pet_data['description'];
		this.notes = pet_data['name'];
		console.log(this.petName + " (" + this.petID + ")");
	}
}

class Visit {
	constructor(appointmentid, 
		date, start_time, 
		end_time,
		service_label, 
		charge, 
		service_code, 
		status, 
		arrival_time, 
		completion_time,
		visit_report,
		tax_amt,
		adjust_amt
		) {

		this.appointmentid = appointmentid;
		this.status = status;						// completed, INCOMPLETE,  arrived, canceled
		this.service = service_label;
		this.service_code = service_code;

		this.date = date;     						// YYYY-MM-DD
		this.time_window_start = start_time;		// HH:MM:SS
		this.time_window_end = end_time;		// HH:MM:SS
		this.arrival_time = arrival_time;			 // YYYY-MM-DD HH:MM:SS
		this.completion_time = completion_time; // YYYY-MM-DD HH:MM:SS

		this.visitReport = visit_report;			// YYYY-MM-DD HH:MM:SS
		this.visitNote = '';

		// charge + adjustment + tax + surcharge = TOTAL VISIT CHARGE
		// no discount calculated

		this.charge = parseFloat(charge);
		this.surchargeAmount = parseFloat(0);
		this.isSurchargable = false;

		if (adjust_amt != null) {
			this.adjustment = parseFloat(adjust_amt);
		} else {
			this.adjustment = parseFloat(0);
		}
		
		if (tax_amt != null) {
			this.tax = parseFloat(tax_amt);
		} else {
			this.tax = parseFloat(0);
		}
	
	}
	
	updateStatus(status) {
		this.status = status;
	}

	checkSurcharge(sur_list) {
		let num_sur = sur_list.length;
		for (let sitem = 0; sitem < num_sur; sitem++) {
			let  surchargeObj = sur_list[sitem];
			if (this.date == surchargeObj.surchargeDate) {
				this.surchargeAmount = 10;
				this.isSurchargable = true;
			}
		}
	}
	calculateTotalCharges() {
		let totalVisitCharges = parseFloat(this.charge);
		if (this.adjustment != null) {
			let intAdj = parseFloat(this.adjustment);
			totalVisitCharges += intAdj;
		}
		if (this.tax != null) {
			let intTax = parseFloat(this.tax)
			totalVisitCharges += intTax;
		}
		if (this.surchargeAmount != null) {
			let intSur = parseFloat(this.surchargeAmount);
			totalVisitCharges += intSur;
		}

		return this.totalVisitCharges;
	}
};
class ServiceItem {
	constructor(serviceItemName, serviceCode, serviceCharge, serviceHours, serviceTax, serviceFormattedHours) {

		this.serviceName = serviceItemName;
		this.serviceCode = serviceCode;
		this.serviceCharge = serviceCharge;
		this.serviceHours = serviceHours;
		this.serviceTax = serviceTax;
		this.serviceFormattedHours = serviceFormattedHours;

	}
};
class TimeWindowItem {
	constructor(timeWindowLabel, timeWindowBegin, timeWindowEnd) {
		this.label = timeWindowLabel;
		this.begin = timeWindowBegin;
		this.endTW = timeWindowEnd;
	}
}
class SurchargeItem {
	constructor(surchargeTypeID, surchargeCharge, surchargeLabel, surchargeDescription, surchargeAutomatic, surchargePervisit,surchargeType, surchargeDate) {
		this.surchargeTypeID = surchargeTypeID;
		this.charge = surchargeCharge;
		this.label = surchargeLabel;
		this.description = surchargeDescription;
		this.surchargeAutomatic = surchargeAutomatic;
		this.surchargeDate = surchargeDate;
		this.surchargeType = surchargeType;
		this.perVisit = surchargePervisit;
	}
}


// ********************************************************************************************
// *                                                                                                                                                           *
// *            POPULATE LOCAL HTML VIEWS WITH ITEMS RETRIEVED                                        *
// *            FROM SERVER; GLOBAL ARRAYS OF OBJECT TYPES                                                 *
// *            THIS IS UNIT TEST AND DATA MANIPULATION DIFFERENT IN PRODUCTION       *       
// *                                                                                                                                                            *
// ********************************************************************************************	

function populateData() {
       let table = document.getElementById("visitTable");
       let row_head = table.insertRow(0);
       let th1 = row_head.insertCell(0);
       let th2 = row_head.insertCell(1);
       let th3 = row_head.insertCell(2);
       let th4 = row_head.insertCell(3);
       let th5 = row_head.insertCell(4);
       let th6 = row_head.insertCell(5);
       let th7 = row_head.insertCell(6);
       let th8 = row_head.insertCell(7);
       let th9 = row_head.insertCell(8);

       th1.innerHTML = "STATUS";
       th2.innerHTML = "SERVICE";
       th3.innerHTML = "START TIME";
       th4.innerHTML = "END TIME"
       th5.innerHTML = "DATE";
       th6.innerHTML = "CHARGE";
       th7.innerHTML = "SURCHARGE";
       th8.innerHTML = "TAX";
       th9.innerHTML = "TOTAL";
       for (i = 1; i < visit_list.length; i++) {
                let row = table.insertRow(i);
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                let cell3 = row.insertCell(2);
                let cell4 = row.insertCell(3);
                let cell5 = row.insertCell(4);
                let cell6 = row.insertCell(5);
                let cell7 = row.insertCell(6);
                let cell8 = row.insertCell(7);
                let cell9 = row.insertCell(8);

                visitDetails = visit_list[i];

                let statString = "";
                if (visitDetails.status == "INCOMPLETE") {
                	statString = "<img src=\"\./leash.png\" height=20 width=20>";
                } else if (visitDetails.status == "completed") {
                	statString = "<img src=\"\./check-mark-green@3x.png\" height=20 width=20>";
                } else {
                	statString = visitDetails.status;
                }
                cell1.innerHTML = statString;
                cell2.innerHTML = visitDetails.service;

                if (visitDetails.arrival_time != null && visitDetails.completion_time != null) {

                	cell3.innerHTML = visitDetails.arrival_time;
                	cell4.innerHTML = visitDetails.completion_time;

                } else if (visitDetails.arrival_time != null && visitDetails.completion_time == null) {

                	cell3.innerHTML = visitDetails.arrival_time;
                	cell4.innerHTML = " - In process";

                } else {

                	cell3.innerHTML = visitDetails.time_window_start;
                	cell4.innerHTML =  visitDetails.time_window_end;
                }
                
                cell5.innerHTML = visitDetails.date;
                cell6.innerHTML = "$"+visitDetails.charge;

                let surchargeInt = parseInt(visitDetails.surchargeAmount);

                if (surchargeInt > 0) {

                	cell7.innerHTML = "<img src=\"\./money.png\" height=20 width=20>$" + visitDetails.surchargeAmount;

                } else { 

                	cell7.innerHTML = visitDetails.surchargeAmount;

                }

                if (visitDetails.tax != null) {

                	cell8.innerHTML = "$"+visitDetails.tax;
                }

                cell9.innerHTML = "$" + visitDetails.calculateTotalCharges();
       }
}

function populateServiceData() {
	var select = document.getElementById("serviceItemList");
	for(index in service_list) {
		let serviceObj = service_list[index];
		let serviceString = serviceObj.serviceName + " [$" + serviceObj.serviceCharge + "]";
    		select.options[select.options.length] = new Option(serviceString, index);
	}
}

function populateTimeWindows() {
	var timeWindow = document.getElementById("timeWindowsList");
	for (index in time_windows_list) {
		tw_string = time_windows_list[index].label;
		end_string = time_windows_list[index].endTW;
		tw_string += " (" + time_windows_list[index].begin;
		tw_string += " - " + end_string + ")";
		timeWindow.options[timeWindow.options.length] = new Option(tw_string, index);
	}
}

function populateSurcharges() {
	var surchargeWindow = document.getElementById("surchargeList");
	for (index in surcharge_list) {
		surcharge_string = surcharge_list[index].label;
		surcharge_string += " (" +surcharge_list[index].charge + ")";
		surcharge_string += " " + surcharge_list[index].surchargeType;
		surcharge_string += "  ["+surcharge_list[index].surchargeDate + "]";
		surchargeWindow.options[surchargeWindow.options.length] = new Option(surcharge_string, index);
	}
}


// ********************************************************************************************
// *       HELPER FUNCTIONS
// ********************************************************************************************

function recursiveGetProperty(obj, lookup, callback) {
	var level_depth = 1;
	count_level = 1;
	for (property in obj) {
		count_level = count_level + 1;
		if (property == lookup) {
			callback(obj[property]);
		} else if(obj[property] instanceof Object) {
			level_depth = level_depth + 1;
			recursiveGetProperty(obj[property], lookup, callback);
		}
	}
} 


// ***********************************************************************************
// *                                                                                                                                           *
// *            GET DATA ITEMS TO POPULATE THE PET OWNER PORTAL                     *
// *            VISITS, SERVICE LIST, TIME WINDOWS, SURCHARGES                              *
// *                                                                                                                                            *
// ***********************************************************************************


// Ajax calls

// VISIT DATA FOR PARTICULAR CLIENT (LOG IN AS CLIENT ID)
// https://leashtime.com/client-own-scheduler-data.php?
// parameters: 
//     &timesframes=1
//     &surchargetypes=1
//     &servicetypes=1
//     &start=YYYY-MM-DD 
//     &end=YYYY-MM-DD

// CLIENT AND PET DATA FOR A PARTICULAR CLIENT
// https://leashtime.com/client-own-profile-data.php
// no parameters

// PET PHOTOS
// https://leashtime.com/pet-photo.php?id={petid}&version=display
// parameters: 
//		petid
// 		version=display    [if set param, 300px max dimension; else, full size]

function getClientProfileInfo(client_dict) {
	let client_name = client_dict['clientname'];
	let client_id = client_dict['clientid'];
	let pet_info;
	recursiveGetProperty(client_dict, "pets", function(obj) {
		pet_info = obj;
		petOwnerAndPets = new PetOwner(client_id, client_dict, pet_info);
		return petOwnerAndPets;
	})

}


function getVisits(visitsDictionary)  {
	recursiveGetProperty(visitsDictionary, "visits", function(obj) {
		num_visits = obj.length;
		for (i =0; i < num_visits; i++) {
			visit_dict = obj[i];
			const visit = new Visit(visit_dict['appointmentid'],
				visit_dict['date'], 
				visit_dict['starttime'],
				visit_dict['endtime'],
				visit_dict['servicelabel'],
				visit_dict['charge'],
				visit_dict['servicecode'],
				visit_dict['status'],
				visit_dict['arrived'],
				visit_dict['completed'],
				visit_dict['visitreport'],
				visit_dict['tax'],
				visit_dict['adjustment']);
			visit_list.push(visit);
		}
	});
	for (i =0; i < num_visits; i++) {
		visit_item = visit_list[i];
		visit_item.checkSurcharge(surcharge_list);
	}
	return visit_list;
}

function getServiceItems(serviceDictionary) {
	recursiveGetProperty(serviceDictionary, "servicetypes", function(sObj) {
		num_service_items  = sObj.length;
		for (s = 0; s < num_service_items; s++) {
			service_dict = sObj[s];
			const service = new ServiceItem(service_dict['label'],
				service_dict['servicetypeid'],
				service_dict['charge'],
				service_dict['description'],
				service_dict['taxrate'],
				service_dict['extrapetcharge'])

			service_list.push(service);
		}

	});
}

function getTimeWindows(timeWindowsDictionary) {
	recursiveGetProperty(timeWindowsDictionary, "timeframes", function(tWObj) {
		num_tw_items  = tWObj.length;
		for (s = 0; s < num_tw_items; s++) {
			time_window_dict = tWObj[s];
			const time_window = new TimeWindowItem(time_window_dict['label'],
				time_window_dict['start'],
				time_window_dict['end']);

			time_windows_list.push(time_window);
		}
	});
}

function getSurchargeItems(surchargeDictionary) {
	recursiveGetProperty(surchargeDictionary, "surchargetypes", function(sObj) {
		num_surcharge_items  = sObj.length;
		for (t = 0; t < num_surcharge_items ; t++) {
			surcharge_dict = sObj[t];
			const surcharge = new SurchargeItem(surcharge_dict['surchargetypeid'],
				surcharge_dict['charge'],
				surcharge_dict['label'],
				surcharge_dict['description'], 
				surcharge_dict['automatic'],
				surcharge_dict['pervisit'],
				surcharge_dict['type'],
				surcharge_dict['date']);

			surcharge_list.push(surcharge);
		}
	});
}
// ***********************************************************************************
// *                                                                                                                                           *
// *            REQUEST METHODS: SERVER CREATES NEW REQUEST                           *
// *            QUEUE ITEMS, TO BE APPROVED BY MANAGER                                          *
// *                                                                                                                                            *
// ***********************************************************************************



function sendCancelVisitRequest (visitID,  cancelNote) {
	// visitID
	// cancelNote
	// dateTime
}


function sendUncancelRequest ( visitID,  uncancelNote) {
	// visitID
	// dateTimeRequest
	// unCancelNote
}

function sendChangeVisitRequest ( visitID,  changeType,  changeNote) {
	// visitID
	// dateTimeRequest
	// changeNote
}

function sendRequestSingleVisit (serviceCode,  date,  timeWindow,  Note) {
	// Create JSON [ of {}, with each dict visit request details ]
	// Whether single visit or multiple visits, an array of dictionary items with following keys:
	//    serviceCode
	//    date
	//    timeWindow
	//    note
	//    tax
	//    surcharge
	//    charge
}




