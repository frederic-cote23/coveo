const axios = require('axios');
const fs = require('fs');

const access_token = "xx367dddc5-086b-45d1-8083-d417116b6496";
const organizationId = "fcotetrainingorg";
const field = "appcategory";
const maximumNumberOfValues = 50;

async function getFieldValues (access_token, organizationId, field, maximumNumberOfValues) {
    try{
      const response = await axios.get('https://platform.cloud.coveo.com/rest/search/v2/values', {
        params: {
          "access_token": access_token,
          "organizationId": organizationId,
          "field": field,
          "maximumNumberOfValues": maximumNumberOfValues
        }
      });

      fs.writeFile(field+'field_value.json', JSON.stringify(response.data), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved");
            console.log("Number of App: "+Object.keys(response.data).length)
        }
        });
      
    
    }catch(error){
      console.log(error)
    }
}

getFieldValues (access_token, organizationId, field, maximumNumberOfValues);