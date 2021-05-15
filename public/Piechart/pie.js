// ----------------------------------------- Default pie chart ----------------------------------------- 

// Get date and attribute and create pie chart
var dateInput = $("#dateInput").val();
var attribute = "cases";
$('#mainTitleDate').text(dateInput)
piechart(dateInput, attribute);


// ----------------------------------------- Pie chart with attr and date selected by user ----------------------------------------- 

// Load button
$("#refresh").click(function(){
	$("#refresh").text("Loading...")
    // Get date and attribute and create pie chart
    dateInput = $("#dateInput").val();
    var radio = document.querySelectorAll(".radio");
    for(var i=0;i<radio.length;i++){
        if(radio[i].checked){
            attribute = radio[i].value;
        }
    }
    piechart(dateInput, attribute);
});

// ----------------------------------------- Pie chart function ----------------------------------------- 

function piechart(dateInput, attribute){
    
    $('#mainTitleDate').text(dateInput)
    
    d3.queue()
    .defer(d3.json, 'https://api.covid19tracking.narrativa.com/api/' + dateInput)
    .awaitAll(function(error, data) {

        // console.log(error, data)

        // Display alert message if error or no data
        
        if (error || !(data)){
            alertMessage();
        };

        // Data arrays

        var coroArr = formatAllData(data, dateInput);
        var totData = totalData(data[0]);

        AddTotalData(totData);


        //Tooltips

        var tooltip = d3.select('body')
                        .append('div')
                            .classed('tooltip', true);

        // SVG width and height

        var width = 400;
        var height = 400;
        
        var svg = d3.select('#pie')
                    .attr('width', width)
                    .attr('height', height);

                    

                            
        // Pie chart scale

        var colorScale = d3.scaleOrdinal()
                        .domain(coroArr)
                        .range(["#00876c",
                                "#3d9c73",
                                "#63b179",
                                "#88c580",
                                "#aed987",
                                "#d6ec91",
                                "#ffff9d",
                                "#fee17e",
                                "#fcc267",
                                "#f7a258",
                                "#ef8250",
                                "#e4604e",
                                "#d43d51"]);

        
        // Pie chart position
        svg.append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`)
        .classed('chart', true);


        // Total data position
        svg.append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`)
        .classed('totData', true);


        var tot = d3.select('.totData')
    
        tot
            .append('text')
                .text(`${attribute.charAt(0).toUpperCase() + attribute.slice(1)} Worldwide`)
                .attr('text-anchor', 'middle')
                .attr('dy', '-20px')
                .style('font-weight', '500')
                .style('fill','white')
		        .style('font-size', '0.8em')
                .classed('totTitle', true)

        tot
        .append('text')
            .text(`${totData[attribute].toLocaleString()}`)
            .attr('text-anchor', 'middle')
            .attr('dy', '15px')
            .style('font-size', '1.5em')
            .style('fill','white')
            .classed('totAttr', true)
                
        var newAt;
        // attribute == 'cases'? newAt = 'newCases' : ( attribute == 'deaths' ? newAt = 'newDeaths' : newAt = 'newRecovered');
		
		newAt = {
			cases:'newCases',
			deaths:'newDeaths',
			recovered:'newRecovered',
			activeCases: 'newActiveCases'
		}
        
        tot
        .append('text')
            .text(`${(parseInt(totData[newAt[attribute]])<0?"-":"+") + totData[newAt[attribute]].toLocaleString()}`)
            .attr('text-anchor', 'middle')
            .attr('dy', '35px')
            .style('font-size', '0.6em')
            .style('fill', 'darkgrey')
            .classed('totNewAttr', true)

            


        // Refresh button
        d3.select('#refresh')
          .on('click', function(){
              makePie(coroArr, attribute);
          });

        makePie(coroArr, attribute);

        function makePie(coroArr, attribute){

            // Change title
            d3.select('#pieTitle')
            .text(`Piechart - ${attribute.charAt(0).toUpperCase() + attribute.slice(1)} (${dateInput})`);
            
            // Arcs 
            var arcs = d3.pie()
            .value(d => d[attribute])
            .sort(function(a,b){
                if(a.name < b.name) return -1;
                else if (a.name > b.name) return 1;
                else return a[attribute] - b[attribute];
            })
            (coroArr);
        
            // Paths
            var path = d3.arc()
                        .outerRadius(width/2 - 10)
                        .innerRadius(100)
        
        
        
            // Update pattern
            var update = d3.select('.chart')
                            .selectAll('.arc')
                            .data(arcs);
        
            update
                .exit()
                .remove();
        
            update
                .enter()
                .append('path')
                    .classed('arc', true)

                .merge(update)
                    .attr('fill', d => colorScale(d.data.name))
                    .attr('stroke', '#202124')
                    .attr("stroke-width", "0")
                    .attr('d', path)
                    .on('mousemove', showTooltip)
                    .on('touchstart', showTooltip)
                    .on('mouseout', hideTooltip)
                    .on('touchend', hideTooltip);
        
            
            // Refresh btn 
            d3.select('#refresh').on('click', function(){
                
                // loadpage();
        
                d3.select('.totTitle').remove()
                d3.select('.totAttr').remove()
                d3.select('.totNewAttr').remove()
                d3.select('.totTitle')
                        .text(`${attribute.charAt(0).toUpperCase() + attribute.slice(1)} Worldwide`)
        
                d3.select('.totAttr')
                    .text(`${totData[attribute].toLocaleString()}`)
                        
                var newAt;
                // attribute == 'cases'? newAt = 'newCases' : ( attribute == 'deaths' ? newAt = 'newDeaths' : newAt = 'newRecovered');
                // // console.log(newAt)
				
				newAt = {
					cases:'newCases',
					deaths:'newDeaths',
					recovered:'newRecovered',
					activeCases: 'newActiveCases'
				}


                d3.select('.totNewAttr')
                    .text(`${(parseInt(totData[newAt[attribute]])<0?"-":"+") + totData[newAt[attribute]].toLocaleString()}`)
            
            });
        
            // Tooltip functions
        
            function showTooltip(d) {

                var arc = d3.select(this);
                var isActive = arc.classed('highlight');
                d3.selectAll('.arc').classed('highlight', false);
                arc.classed('highlight', !isActive);

                var Ttext = '<p>No data</p>';
                if(d.data != undefined){
                    Ttext =  `
                    <p>Name: ${d.data.name}</p>
                    <p>Date: ${d.data.date}</p>
                    <p>Cases: ${d.data.cases.toLocaleString()}</p>                    
					<p>Active Cases: ${d.data.activeCases.toLocaleString()}</p>
                    <p>Recovered: ${d.data.recovered.toLocaleString()}</p>
                    <p>Deaths: ${d.data.deaths.toLocaleString()}</p>
                    `     
                }
                var tooltip = d3.select('.tooltip');
                tooltip
                    .style('opacity', 1)
                    .style('left', ( d3.event.pageX - tooltip.node().offsetWidth/2) + 'px' )
                    .style('top', ( d3.event.pageY- tooltip.node().offsetHeight/2 - 80) + 'px')
                    .style('color', 'white')
                    .html(Ttext)

            }
        
            function hideTooltip(d) {
                d3.select('.tooltip')
                    .style('opacity', 0);
            }
        
        }
		
		$("#refresh").text("Refresh")	

    });
}
    
// ----------------------------------------- Format country data ----------------------------------------- 

function formatAllData(data, dateInput) {

    var countries = data[0]['dates'][dateInput]['countries']

    var c = Object.keys(countries);
    var ct = []

    for(var i = 0; i< c.length; i++){
        ct[i] = {
            name: c[i],
            date: countries[c[i]]['date'],
			activeCases: (countries[c[i]]['today_confirmed']-(countries[c[i]]['today_recovered']+countries[c[i]]['today_deaths'])),
            cases: countries[c[i]]['today_confirmed'],
            recovered: countries[c[i]]['today_recovered'],
            deaths: countries[c[i]]['today_deaths']
        }
    }
    return ct;
}
