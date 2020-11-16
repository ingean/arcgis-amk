function deleteAllFeatures(url, featurename = 'features') {
 deleteFeatures(url,'1=1',featurename);
}

function deleteFeatures(url, where, featurename = 'features') {
  var data = {
    "where": where
  };
  
  $.post(url + '/deleteFeatures?f=json', data)
  .done(response => {
    console.log('SUCCESS: ' + featurename + ' deleted');
  })
  .fail(error => {
    console.log('ERROR: Failed to delete ' + featurename + ' :' + error);
    showError('Failed to delete ' + featurename);
  })
}

function addFeatures(url, features) {
  var data = {
    "features":JSON.stringify(features),
  };

  $.post(url + '/addFeatures', data)
  .done(response => {
    btnSpinner(false);
    console.log('SUCCESS: Features added successfully');
  })
  .fail(error => {
    console.log('ERROR: Failed to add features to feature service: ' + error);
    showError('Failed to add features to feature service');
  })
}

function getFeatureCount(url) {
  return new Promise(resolve => {
    $.get(url + '/query?f=json&where=1+%3D+1&returnCountOnly=true')
    .then(result => {
      resolve(JSON.parse(result).count);
    });
  })
}