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


//NA barriers
const url_barriersPoints = {"url": "https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/AMK_barriers/FeatureServer/0/query?where=1%3D1&returnGeometry=true&f=json"};
const url_barriersLines = {"url": "https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/AMK_barriers/FeatureServer/1/query?where=1%3D1&returnGeometry=true&f=json"};
const url_barriersPolygons = {"url": "https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/AMK_barriers/FeatureServer/2/query?where=1%3D1&returnGeometry=true&f=json&outFields=*"};

//Output feature services
const url_routes = 'https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/AMK_resultater/FeatureServer/2';

//Network Analyst services
const url_closestFacility = 'https://route.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World/solveClosestFacility';
const url_VRP = 'https://logistics.arcgis.com/arcgis/rest/services/World/VehicleRoutingProblem/GPServer/SolveVehicleRoutingProblem';
const url_locationAllocation = 'https://demo01.geodata.no/arcgis/rest/services/AMK/LocationAllocationAMK/GPServer/Allokasjonsanalyse';

//GeoEvent Simulation
const url_simulator = 'https://demo09.geodata.no/arcgis/rest/services/AMKSimulatorTjeneste/GPServer/AMK%20Simulator%20Script';

//Tactical analysis services
const url_plumeGP = 'https://demo01.geodata.no/arcgis/rest/services/GP_Tjenester/CBRNE_Tool/GPServer/PlumeTool';
const url_plumeResult = 'https://demo01.geodata.no/arcgis/rest/services/Sikkerhet/IED_CBRNE_Zones/FeatureServer/1';

const url_roadcloseGP = 'https://demo01.geodata.no/arcgis/rest/services/GeoTek/Veisperringer_GP/GPServer/Veisperringer';
const url_roadcloseResults = 'https://demo01.geodata.no/arcgis/rest/services/GeoTek/VeiSperringer/FeatureServer/0';

const url_heliGP = 'https://demo04.geodata.no/arcgis/rest/services/FinnRedningstid/GPServer/Finn%20redningstid%20for%20luftambulansen';



//Starting the responsegrid script
const url_responseGP = 'https://demo01.geodata.no/arcgis/rest/services/AMK/BeredskapsindeksGP/GPServer/Beredskapsindeks';

//Geoevent messages (Geofencing etc.)
const url_messages = 'https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/AMK_barriers/FeatureServer/3';


//App for finding missing person
const url_missingApp = 'https://testkommune.maps.arcgis.com/apps/webappviewer/index.html?id=32082b2392d3401a8083c8f9248e817f';