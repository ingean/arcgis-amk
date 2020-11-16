function findClosest() {
  btnSpinner(true, '#btn-findClosest');
  deleteAllFeatures(url_routes, 'routes');
  
  var params = {
    "f": "json",
    "token": TOKEN,
    "facilities": JSON.stringify(url_resources),
    "incidents": JSON.stringify(incidentsList[0]),
    "returnDirections":false,
    "returnCFRoutes":true,
    "travelDirection": "esriNATravelDirectionFromFacility",
    "impedanceAttributeName": "TravelTime",
    "defaultTargetFacilityCount": $('#input-facilityCount').val(),
    "outSR": 25833
  };
  
  params = addTimeofDay(params);

  addBarriers(params)
  .then(params => {
    executeClosestFacility(params);  
  })
}

function executeClosestFacility(data) {
  $.post(url_closestFacility, data)
  .done(response => {
    var routes = appendToRoutes(response.routes.features,'Rykker ut');
    addFeatures(url_routes, routes);
    startSimulation(routes);
  })
  .fail(error => {
    console.log('ERROR: Failed to find closest facilities: ' + error);
    showError('Failed to find closest facilities');
  })  
}
