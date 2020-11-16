var TOKEN = '';
var schema_routes = {};
var schema_cbrne = [
  {"name":"objectid","type":"esriFieldTypeOID","alias":"objectid","editable":false,"nullable":false,"description":null,"domain":null},
  {"name":"type","type":"esriFieldTypeString","alias":"type","length":256,"editable":true,"nullable":true,"description":null,"domain":null},
  {"name":"beskrivelse","type":"esriFieldTypeString","alias":"beskrivelse","length":50,"editable":true,"nullable":true,"description":null,"domain":null},
  {"name":"name","type":"esriFieldTypeString","alias":"name","length":50,"editable":true,"nullable":true,"description":null,"domain":null}
];
var schema_roadblockArea = {};
var schema_heliPoint = {};

const incidentsList = [url_incident, url_standby];
const url_barriers = [url_barriersPoints, url_barriersLines, url_barriersPolygons];
const params_barriers = ['barriers','polylineBarriers','polygonBarriers'];

const historicTimes = {
  "Mandag": "01.01.1990",
  "Tirsdag": "02.01.1990",
  "Onsdag": "03.01.1990",
  "Torsdag": "04.01.1990",
  "Fredag": "05.01.1990",
  "Lørdag": "06.01.1990",
  "Søndag": "07.01.1990"
};

function cutoffRoutes(allRoutes, cutoff) {
  if(cutoff > 0) {
    var routes = [];
    for(var i = 0; i < allRoutes.length; i++) {
      if(allRoutes[i].attributes.Total_TravelTime > minCutOff) {routes.push(allRoutes[i])};
    }
    return routes;
  } else {
    return allRoutes;
  }
}

function btnSpinner(activate, btnID) {
  if(activate === true) {
    $(btnID).append('<span id="spinner-loading" class="spinner-border spinner-border-sm"></span>');
  } else {
    $('#spinner-loading').remove();
  }
}

function routesFieldMapping(inRoutes, routeType) {
  var outRoutes = [];
  for(var i = 0; i < inRoutes.length; i++) {
    var drivetime = formatDrivetime(inRoutes[i].attributes.TotalTravelTime);
    var attributes = {
      "OBJECTID": inRoutes[i].attributes.ObjectID,
      "Name": inRoutes[i].attributes.Name,
      "StartTime": inRoutes[i].attributes.StartTime,
      "EndTime": inRoutes[i].attributes.EndTime,
      "StartTimeUTC": inRoutes[i].attributes.StartTimeUTC,
      "EndTimeUTC": inRoutes[i].attributes.EndTimeUTC,
      "Total_TravelTime": inRoutes[i].attributes.TotalTravelTime,
      "Total_Kilometers": inRoutes[i].attributes.TotalDistance,
      "RouteType": routeType,
      "Destination": "Beredskapspunkt",
      "Formatted_TravelTime": drivetime
    };
    inRoutes[i].attributes = attributes;
    outRoutes.push(inRoutes[i]);
  }
  return outRoutes;
}

function appendToRoutes(routes, routeType) {
  for(var i = 0; i < routes.length; i++) {
    var name = routes[i].attributes.Name.split(' - ');
    var drivetime = formatDrivetime(routes[i].attributes.Total_TravelTime);

    routes[i].attributes["Name"] = name[0];
    routes[i].attributes["RouteType"] = routeType;
    routes[i].attributes["Destination"] = name[1];
    routes[i].attributes["Formatted_TravelTime"] = drivetime; 
  }
  return routes;
}

function formatDrivetime(drivetime) {
  if (drivetime < 60) {
    return moment().startOf('day').add(drivetime, 'minutes').format('mm:ss');
  } else {
    return moment().startOf('day').add(drivetime, 'minutes').format('HH:mm:ss');
  }
}


function showError(message, type= 'danger') {
  $.notify({
    message: message,
    type: type
  });
}

function appendAttributes(features, attributes) {
  for(var i = 0; i < features.length; i++) {
    Object.assign(features[i].attributes, attributes);
  }
  return features;
}

function replaceAttributes(features, attributes, wkid) {
  for(var i = 0; i < features.length; i++) {
    attributes.objectid = i;
    features[i].attributes = attributes;
    features[i].geometry["spatialReference"] = {"wkid":wkid,"latestWkid":wkid};
  }
  return features;
}

function resetResources() {
  var data = {
    "f":"json",
    "features": JSON.stringify(init_amb)
  };

  var url = removeUrlQuery(url_resources.url) + '/updateFeatures';
  
  $.post(url,data).done(response => {
    console.log('SUCCESS: Resource positions and status are reset');
  })
  .fail(error => {
    console.log('ERROR: Failed to reset resources: ' + error);
    showError('Failed to reset resources');
  });
}

function resetStandby() {
  var url = removeUrlQuery(url_standby.url);
  var data = {
    "f":"JSON",
    "where":"allokert=3",
    "calcExpression": JSON.stringify([{"field": "allokert","value": 0}])
  }
  $.post(url + '/calculate', data)
  .done(response => {
    console.log('SUCCESS: Standby points status is reset');
  })
  .fail(error => {
    console.log('ERROR: Resetting standby points statuses failed: ' + error);
    showError('Klarte ikke å tilbakestille status på beredskapspunkter');
  })
}


function addBarriers(params) {
  return new Promise(resolve => {
    if($("#switch-useBarriers").is(':checked')) {
      var requests = [];
    
      for(var i = 0; i < url_barriers.length; i++) {
        requests.push(getFeatureCount(removeUrlQuery(url_barriers[i].url)));
      }
    
      Promise.all(requests) //Check if barrier services have features
      .then(responses => {
        for(var i = 0; i < responses.length; i++) {
          if(responses[i] > 0) {
            params[params_barriers[i]] = JSON.stringify(url_barriers[i]);
          } else {
            console.log('INFO: ' + params_barriers[i] + ' is referencing an empty feature service and not used in analysis');
          }
        }
        resolve(params);
      })
      .catch(error => {
        resolve(params);
      })
    } else {
      resolve(params);
    }
  })
  
}

function addIncidentMessage() {
  $.get(url_incident.url + '&outSR=25833')
  .done(response => {
    response = JSON.parse(response);
    var incident = response.features[0];
    var data = {
      "f":"JSON",
      "features": JSON.stringify([{
        "geometry": incident.geometry,
        "attributes": {
          "Name":"Akutt hendelse",
          "Status":"på",
          "Destination":incident.attributes.Name,
          "Dato": moment().utc().format('YYYY-MM-DDTHH:mm:ss')
        }
      }])
    }

    $.post(url_messages + '/addFeatures',data)
    .done(response => {
      console.log('SUCCESS: Added message with incident');
    })
    .fail(error => {
      console.log('ERROR: Failed to update messages with incident: ' + error);
    })
  })
  .fail(error => {
    console.log('ERROR: Failed to get incident feature: ' + error);
  })
  
  
  
}

function addTimeofDay(params, timekey = 'timeOfDay') {
  if($("#switch-liveTraffic").is(':checked')) {
    params[timekey] = moment($('#input-date').val()).valueOf();
    console.log('INFO: Time of analysis (real time): ' + moment(params[timekey]).format('DD.MM.YYYY HH:mm:ss') + ', EPOC (milliseconds): ' + params[timekey]);
    return params;
  } else {
    var timestring = moment(historicTimes[$('#select-weekday').val()],'DD.MM.YYYY').format('DD.MM.YYYY') + 
                    'T' + 
                    moment($('#input-date').val()).format('HH:00:00'); 
    params[timekey] = moment(timestring,'DD.MM.YYYYTHH:mm:ss').valueOf();
    console.log('INFO: Time of analysis (historic): ' + moment(params[timekey]).format('DD.MM.YYYY HH:mm:ss') + ', EPOC (milliseconds): ' + params[timekey]);
    return params;
  }
}

function removeUrlQuery(url) {
  url = String(url);
  return url.substr(0, url.indexOf('/query?'));
}

function showHeliRoutes(messages, incidentPoint) {
  var routes = [];
  var m = [4,14,24,34,44];

  for (var i = 0; i < 4; i++) {
    var descr = messages[m[i]].description; 
    var hl = heliLocations[descr.substr(0,descr.indexOf(' ')).replace('\\','')];
    var driveTime = formatDrivetime(parseHeliMessage(messages[m[i] + 3].description));
    var distance = Number(parseHeliMessage(messages[m[i] + 2].description));

    var route = {
      "attributes": {
        "Name": hl.label,
        "FacilityRank": i + 1,
        "RouteType":"Helikopter",
        "Total_Kilometers": distance,
        "Destination": incidentPoint.attributes.Name,
        "Formatted_TravelTime": driveTime
      },
      "geometry": {
        "paths": [[[hl.coords[0],hl.coords[1]],[incidentPoint.geometry.x,incidentPoint.geometry.y]]]
      }
    }
    routes.push(route);
  }
  addFeatures(url_routes, routes);

  var data = {
    "f":"JSON",
    "features": JSON.stringify([{
      "geometry": incidentPoint.geometry,
      "attributes": {
        "Name": routes[0].attributes.Name,
        "Status":"på vei til",
        "Destination":incidentPoint.attributes.Name,
        "Dato": moment().utc().format('YYYY-MM-DDTHH:mm:ss')
      }
    }])
  }
  
  $.post(url_messages + '/addFeatures',data)
    .done(response => {
      console.log('SUCCESS: Added message with helicopter approaching');
    })
    .fail(error => {
      console.log('ERROR: Failed to update messages with helicopter approaching: ' + error);
    })
}

function parseHeliMessage(description) {
  var start = description.indexOf(':') + 1;
  var end = description.indexOf('.') - start + 2;
  
  return Number(description.substr(start, end).trim());
}