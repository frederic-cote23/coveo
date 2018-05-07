//c_context_persona
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));


function isInArray(arr,obj) {
    return (arr.indexOf(obj) != -1);
}

function build_random_search (goodQuery) {
    return {
        "type": "Search", 
        "arguments": {
            "queryText": "",
            "goodQuery" : goodQuery,
        }
    }
}

function build_random_click (offset, prob) {
    return {
        "type": "Click",
        "arguments": {
            "docNo": -1,
            "offset": offset,
            "probability": prob
        }
    }
}

function build_random_view(offset, prob){
    return {
        "type": "View",
        "arguments": {
            "offset": offset,
            "probability": prob,
            "docNo": -1
        }
    }
}

function build_targetted_view(pageuri, pagetitle, prob){
    return {
        "type": "View",
        "arguments": {
            "probability": prob,        
            "pageuri" : pageuri,
            "pagereferrer" : "https://www.appstore.com",
            "pagetitle" : pagetitle
        }
    }
}

function build_searchAndClick (queryText, docToClick, prob, persona, AppType){
    return {
        "type" : "SearchAndClick",
        "arguments" : {
            "queryText" : queryText,
            "probability" : 0.85,
            "docClickTitle" : docToClick,
            "customData":{
                "context_persona": persona,
                "context_AppType": AppType
            }
        }
    }
}

function build_scenario(){

    let scenario = {
        "name": "HomePageViewAndClick",
        "weight": 3,
        "useragent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36",
        "events": []        
    }

}

function build_scenario_file(){

    scenario_file = {
        "searchendpoint": config.searchendpoint,
        "analyticsendpoint": config.analyticsendpoint,
        "orgName": config.orgName,
        "randomGoodQueries": [],
        "randomBadQueries": [],
        "anonymousThreshold": config.anonymousThreshold,
        "timeBetweenVisits": config.timeBetweenVisits,
        "timeBetweenActions": config.timeBetweenActions,
        "pipeline": config.pipeline,
        "randomCustomData": config.randomCustomData,
        "globalFilter": config.globalFilter,
        "scenarios" : []
    }

    console.log(scenario_file)

}

function extract_goodQuery(category){

    let randomKeyword = Math.floor(Math.random()*goodQueries[category].length);

    while(true){

        let query = goodQueries[category][randomKeyword];

        //check if the query was already used in the scenario goodQueryUsed

        if( !(query in goodQueryUsed) ){
            goodQueryUsed[query] = query;
            return query;
        }
    }

    
}

/*
    return: an object   {  queryText, documentUri, documentTitle }
*/
function extract_searchAndClick(AppType, category){

    if(AppType == 'free'){

        let randomPair = Math.floor(Math.random()*searchAndClick_free[category].length);

        while(true){
            let pair = searchAndClick_free[category][randomPair];

            //check if the query was already used in the scenario searchAndClickUsed
            if( !isInArray(searchAndClickUsed, pair.title) ){
                //push it to the used query list
                searchAndClickUsed.push(pair.title);
                return pair;
            }
        }

    }else{
        let randomPair = Math.floor(Math.random()*searchAndClick_paid[category].length);

        while(true){
            let pair = searchAndClick_paid[category][randomPair];

            //check if the query was already used in the scenario searchAndClickUsed
            if( !isInArray(searchAndClickUsed, pair.title) ){
                //push it to the used query list
                searchAndClickUsed.push(pair.title);
                return pair;
            }
        }
    }
}

/*

    return list contained the search and click in 0 and the page view in 1
*/

function assemble_searchAndClick_pageView (prob, persona, AppType, category){
//        3 Random Search
//        1 Random S&C
 
    //[EXTRACT DATA]
        //EXTRACT goodQuery ->> extract_goodQuery(category)

        //EXTRACT queryText, docToClick ->> extract_targetSearch(AppType, category)

    //EXTRACT DATA - get an object   {  query, uri, title, appisfree }
    let data = extract_searchAndClick(AppType, category);

    //build_searchAndClick (queryText, docToClick, prob, persona, AppType)
    let searchAndClick = build_searchAndClick (data.query, data.title, prob, persona, AppType)
    let viewEvent = build_targetted_view(data.uri, data.title, prob)

    return [searchAndClick, viewEvent]

    //->FEEDING TO, requires 3 goodQuery + [queryText, docToClick, prob, persona, AppType]

    //build_random_search (goodQuery)
    //build_searchAndClick (queryText, docToClick, prob, persona, AppType)
}



function appStore_extractGoodQueries (){
    
    //Book, Education, Entertainment, Finance, Food & Drink, Games, Health & Fitness, Lifestyle
        //Magazines & Newspapers, Medical, Music, Navigation, News, Photo & Video, Productivity
            //Reference, Shopping, Social Networking, Sports, Stickers, Travel, Utilities, Weather

    let profiles = {
        "A": {
            "mainGenres": "Games",
            "subGenres": []
        },
        "B": {
            "mainGenres": "Shopping",
            "subGenres": ["Social Networking", "Entertainment"]
        },
        "C": {
            "mainGenres": "Social Networking",
            "subGenres": ["News", "Games"]
        },
        "D": {
            "mainGenres": "Entertainment",
            "subGenres": ["Games", "Music", "Utilities"]
        },
        "E": {
            "mainGenres": "Photo & Video",
            "subGenres": ["Utilities", "Reference", "Social Networking"]
        },
        "F": {
            "mainGenres": "Lifestyle",
            "subGenres": ["Travel", "Games", "Food & Drink"]
        },
        "G": {
            "mainGenres": "Music",
            "subGenres": ["Travel", "Music", "Shopping"]
        },
        "H": {
            "mainGenres": "Finance",
            "subGenres": ["Utilities", "Productivity", "Social Networking", "Travel", "Music", "Shopping"]
        },
        "I": {
            "mainGenres": "Education",
            "subGenres": ["Productivity", "Music", "Social Networking", "Games", "Travel", "Book"]
        },
    }

    return profiles
}

function generatePersonaGoodQueries (){
    let profiles = appStore_extractGoodQueries ();

    Object.keys(profiles).forEach(function (profile){

        //let profileMainGenres = profile.mainGenres;
        //let profileSubGenres = profile.subGenres;

        let goodQuery = [];
        console.log(goodQueryUsed)

        //EXTRACT MAIN KEYWORDS
        for(var i=0; i< 12; i++){
            //Add a good Query to the Persona List extract_goodQuery(category)
            
            goodQuery.push(extract_goodQuery(profiles[profile].mainGenres));
            

        }

        if(profiles[profile].subGenres.length===2){
            
            let subGenres = profiles[profile].subGenres;

            subGenres.forEach(genre => {
                
                for(var i=0; i< 9; i++){
                    //Add a good Query to the Persona List extract_goodQuery(category)
                    goodQuery.push(extract_goodQuery(genre));
        
                }

            });

        }else if(profiles[profile].subGenres.length==3){

            let subGenres = profiles[profile].subGenres;

            subGenres.forEach(genre => {
                
                for(var i=0; i< 6; i++){
                    //Add a good Query to the Persona List extract_goodQuery(category)
                    goodQuery.push(extract_goodQuery(genre));
        
                }

            });

        }else if (profiles[profile].subGenres.length==6){

            let subGenres = profiles[profile].subGenres;

            subGenres.forEach(genre => {
                
                for(var i=0; i< 6; i++){
                    //Add a good Query to the Persona List extract_goodQuery(category)
                    goodQuery.push(extract_goodQuery(genre));
        
                }

            });

        }

        fs.writeFile('data/tools/'+profile+'.json', JSON.stringify(goodQuery), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved");
            }
          });

    });

    /*
    A Profile has
        Preffered Genre: 40% -> 12
        Interested Genre: 60% -> 18
            2 -> 9
            3 -> 6
            6 -> 3
    */
}

var goodQueryUsed = {};
var searchAndClickUsed = [];

const goodQueries = JSON.parse(fs.readFileSync('data/app store/goodQueryList.json')); 
const searchAndClick_free = JSON.parse(fs.readFileSync('data/app store/searchAndClick_freeApp.json')); 
const searchAndClick_paid = JSON.parse(fs.readFileSync('data/app store/searchAndClick_paidApp.json')); 

//console.log(extract_goodQuery("Education"))
//console.log(extract_targetSearch("free","Education")) 
//console.log(assemble_searchAndClick_pageView (0.7, "Gamers", "free", "Education"));
//console.log(assemble_viewEvent  (0.7, "free", "Education"));

generatePersonaGoodQueries ();

/*
    Scenario 1 - ONE FOR EACH Targetted Search&Click
        3 Random Search
        1 Random S&C
    
    Random
        Search -> Click -> PageView 0.75 offset 9
        Search -> Click/Pageview -> Click/PageView -> Click/PageView -> PageView 0.75 offset 9
        Search -> Click -> PageView 0.65 offset 7
        Search -> Click/Pageview -> Click/PageView -> Click/PageView -> PageView 0.65 offset 7
        Search -> Click -> PageView 0.5 offset 5
        Search -> Click/Pageview -> Click/PageView -> Click/PageView -> PageView 0.5 offset 5
        Search -> Click -> PageView 0.25 offset 3
        Search -> Click/Pageview -> Click/PageView -> Click/PageView -> PageView 0.25 offset 3

    >> 5 SearchAndClick for a Targetted,  UNIQUE Free App
    >> 5 SearchAndClick of q Targetted, UNIQUE Paid App
    >> 30 random good queries from the Persona Genre

    The targetted apps are pulled from a a profile

    A Profile has
        Preffered Genre: 40% -> 12
        Interested Genre: 60% -> 18
            2 -> 9
            3 -> 6
            6 -> 3
            9 -> 2



*/