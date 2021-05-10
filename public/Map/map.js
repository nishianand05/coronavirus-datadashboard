// ----------------------------------------- Default Map ----------------------------------------- 

// Get date and attribute and create Map
var dateInput = $("#dateInput").val();
var attribute = "cases";
$('#mainTitleDate').text(dateInput)
map(dateInput, attribute);


// ----------------------------------------- Map with attr and date selected by user ----------------------------------------- 

// Load button
$("#refresh").click(function(){
	$("#refresh").text("Loading...")	
    // Get date and attribute and create map
    dateInput = $("#dateInput").val();
    var radio = document.querySelectorAll(".radio");
    for(var i=0;i<radio.length;i++){
        if(radio[i].checked){
            attribute = radio[i].value;
        }
    }
    map(dateInput, attribute);
});

// ----------------------------------------- Map function ----------------------------------------- 

function map(dateInput, attribute){
    
    $('#mainTitleDate').text(dateInput)

    d3.queue()
    .defer(d3.json, 'https://unpkg.com/world-atlas@1.1.4/world/50m.json')
    .defer(d3.json, 'https://api.covid19tracking.narrativa.com/api/' + dateInput)
    .await(function(error, mapData, coroData) {

        // Display alert message if error or no data

        if (error || !(mapData) || !(coroData)){
            alertMessage();
        };


        // Data arrays
        var coroArr = formatAllData(coroData, dateInput);
        var totData = totalData(coroData);
        var geoData = topojson.feature(mapData, mapData.objects.countries).features;


        AddTotalData(totData);

        // Join coroArr to geoData as property 
        for(var i=0; i< geoData.length; i++){
            for(var j=0; j<coroArr.length; j++){
                if(coroArr[j]['id'] === geoData[i]['id']){
                    geoData[i].properties = coroArr[j];
                }
            }
            
        }

        //Tooltips

        var tooltip = d3.select('body')
        .append('div')
            .classed('tooltip', true);

        // SVG width and height
        var width = 1500;
        var height = 1100;


        // Projection
        var projection = d3.geoMercator()
                            .scale(235)
                            .translate([width/2, height/1.5]);

        // Paths
        var path = d3.geoPath()
                     .projection(projection);

        

        // Drawing map
        var svg = d3.select('#map')
                    .attr('width', width)
                    .attr('height', height)
                    .selectAll('.country')
                    .data(geoData)
                    .enter()
                        .append('path')
                        .classed('country', true)
						.attr('stroke', '#000')
						.attr('stroke-width', '0.1px')
                        .attr('d', path)
                        .on('mousemove', showTooltip)
                        .on('touchstart', showTooltip)
                        .on('mouseout', hideTooltip)
                        .on('touchend', hideTooltip);
                    

                            

        // Refresh button
        d3.select('#refresh')
          .on('click', function(){
              makeMap(coroArr, attribute);
          });

        makeMap(coroArr, attribute);

        function makeMap(coroArr, attribute){

            // Change title
            d3.select('#mapTitle')
            .text(`Map - ${attribute.charAt(0).toUpperCase() + attribute.slice(1)} (${dateInput})`);
        
            
            // Color range
            var  colorRanges = {		
				deaths: ["#400000", "#d03711"],

                cases: ['#421600','#fcdf03'],                
				// cases: ['#591d00','#f7b401'],
                // activeCases: ['#420d16', '#ff6c2b'],                
				activeCases: ['#641220', '#d65a24'],
                recovered: ['#449646', '#024201'],                
				// recovered: ['#73a942', '#004b23'],

            };
            
            
            // Scale
            var scale = d3.scaleSqrt()
                            .domain([0, d3.max(coroArr, d => d[attribute])])
                            .range(colorRanges[attribute]);

            
            // Update map
            d3.selectAll('.country')
                .transition()
                .duration(750)
				.on('end', function(d,i,nodes){
							if(i === nodes.length - 1){
						  $("#refresh").text("Refresh")	  
						}})
                .ease(d3.easeBackIn)
                .attr('fill', d => {
                    var data = d.properties[attribute];
                    return data ? scale(data) : '#ccc';
                })

                // .on('mousemove', showTooltip)
                // .on('touchstart', showTooltip)
                // .on('mouseout', hideTooltip)
                // .on('touchend', hideTooltip);

        
        }
        
        // Tooltip functions
            
        function showTooltip(d) {

            var country = d3.select(this);
            var isActive = country.classed('highlight');
            d3.selectAll('.country').classed('highlight', false);
            country.classed('highlight', !isActive);

            var Ttext = '<p>No data</p>';
            if(d.properties.id != undefined){
                Ttext = `
                <p>Name: ${d.properties.name}</p>
                <p>Date: ${d.properties.date}</p>
				<p>Cases: ${d.properties.cases.toLocaleString()}</p>
				<p>Active Cases: ${d.properties.activeCases.toLocaleString()}</p> 
                <p>Recovered: ${d.properties.recovered.toLocaleString()}</p>
                <p>Deaths: ${d.properties.deaths.toLocaleString()}</p>
                `            
            }

            var tooltip = d3.select('.tooltip');
            tooltip
                .style('opacity', 1)
                .style('left', ( d3.event.pageX - tooltip.node().offsetWidth / 5 ) + 'px' )
                .style('top', ( d3.event.pageY - tooltip.node().offsetHeight/2 + 10 ) + 'px')
                .style('color', 'white')
                .html(Ttext)
        }

        function hideTooltip(d) {
            d3.select('.tooltip')
                .style('opacity', 0);
        }

        

    });
}    

// ----------------------------------------- Format country data ----------------------------------------- 

function formatAllData(data, dateInput) {

    var countrycode = {
        "afghanistan": "004",
        "aland_islands": "248",
        "albania": "008",
        "algeria": "012",
        "samoa": "882",
        "andorra": "020",
        "angola": "024",
        "anguilla": "660",
        "antarctica": "010",
        "antigua_and_barbuda": "028",
        "argentina": "032",
        "armenia": "051",
        "aruba": "533",
        "australia": "036",
        "austria": "040",
        "azerbaijan": "031",
        "bahamas": "044",
        "bahrain": "048",
        "bangladesh": "050",
        "barbados": "052",
        "belarus": "112",
        "belgium": "056",
        "belize": "084",
        "benin": "204",
        "bermuda": "060",
        "bhutan": "064",
        "bolivia": "068",
        "bonaire": "535",
        "bosnia_and_herzegovina": "070",
        "botswana": "072",
        "bouvet_island": "074",
        "brazil": "076",
        "british_indian_ocean_territory": "086",
        "brunei": "096",
        "bulgaria": "100",
        "burkina_faso": "854",
        "burundi": "108",
        "cabo_verde": "132",
        "cambodia": "116",
        "cameroon": "120",
        "canada": "124",
        "cayman_islands": "136",
        "central_african_republic": "140",
        "chad": "148",
        "chile": "152",
        "china": "156",
        "christmas_island": "162",
        "cocos_(Keeling)_islands": "166",
        "colombia": "170",
        "comoros": "174",
        // "congo_(kinshasa)": "180",
        "congo_(brazzaville)": "180",
        "cook": "184",
        "costa_rica": "188",
        "cote_divoire": "384",
        "croatia": "191",
        "cuba": "192",
        "curacao": "531",
        "cyprus": "196",
        "czechia": "203",
        "denmark": "208",
        "djibouti": "262",
        "dominica": "212",
        "dominican_republic": "214",
        "ecuador": "218",
        "egypt": "818",
        "el_salvador": "222",
        "equatorial_guinea": "226",
        "eritrea": "232",
        "estonia": "233",
        "eswatini": "748",
        "ethiopia": "231",
        "falkland_islands_(malvinas)": "238",
        "faroe_islands": "234",
        "fiji": "242",
        "finland": "246",
        "france": "250",
        "french_guiana": "254",
        "french_polynesia": "258",
        "french_southern_territories": "260",
        "gabon": "266",
        "gambia": "270",
        "georgia": "268",
        "germany": "276",
        "ghana": "288",
        "gibraltar": "292",
        "greece": "300",
        "greenland": "304",
        "grenada": "308",
        "guadeloupe": "312",
        "guam": "316",
        "guatemala": "320",
        "guernsey": "831",
        "guinea": "324",
        "guinea-bissau": "624",
        "guyana": "328",
        "haiti": "332",
        "heard": "334",
        "holy_see": "336",
        "honduras": "340",
        "hong_kong": "344",
        "hungary": "348",
        "iceland": "352",
        "india": "356",
        "indonesia": "360",
        "iran": "364",
        "iraq": "368",
        "ireland": "372",
        "isle_of_man": "833",
        "israel": "376",
        "italy": "380",
        "jamaica": "388",
        "japan": "392",
        "jersey": "832",
        "jordan": "400",
        "kazakhstan": "398",
        "kenya": "404",
        "kiribati": "296",
        "korea,_south": "410",
        "kuwait": "414",
        "kyrgyzstan": "417",
        "laos": "418",
        "latvia": "428",
        "lebanon": "422",
        "lesotho": "426",
        "liberia": "430",
        "libya": "434",
        "liechtenstein": "438",
        "lithuania": "440",
        "luxembourg": "442",
        "macau": "446",
        "madagascar": "450",
        "malawi": "454",
        "malaysia": "458",
        "maldives": "462",
        "mali": "466",
        "malta": "470",
        "marshall": "584",
        "martinique": "474",
        "mauritania": "478",
        "mauritius": "480",
        "mayotte": "175",
        "mexico": "484",
        "micronesia": "583",
        "moldova": "498",
        "monaco": "492",
        "mongolia": "496",
        "montenegro": "499",
        "montserrat": "500",
        "morocco": "504",
        "mozambique": "508",
        "burma": "104",
        "namibia": "516",
        "nauru": "520",
        "nepal": "524",
        "netherlands": "528",
        "new_caledonia": "540",
        "new_zealand": "554",
        "nicaragua": "558",
        "niger": "562",
        "nigeria": "566",
        "niue": "570",
        "norfolk": "574",
        "north_macedonia": "807",
        "northern_mariana_islands": "580",
        "norway": "578",
        "oman": "512",
        "pakistan": "586",
        "palau": "585",
        "palestine": "275",
        "panama": "591",
        "papua_new_guinea": "598",
        "paraguay": "600",
        "peru": "604",
        "philippines": "608",
        "pitcairn": "612",
        "poland": "616",
        "portugal": "620",
        "puerto_rico": "630",
        "qatar": "634",
        "réunion": "638",
        "romania": "642",
        "russia": "643",
        "rwanda": "646",
        "saint_barthelemy": "652",
        "st_helena": "654",
        "saint_kitts_and_nevis": "659",
        "saint_lucia": "662",
        "st_martin": "663",
        "saint_pierre_and_miquelon": "666",
        "saint_vincent_and_the_grenadines": "670",
        "san_marino": "674",
        "sao_tome_and_principe": "678",
        "saudi_arabia": "682",
        "senegal": "686",
        "serbia": "688",
        "seychelles": "690",
        "sierra_leone": "694",
        "singapore": "702",
        "sint_maarten": "534",
        "slovakia": "703",
        "slovenia": "705",
        "solomon_islands": "090",
        "somalia": "706",
        "south_africa": "710",
        "south_georgia_and_the_south_sandwich_islands": "239",
        "south_sudan": "728",
        "spain": "724",
        "sri_lanka": "144",
        "sudan": "729",
        "suriname": "740",
        "svalbard_and_jan_mayen": "744",
        "sweden": "752",
        "switzerland": "756",
        "syria": "760",
        "taiwan*": "158",
        "tajikistan": "762",
        "tanzania": "834",
        "thailand": "764",
        "timor-leste": "626",
        "togo": "768",
        "tokelau": "772",
        "tonga": "776",
        "trinidad_and_tobago": "780",
        "tunisia": "788",
        "turkey": "792",
        "turkmenistan": "795",
        "turks_and_caicos_islands": "796",
        "tuvalu": "798",
        "uganda": "800",
        "ukraine": "804",
        "united_arab_emirates": "784",
        "united_kingdom": "826",
        "us": "840",
        "united_states_minor_outlying_islands": "581",
        "uruguay": "858",
        "uzbekistan": "860",
        "vanuatu": "548",
        "venezuela": "862",
        "vietnam": "704",
        "virgin_islands_(british)": "092",
        "virgin_islands": "850",
        "wallis_and_futuna": "876",
        "western_sahara": "732",
        "yemen": "887",
        "zambia": "894",
        "zimbabwe": "716"
    }
        
    var countries = data['dates'][dateInput]['countries']
    var c = Object.keys(countries);
    var ct = []
    

    for(var i = 0; i< c.length; i++){
        // console.log(countries[c[i]]['id'])
        ct[i] = {
            name: c[i],
            id: countrycode[countries[c[i]]['id']],
            date: countries[c[i]]['date'],
			activeCases: (countries[c[i]]['today_confirmed']-(countries[c[i]]['today_recovered']+countries[c[i]]['today_deaths'])),
            cases: countries[c[i]]['today_confirmed'],
            recovered: countries[c[i]]['today_recovered'],
            deaths: countries[c[i]]['today_deaths']
        }
    }
    
    return ct;

}

// ----------------------------------------- Format total data ----------------------------------------- 

function totalData(data){

    var tt = data['total']
    var t = {
        'date': tt['date'],
        'cases': tt['today_confirmed'],
        'newCases': tt['today_new_confirmed'],
        'deaths': tt['today_deaths'],
        'newDeaths': tt['today_new_deaths'],
        'recovered': tt['today_recovered'],
        'newRecovered': tt['today_new_recovered'],
        'lastUpdated': data['updated_at'] 
    }
    return t;
}

