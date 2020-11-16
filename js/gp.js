function findStandby() {
  btnSpinner(true, '#btn-findStandby');
  var selectedDay = moment($('#input-date').val()).format('dddd');
  selectedDay = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);
  console.log(selectedDay);
  var url = url_locationAllocation +
            '/submitJob?f=json&Dag=' + selectedDay;

 $.get(url)
  .done(response => {
    console.log('SUCCESS: Submitted request for location allocation, check job status:');
    console.log(url_locationAllocation + '/jobs/' + response.jobId + '?f=pjson');
    checkGPJob(url_locationAllocation, response.jobId, 1000, 200, function(response) {
      //Do something while executing
    });
  })
  .fail(error => {
    console.log('ERROR: Failed to find standby locations: ' + error);
    showError('Failed to find standby locations');
  })
}

function executePlume() {
  btnSpinner(true, '#btn-createPlumes');
  $.get(url_incident.url + '&outSR=25833')
  .done(response => {
    response = JSON.parse(response);
    var name = response.features[0].attributes.Name;
    response.features[0].attributes = {"objectid":1,"type": "Gass: Giftig 2", "beskrivelse": null,"name":name};
    
    //var features = replaceAttributes(response.features, {"objectid":1,"type": "Gass: Giftig 2", "beskrivelse": null,"name":name},25833);
    
    var cbrne_point = {
      "fields": schema_cbrne,
      "features": response.features,
      "geometryType": "esriGeometryPoint",
      "sr":{"wkid":25833,"latestWkid":25833}
    }

    var cbrne_input = {
      "env:outSR": 25833,
      "Senterpunkt": JSON.stringify(cbrne_point),
      "Vind_fra_YR_no": false,
      "Brukerdefinert_vindretning": "NE",
      "Brukerdefinert_vindstyrke": 15,
      "Beskrivelse": $('#select-plume-type').val(),
      "Slett_gamle_soner": true
    };
  
    $.post(url_plumeGP + '/submitJob?f=json', cbrne_input)
    .done(response => {
      console.log('SUCCESS: Submitted request for plume successfully, check job status: ');
      console.log(url_plumeGP + '/jobs/' + response.jobId + '?f=pjson');
      checkGPJob(url_plumeGP, response.jobId, 1000, 50, function(response) {
        //Do something while executing
      });
    })
    .fail(error => {
      console.log('ERROR: Failed to create plumes: ' + error);
      showError('Failed to create plumes');  
    })
  })
}

function executeRoadCloseGP() {
  btnSpinner(true, '#btn-createRoadBlocks');

  $.get(url_plumeResult + "/query?f=json&where=id_field='Hot'")
  .done(response => {
    var data = {
      "Område": JSON.stringify({
        "geometryType": "esriGeometryPolygon",
        "spatialReference": {
          "wkid" : 25833, 
          "latestWkid" : 25833
        }, 
        "fields": schema_roadblockArea.fields,
        "features": response.features
      }),
      "Melding": "Hot faresone"
    }

    $.post(url_roadcloseGP + '/submitJob?f=json',data)
    .done(response => {
      console.log('SUCCESS: Submitted request for roadblocks successfully, check job status: ');
      console.log(url_roadcloseGP + '/jobs/' + response.jobId + '?f=pjson');
      checkGPJob(url_roadcloseGP, response.jobId, 1000, 50, function(response) {
        //Do something while executing
      });
    })
    .fail(error => {
      console.log('ERROR: Failed to submit request for roadblocks: ' + error);
      showError('Failed to create roadblocks');
    })
  })
  .fail(error => {
    console.log('ERROR: Failed to get plume polygon for use as input to roadblocks GP-tool: ' + error);
    showError('Failed to create roadblocks');
  })
}

function executeFindHeli() {
  var incidentPoint = {};
  btnSpinner(true, '#btn-findHeli');
  deleteAllFeatures(url_routes, 'routes');
  
  $.get(url_incident.url + '&outSR=25833')
  .done(response => {
    response = JSON.parse(response);
    incidentPoint = response.features[0];
    var data = {
      "Hendelse": JSON.stringify({
        "geometryType": "esriGeometryPoint",
        "spatialReference": {
          "wkid" : 25833, 
          "latestWkid" : 25833
        },
        "fields": schema_heliPoint.fields,
        "features": response.features
      }),
      "Utstyr": $('#select-rescuetype').val(),
      "Mottak": "OUS/Ullevaal"
    }

    $.post(url_heliGP + '/execute?f=json',data)
    .done(response => {
      console.log('SUCCESS: Executed closest helicopter successfully');
      showHeliRoutes(response.messages, incidentPoint);
    })
    .fail(error => {
      console.log('ERROR: Failed to execute find closest helicopter: ' + error);
      showError('Klarte ikke finne nærmeste luftambulanse');
    })
  })
  .fail(error => {
    console.log('ERROR: Failed to get incident for use as input to find closest helicopter GP-tool: ' + error);
    showError('Klarte ikke finne nærmeste luftambulanse');
  })
}


function startSimulation(features) {
  var url = url_simulator + '/submitJob';
  var data = {
    "f":"json",
    "Hastighet": $("#input-simulationSpeed").val(),
    "Linjer":JSON.stringify({
      "objectIdFieldName" : "OBJECTID", 
      "uniqueIdField" : {
        "name" : "OBJECTID", 
        "isSystemMaintained" : true
      }, 
      "globalIdFieldName" : "", 
      "geometryProperties" : {
        "shapeLengthFieldName" : "Shape__Length", 
        "units" : "esriMeters"
      }, 
      "geometryType" : "esriGeometryPolyline", 
      "spatialReference" : {
        "wkid" : 25833, 
        "latestWkid" : 25833
      }, 
      "fields": schema_routes.fields,
      "features": features
    })
  }; 

  //console.log(JSON.stringify(data.Linjer));
  $.post(url,data)
  .done(response => {
    console.log('SUCCESS: Submitted request for starting simulation, check job status:');
    console.log(url_simulator + '/jobs/' + response.jobId + '?f=pjson');
    checkGPJob(url_simulator, response.jobId, 1000, 50, function(response) {
      //Do something while executing
    });
  })
  .fail(error => {
    console.log('ERROR: Failed to submit features to GeoEvent simulator: ' + error);
    showError('Failed to submit features to GeoEvent simulator');  
  })
}

function startResponseGrid() {
  var url = url_responseGP + '/submitJob';
  var data = {
    "f":"json",
    "Antall": $('#input-gridIterations').val()
  }

  $.post(url,data)
  .done(response => {
    $('#span-iterationCount').html('Starter'); //Viser indikator på at Beredskapsgridet starter
    console.log('SUCCESS: Submitted request for starting responsegrid script, check job status:');
    console.log(url_responseGP + '/jobs/' + response.jobId + '?f=pjson');
    var iterations = Number($('#input-gridIterations').val()) + 100;
    checkGPJob(url_responseGP, response.jobId, 6000, iterations, function(response) {
      var responseGridIter = 1;
      var messages = response.messages;
      for(var i = 0; i < messages.length; i++) {
        if(messages[i].description.length < 4) {
          responseGridIter++;
          $('#span-iterationCount').html(
            responseGridIter + 
            ' av ' +
            $('#input-gridIterations').val() 
          );
        }
      }
    });
  })
  .fail(error => {
    console.log('ERROR: Failed to submit responsegrid script startup: ' + error);
    showError('Oppstart av beredskapsgrid feilet'); 
  })
}


function checkGPJob(url_GPservice, jobId, freq, maxQueries, callback) {
  var url = url_GPservice + '/jobs/' + jobId + '?f=json';
  if(maxQueries > 0) {
    $.get(url)
    .done(response => {
      if(response.jobStatus !== 'esriJobSucceeded' && response.jobStatus !== 'esriJobFailed') {
        if (response.jobStatus === 'esriJobExecuting') { callback(response); }
        setTimeout(() => {
          checkGPJob(url_GPservice, jobId, freq, maxQueries - 1, callback);
        }, freq);
      } else if(response.jobStatus === 'esriJobFailed') {
        btnSpinner(false);
        console.log('ERROR: GP-tool failed with the following messages: ' + JSON.stringify(response.messages));
        showError('Failed to run GP-tool');
      } else {
        btnSpinner(false);
        $('#span-iterationCount').html('');
        console.log('SUCCESS: GP-tool finished');
      }
    })
    .fail(error => {
      console.log('ERROR: Failed to get job status: ' + error);
    })
  } else {
    console.log('INFO: GP tool job status check timed out');
    btnSpinner(false);
  }
}