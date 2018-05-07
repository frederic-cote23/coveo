const fs = require('fs');
const path = require('path');
const stripCommon = require('strip-common-words');
const sw = require('stopword');


Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == deleteValue) {         
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  };

  
function isInArray(arr,obj) {
    return (arr.indexOf(obj) != -1);
}


function extractFileList(repository){

    let file_list = []

    fs.readdirSync(repository).forEach(file => {
        file_list.push(file);
    })

    var index = file_list.indexOf('.DS_Store');

    if (index > -1) {
        file_list.splice(index, 1);
      }

    return file_list

}

/* 
    Generate a set of good queries from a result list, based on the Title of the results
*/
function generateGoodQueries (folder){

    let goodQueries = {};

    let file_list = extractFileList(folder);

    file_list.forEach(file => {

        let searchResults = JSON.parse(fs.readFileSync(folder+'/'+file));
        let currentCategory = file.replace(' @apprank.json', '').replace('@appcategory=', '').replace(' @appisfree=false', '').replace(' @appisfree=true', '').replace('.json', '');

        goodQueries[currentCategory] = []


        searchResults.results.forEach(item => {

            let excerpt = item.excerpt.replace(':', '').replace('–', '').replace('|', '').split(' ').clean('').clean('-').clean('&');
            let title = item.title.replace(':', '').replace('–', '').replace('|', '').replace('™', '').split(' ').clean('').clean('-').clean('&');
            
            let excerptKeywords = sw.removeStopwords(excerpt);
            let titelKeywords = sw.removeStopwords(title);

            if( !isInArray(goodQueries[currentCategory], titelKeywords.slice(0, 1).join(" ")) ){
                goodQueries[currentCategory].push(titelKeywords.slice(0, 1).join(" "));
            }

            if( !isInArray(goodQueries[currentCategory], titelKeywords.slice(1, 3).join(" ")) ){
                goodQueries[currentCategory].push(titelKeywords.slice(1, 3).join(" "));
            }

            if( !isInArray(goodQueries[currentCategory], titelKeywords.slice(3, 5).join(" ")) ){
                goodQueries[currentCategory].push(titelKeywords.slice(3, 5).join(" "));
            }

        });


    });

    return goodQueries

}


function mergeTwoQueryListTogether(top_query, top_app) {

    let goodQueries = {}

    Object.keys(top_app).forEach(function (category){
    
        goodQueries[category] = []
    
        top_app[category].forEach(query => {
    
            if(goodQueries[category], query){
                goodQueries[category].push(query);
            } 
        });

    });

    Object.keys(top_query).forEach(function (category){
    
        top_query[category].forEach(query => {
    
            if(goodQueries[category], query){
                goodQueries[category].push(query);
            } 
        });
    
    });

    let duplicateList = [];
    let finalList = {}

    Object.keys(goodQueries).forEach(function (category){
    
        finalList[category] = [];

        goodQueries[category].forEach(keywords => {

            if( !isInArray(duplicateList, keywords) ){
                duplicateList.push(keywords);
                finalList[category].push(keywords)
            }

        });
    
    });    

    return finalList

}


function createQueryList (top_query, top_app, fileName){

    let keywordList = mergeTwoQueryListTogether(top_query, top_app);


    fs.writeFile(fileName, JSON.stringify(keywordList), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved");
        }
    });
}


/* 
    Generate a set of top results 
*/
function generateSearchAndClickByCategory (folder){

    let topSearchAndClick = {};

    let file_list = extractFileList(folder);

    file_list.forEach(file => {

        let searchResults = JSON.parse(fs.readFileSync(folder+'/'+file));
        let currentCategory = file.replace(' @apprank.json', '').replace('@appcategory=', '').replace(' @appisfree=false', '').replace(' @appisfree=true', '').replace('.json', '');

        topSearchAndClick[currentCategory] = [];

        searchResults.results.forEach(item => {

            if( String(item.Title).replace(/[^\x00-\x7F]/g, "").split(" ").slice(0, 2).join(" ").replace(':', '').replace(/\s\s+/g, ' ').length > 4 ){

                if(item.raw.appisfree == 'true'){
                    topSearchAndClick[currentCategory].push({"query": item.Title.split(" ").slice(0, 2).join(" ").replace(':', '').replace(/\s\s+/g, ' ') ,"title": item.Title, "uri": item.Uri, "appisfree": item.raw.appisfree});
                }else{
                    topSearchAndClick[currentCategory].push({"query": item.Title.split(" ").slice(0, 2).join(" ").replace(':', '').replace(/\s\s+/g, ' ') ,"title": item.Title, "uri": item.Uri, "appisfree": item.raw.appisfree});
                }
            }

        });

    });

    return topSearchAndClick;



}


function equalizeSearchAndClickWithTopResults (topAppFolder, topQueryFolder) {

    let searchAndClick = generateSearchAndClickByCategory(topAppFolder);
    let queryResult= generateSearchAndClickByCategory(topQueryFolder);

    let freeApps = {};
    let paidApps = {};  


    Object.keys(searchAndClick).forEach(function (category){

        freeApps[category] = [];
        paidApps[category] = [];

        searchAndClick[category].forEach(element => {

            if(element.appisfree == 'true'){
                freeApps[category].push(element);
            }else{
                paidApps[category].push(element);
            }

        });

    });

    Object.keys(queryResult).forEach(function (category){

        if( freeApps[category].length<40){

            for (var i = 0; i < 40;){
            
                let randomApp = Math.floor(Math.random()*queryResult[category].length);
    
                if ( !isInArray(freeApps[category], queryResult[category][randomApp]['title']  ) ){
                    
                    if(queryResult[category][randomApp]['appisfree'] == 'true'){
                        freeApps[category].push(queryResult[category][randomApp]);
                    }else{
                        paidApps[category].push(queryResult[category][randomApp])
                    }

                    i++;
                }
    
                if (freeApps[category].length>40){
                    break;
                }
                
            }            

        }

    });    

    fs.writeFile('searchAndClick_freeApp.json', JSON.stringify(freeApps), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved");
        }
    });


    fs.writeFile('searchAndClick_paidApp.json', JSON.stringify(paidApps), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved");
        }
    });

/*
    let test = {}

    Object.keys(queryResult).forEach(function (category){

        test[category] = [];

        for (var i = 0; i < 40;){
            
            let randomApp = Math.floor(Math.random()*queryResult[category].length);

            if ( !isInArray(test[category], queryResult[category][randomApp]['title']  ) ){
                test[category].push(queryResult[category][randomApp])
                i++;
            }

            
        }

    });      

    //isInArray
    //Math.floor(Math.random()*array.length)

    fs.writeFile('test.json', JSON.stringify(test), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved");
        }
    });  
*/

}



const topAppFolder = 'data/searchresults/topDocument';
const topQueryFolder = 'data/searchresults/words';

let top_query = generateGoodQueries(topQueryFolder);
let top_app = generateGoodQueries(topAppFolder);

//createQueryList (top_query, top_app, 'goodQueryList.json')
//generateSearchAndClickByCategory (topAppFolder, 'searchAndClick.json')

equalizeSearchAndClickWithTopResults (topAppFolder, topQueryFolder);

/*
let searchResults = JSON.parse(fs.readFileSync('searchAndClick.json'));

Object.keys(searchResults).forEach(function (category){
    
    console.log(JSON.parse(searchResults[category]['free'][0]));

});


    fs.writeFile(fileName, JSON.stringify(topSearchAndClick), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved");
        }
    });


*/