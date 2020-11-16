$(function(){
  init();
})

function init() {
  getToken();
  resetDemo();
  getRoutesSchema();
  //getCBRNESchema();
  getRoadBlockAreaSchema();
  getHeliSchema();
  $("#a-missingLink").prop('href', url_missingApp);
}

function getToken(){
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": url_Token,
    "method": "POST",
    "headers": {
      "content-type": "application/x-www-form-urlencoded",
      "accept": "application/json"
    },
    "data": {
      "client_id": clientId,
      "client_secret": clientSecret,
      "grant_type": "client_credentials"
    }
  }

  $.ajax(settings).done(function (response) {
    TOKEN = JSON.parse(response).access_token;
  });
}

function resetDemo() {
  $('#span-iterationCount').html('');
  $("#input-date").val(moment().format('YYYY-MM-DDTHH:00'));
  $("#switch-useBarriers").prop('checked', true);
  $("#switch-liveTraffic").prop('checked', true);
  
  deleteAllFeatures(url_routes, 'routes');
  deleteAllFeatures(url_messages, 'messages');
  deleteAllFeatures(url_roadcloseResults, 'roadblocks');
  deleteAllFeatures(url_plumeResult, 'plumes');

  resetResources();
  resetStandby();
  
  addIncidentMessage();
}

function getRoutesSchema() {
  var url = url_routes + '?f=json';
  $.get(url)
  .then(response => {
    schema_routes.fields = JSON.parse(response).fields;
    console.log('SUCCESS: Fetched schema for output routes');
  })
  .catch(error => {
    console.log('ERROR: Not able to get schema for output routes: ' + error);
    showError('Klarte ikke hente skjema for kjøreruter');
  })
}
function getCBRNESchema() {
  var url = url_plumeGP + '?f=json';
  $.get(url)
  .then(response => {
    schema_cbrne.fields = response.fields;
    console.log('SUCCESS: Fetched schema for plume GP-tool input');
  })
  .catch(error => {
    console.log('ERROR: Not able to get schema for plume GP-tool input: ' + error);
    showError('Klarte ikke hente skjema for utslippsområde');
  })
}
 

function getRoadBlockAreaSchema() {
  var url = url_roadcloseGP + '?f=json';
  $.get(url)
  .then(response => {
    schema_roadblockArea.fields = response.fields;
    console.log('SUCCESS: Fetched schema for roadblock GP-tool input area');
  })
  .catch(error => {
    console.log('ERROR: Not able to get schema for roadblock GP-tool input area: ' + error);
    showError('Klarte ikke hente skjema for område for veisperringer');
  })
}

function getHeliSchema() {
  var url = url_heliGP + '?f=json';
  $.get(url)
  .then(response => {
    schema_heliPoint.fields = response.fields;
    console.log('SUCCESS: Fetched schema for helicopter GP-tool input area');
  })
  .catch(error => {
    console.log('ERROR: Not able to get schema for helicopter GP-tool input area: ' + error);
    showError('Klarte ikke hente skjema for punkt til å finne nærmeste luftambulanse');
  })
}


