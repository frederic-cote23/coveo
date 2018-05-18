const axios = require('axios');
const fs = require('fs');
const path = require('path');
const async = require('async');

function randomTimeOut() {
    return new Promise(resolve => {
      setTimeout(() => resolve(), Math.random()*50); 
    });
  }

//Call the search api
async function get_Search (access_token, organizationId, q, aq, 
    fieldsToInclude, firstResult, numberOfResults) {
    try{
      const response = await axios.get('https://platform.cloud.coveo.com/rest/search/v2/', {
        params: {
          "access_token": access_token,
          "organizationId": organizationId,
          "q": q,
          "aq": aq,
          "fieldsToInclude": fieldsToInclude,
          "numberOfResults": numberOfResults
        }
      });
  
    return response.data
  
    }catch(error){
      console.log(error)
    }
  }

  //getting the app store results
async function test_query_list (access_token, organizationId, qList, aq, 
    fieldsToInclude, firstResult, numberOfResults){
    
    badQuery = [];

    //The queu that will be used
    let queue = async.queue(async function(task, callback) {
      
      let searchResults = await get_Search (task.access_token, task.organizationId, task.q, task.aq, 
        task.fieldsToInclude, task.firstResult, task.numberOfResults);
      
      //searchResults[results] -> title, uri, Excerpt
      //console.log(searchResults[totalCount]);  
  
        

        if(searchResults.totalCount < 15){
            console.log(task.q+": "+searchResults.totalCount)
            badQuery.push(task.q)
        }

      await randomTimeOut();
  
      callback();
    }, 1);

    queue.drain = function() {
        console.log(badQuery)
    };

    qList.forEach(q => {
        try{
          let task = {
            "access_token": access_token,
            "organizationId": organizationId,
            "q": q,
            "aq": aq,
            "fieldsToInclude": fieldsToInclude,
            "firstResult": firstResult,
            "numberOfResults": numberOfResults
          }
    
          queue.push(task, function (err) {
            //
          });
          
        }catch(error){
          console.log(error)
        }
    
      });

    
    
    return badQuery

}

const access_token = "xx367dddc5-086b-45d1-8083-d417116b6496";
const organizationId = "fcotetrainingorg";
const aq = "@appisfree=false";
const fieldsToInclude = ["appisfree", "appcategory"];
const firstResult = 0;
const numberOfResults = 200;

const qList = [ 
  "games", "Fitbit",  "beard",
  "decide now", "Lose It!", "Todo", "Graphing Calculator", "solitaire", "amazon", "brain training", 
  "free games", "house party", "video editor", "weather", "wine",
  "trivia crack", "ebay", "games for free", "color switch",
  "party app", "wish", "viber", "episode", "video", "photo", "health", "gps",  "phone", "travel", "city", "subway", "news", "web", "protection",
  "fitness", "martial", "combat", "action", "role play", "education",  "famous", "heroe", "winner", "flag", "feeling", "imagine",
  "processing", "ghost", "add", "song", "theme", "background", "case", "fighting", "kingdom", "keys", "password", "seasonal", "celebrity", "dance", "car", 
  "glasses", "dream", "dream book", "book", "troll", "color", "road",  "travel guide",
  "bank", "emoji", "travel guide", "flash",   "studio", "sudoku", "gravity",  
  "rpg", "action shooter", "Wish",
  "sword fight", "war","Wish",
  "sword fight", "Sleep Tracker","google home", 
  "Vine Camera", "mac id","japanese", "Full Fitness",
  "rise up", "heads up", "pinterest", "vine", "Star Walk",
  "Audio Notes"
]

test_query_list (access_token, organizationId, qList, aq, 
    fieldsToInclude, firstResult, numberOfResults)

