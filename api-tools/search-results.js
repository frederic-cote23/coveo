const axios = require('axios');
const fs = require('fs');
const path = require('path');
const async = require('async');

function randomTimeOut() {
  return new Promise(resolve => {
    setTimeout(() => resolve(), Math.random()*5000); // it takes 2 seconds to make coffee
  });
}

//Call the search api
async function getSearch (access_token, organizationId, aq, 
  fieldsToInclude, firstResult, numberOfResults) {
  try{
    const response = await axios.get('https://platform.cloud.coveo.com/rest/search/v2/', {
      params: {
        "access_token": access_token,
        "organizationId": organizationId,
        "aq": aq,
        "fieldsToInclude": fieldsToInclude,
        "numberOfResults": numberOfResults
      }
    });

  console.log(response.data['totalCount']);

  return response.data

  }catch(error){
    console.log(error)
  }
}

/*
    for (let filter=0; filter>appAqList[field].length; filter++){
      console.log(appAqList[field][filter])
    }
*/

//getting the app store results
async function appStoreScenario_getRetultList (access_token, organizationId, aqList, 
  fieldsToInclude, firstResult, numberOfResults){
  
  //The queu that will be used
  let queue = async.queue(async function(task, callback) {
    
    let searchResults = await getSearch (task.access_token, task.organizationId, task.aq, 
      task.fieldsToInclude, task.firstResult, task.numberOfResults);
    
    //searchResults[results] -> title, uri, Excerpt
    //console.log(searchResults[totalCount]);  

    fs.writeFile('data/searchresults/'+task.aq+'.json', JSON.stringify(searchResults), function(err) {
      if (err) {
          console.log(err);
      } else {
          console.log("JSON saved");
      }
    });

    await randomTimeOut();

    callback();
  }, 1);

  queue.drain = function() {
    console.log('all items have been processed');
  };

  aqList.forEach(aq => {
    try{
      let task = {
        "access_token": access_token,
        "organizationId": organizationId,
        "aq": aq,
        "fieldsToInclude": fieldsToInclude,
        "firstResult": firstResult,
        "numberOfResults": numberOfResults
      }

      queue.push(task, function (err) {
        console.log('Call Successful');
      });
      
    }catch(error){
      console.log(error)
    }

  });




}

//
function appStoreScenario_createAqFilter (fieldName, fieldValues){

  let aqFilter = {};

  fieldValues.forEach(element => {
    aqFilter[element['value']] = '@'+fieldName+'=' +element['value']
  });

  return aqFilter

}

function appStoreScenario_createAqList (appcategoryAq, appisfreeAq){

  let finalList = [];

  Object.keys(appcategoryAq).forEach(function (category){

    finalList.push(appcategoryAq[category]+' '+'@apprank')

    /*
    finalList.push(appcategoryAq[category]);  
    
    Object.keys(appisfreeAq).forEach(function (appisfree) {
      finalList.push(appcategoryAq[category]+' '+appisfreeAq[appisfree]);
    });
    */
  });

  return finalList

}

const access_token = "xx367dddc5-086b-45d1-8083-d417116b6496";
const organizationId = "fcotetrainingorg";
const aq = "@appcategory";
const fieldsToInclude = ["appisfree", "appcategory"];
const firstResult = 0;
const numberOfResults = 200;
const appcategory = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'appstorescenario', 'appcategoryfield_value.json')));
const appisfree = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'appstorescenario', 'appisfreefield_value.json')));

//appStoreScenario (access_token, organizationId, aq, fieldsToInclude, firstResult, numberOfResults)
const appcategoryAq = appStoreScenario_createAqFilter ('appcategory', appcategory["values"]);
const appisfreeAq = appStoreScenario_createAqFilter ('appisfree', appisfree["values"]);
const aqList = appStoreScenario_createAqList (appcategoryAq, appisfreeAq);

//console.log(aqList)

appStoreScenario_getRetultList (access_token, organizationId, aqList,fieldsToInclude, firstResult, numberOfResults)

