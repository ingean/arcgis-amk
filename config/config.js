//Set locale for moment
moment.locale('nb_NO');

//Authentication
const clientId = '8jqFFuKioA6zepfu';
const clientSecret = '1243db4379f543f1b6be899fcbef8aea';
const url_Token = 'https://www.arcgis.com/sharing/rest/oauth2/token';

//Input feature services
const url_incident = {"url": "https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/AMK_hendelser/FeatureServer/0/query?where=1%3D1&returnGeometry=true&f=json&outFields=Name"};
const url_standby = {"url": "https://demo01.geodata.no/arcgis/rest/services/AMK/AMK_Holdeplasser/FeatureServer/0/query?where=allokert=3&f=json&outFields=Name"};
const url_resources = {"url": "https://demo01.geodata.no/arcgis/rest/services/GeoTek/Ambulanser/FeatureServer/0/query?where=status='Ledig'&f=json&outFields=Name"};
const url_barriers = {"url": "https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/AMK_barriers/FeatureServer/2/query?where=1%3D1&returnGeometry=true&f=json"};

//Output feature services
const url_routes = 'https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/AMK_resultater/FeatureServer/2';

//Network Analyst services
const url_closestFacility = 'https://route.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World/solveClosestFacility';
const url_VRP = 'https://logistics.arcgis.com/arcgis/rest/services/World/VehicleRoutingProblem/GPServer/SolveVehicleRoutingProblem';
const url_locationAllocation = 'https://demo01.geodata.no/arcgis/rest/services/AMK/LocationAllocationAMK/GPServer/Allokasjonsanalyse';

//GeoEvent Simulation
const url_simulator = 'https://demo09.geodata.no/arcgis/rest/services/AMKSimulatorTjeneste/GPServer/AMK%20Simulator%20Script';

