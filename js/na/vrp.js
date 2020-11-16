async function dispatchStandby() {
  btnSpinner(true, '#btn-dispatchStandby');
  deleteAllFeatures(url_routes, 'routes');
  
  let orders = await $.get(incidentsList[1]);
  orders = {
    type: 'features',
    features: orders.features
  }

  let depots = await $.get(url_resources);
  depots = {
    type: 'features',
    features: depots.features
  }

  createVRPRoutes(url_resources.url)
  .then(routes => {
    var params = {
      "f":"json",
      "token": TOKEN,
      "orders": JSON.stringify(orders),
      "depots": JSON.stringify(depots),
      "routes": JSON.stringify(routes),
      "impedance": "TravelTime",
      "env:outSR": 25833,
    };

    params = addTimeofDay(params, 'default_date');

    addBarriers(params)
    .then(params => {
      submitVRP(params);
    })

    
  })
  .catch(error => {
    console.log('ERROR: Not able to get features to make routes: ' + error);
    showError('Not able to get features to make routes');
  })
}

async function getOrders(url) {
  let response = await $.get(url);
  return {
    type: 'features',
    features: response.features
  }
}

function submitVRP(data) {
  $.post(url_VRP + '/submitJob', data)
  .done(response => {
    console.log('SUCCESS: VRP job submitted, check job status: ');
    console.log(url_VRP + '/jobs/' + response.jobId + '?f=pjson&token=' + TOKEN);
    checkVRPJob(response.jobId);
  })
  .fail(error => {
    console.log('ERROR: Failed to submit job to allocate facilities to incidents: ' + error);
    showError('Failed to submit job to allocate facilities to incidents');
  });
}

function createVRPRoutes(url) {
  return new Promise((resolve, reject) => {
    $.get(url)
    .done(response => {
      var features = response.features;
      var routes = [];
      
      for(var i = 0; i< features.length; i++) {
        var route = {
          "attributes": {
            "Name": features[i].attributes.name,
            "MaxOrderCount":1,
            "StartDepotName": features[i].attributes.name,
          }
        }
        routes.push(route);
      }
      resolve({"features": routes});
    })
    .fail(error => {
      reject(error);
    })  
  })
}

function checkVRPJob(jobId, freq = 5000, maxQueries = 50) {
  var url = url_VRP + '/jobs/' + jobId; 
  if(maxQueries > 0) {
    $.get(url + '?f=json&token=' + TOKEN)
    .done(response => {
      if(response.jobStatus !== 'esriJobSucceeded' && response.jobStatus !== 'esriJobFailed') {
        setTimeout(() => {
          checkVRPJob(jobId, freq, maxQueries - 1);
        }, freq);
      } else if(response.jobStatus === 'esriJobFailed') {
        btnSpinner(false);
        console.log('ERROR: VRP failed with the following messages: ' + response.messages);
        showError('Failed to allocate resources to standby points');
      } else {
        btnSpinner(false);
        getVRPRoutes(url, response.results.out_routes.paramUrl);
      }
    })
    .fail(error => {
      console.log('ERROR: Failed to get job status: ' + error);
    })
  } else {
    console.log('INFO: VRP-tool status check timed out');
    btnSpinner(false);
  }
}

function getVRPRoutes(url_job, url_results_routes) {
  $.get(url_job + '/' + url_results_routes + '?f=json&token=' + TOKEN)
  .done(response => {
    var routes = routesFieldMapping(response.value.features,'Omplassering');
    addFeatures(url_routes, routes);
    startSimulation(routes);
  })
  .fail(error => {
    console.log('ERROR: Failed to get routes from VRP result');
    showError('Failed to get routes from VRP result');
  })
}