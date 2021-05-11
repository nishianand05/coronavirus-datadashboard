// ----------------------------------------- Default Bar Chart ----------------------------------------- 

// Get date and attribute and create bar chart
var dateInput = $("#dateInput").val();
var attribute = "cases";
$('#mainTitleDate').text(dateInput)
barChart(dateInput, attribute);


// ----------------------------------------- Bar chart with attr and date selected by user ----------------------------------------- 

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
    barChart(dateInput, attribute);
});

// ----------------------------------------- Bar chart function ----------------------------------------- 


function barChart(dateInput, attribute){
    
    $('#mainTitleDate').text(dateInput)
    
    d3.queue()
    .defer(d3.json, 'https://api.covid19tracking.narrativa.com/api/' + dateInput)
    .awaitAll(function(error, data) {


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
        var width = 7000*data.length;
        var height = 500;
        var padding = 100;
        var numBars = coroArr.length;
        var barWidth = 10;

        var svg = d3.select('svg')
                    .attr('width', width)
                    .attr('height', height);
                    


        // x-axis and y-axis 
        svg.append('g')
            .attr('transform', 'translate(0, ' + (height - padding) + ')')
            .classed('x-axis', true);

        svg.append('g')
            .attr('transform', 'translate(' + (padding) + ',0)')
            .classed('y-axis', true);


        svg.append('text')
            .text('Countries ➝')
            .attr('x', padding+50)
            .attr('y', height+padding/2)
            .attr('dy', '-1.5em')
            .attr('fill', 'burlywood')
            .attr('text-anchor', 'middle');


        svg.append('text')
            .classed('yText', true)
            .text(`${attribute.charAt(0).toUpperCase() + attribute.slice(1)} ➝`)
            .attr('transform', 'rotate(-90)')
            .attr('x', -height/2)
            .attr('y', '2em')
            .attr('fill', 'burlywood')
            .attr('text-anchor', 'middle');

        
        // Scales 

        var yScale = d3.scaleLinear()
                .domain([0, d3.max(coroArr, d => d[attribute])])
                .range([height-padding, padding]);

        var xScale = d3.scaleBand()
                       .domain(coroArr.map(d => d.name))
                       .range([padding, width - padding])
                       .padding(0.05)


        // Calling scales on axis
        var xAxis = d3.axisBottom(xScale);

        d3.select('.x-axis')
          .call(xAxis.tickSize(-height + 2*padding).tickSizeOuter(0))
          .selectAll("text")
          .attr("y", 0)
          .attr("x", 9)
          .attr("dy", ".35em")
          .attr("transform", "rotate(90)")
          .attr('fill', 'white')
          .style("text-anchor", "start");
          
        var yAxis = d3.axisLeft(yScale);
        
        d3.select('.y-axis')
            .transition()
            .duration(1000)
            .call(yAxis.tickSize(-width + 2*padding).tickSizeOuter(0))
            .selectAll("text")
            .attr('fill', 'white')
            .attr('dx', '-0.5em')
                


        d3.select('#refresh').on('click', function(){
            makeBar(coroArr, attribute);
        });

        makeBar(coroArr, attribute);

        function makeBar(coroArr, attribute){

            // Change title
            d3.select('#rectTitle')
            .text(`Bar Chart - ${attribute.charAt(0).toUpperCase() + attribute.slice(1)} (${dateInput})`);
        
            var t = d3.transition()
                        .duration(800)
                        .ease(d3.easeBounceOut)
						
            
            var update = svg
                        .selectAll('rect')
                        .data(coroArr);

            update
                .exit()
                .transition(t)
                    .delay((d, i, nodes) => (nodes.length -i - 1) * 50)
                    .attr('y', height - padding)
                    .attr('height', 0)
                    .remove();

            // var fillVal = attribute == 'cases' ? '#e76f51' : ((attribute == 'deaths') ? '#9d0208' : '#2a9d8f'); 
            
			var fillVal = {
				activeCases: '#eb6600',
				cases: '#ba9d0b',
				deaths: '#ba0000',
				recovered: '#52b69a'
			}
			
			update
                .enter()
                .append('rect')
                    .attr('y', height-padding)
                    .attr('height', 0)
                    .on('mousemove', showTooltip)
                    .on('touchstart', showTooltip)
                    .on('mouseout', hideTooltip)
                    .on('touchend', hideTooltip)
                .merge(update)
                    .attr('x', d => xScale(d.name))
                    .attr('width', xScale.bandwidth())
                    .transition(t)
                    .delay((d, i) => i * 50)
			        	.on('end', function(d,i,nodes){
				         if(i === nodes.length - 1){
						  $("#refresh").text("Refresh")	  
						}})
                        .attr('fill', fillVal[attribute])
                        .attr('y', d => yScale(d[attribute]))
                        .attr('height', function(d) {
										var val = yScale(0) - yScale(d[attribute]); 
										if(val < 0){
											val = 0;
										}
									return val;
								})
						


                $("#refresh").on('click', function(){
                    d3.select('.yText').remove();
                    d3.select('.yText').text(`${attribute.charAt(0).toUpperCase() + attribute.slice(1)} ➝`);                    
                })

        }

        // Tooltip functions
    
        function showTooltip(d) {
            Ttext = `
            <p>Name: ${d.name}</p>
            <p>Date: ${d.date}</p>
            <p>Cases: ${d.cases.toLocaleString()}</p>            
			<p>Active Cases: ${d.activeCases.toLocaleString()}</p>
            <p>Recovered: ${d.recovered.toLocaleString()}</p>
            <p>Deaths: ${d.deaths.toLocaleString()}</p>
            `            
            var tooltip = d3.select('.tooltip');
            tooltip
                .style('opacity', 1)
                .style('left', ( d3.event.pageX - tooltip.node().offsetWidth / 5 ) + 'px' )
                .style('top', ( d3.event.pageY - tooltip.node().offsetHeight/2 + 100 ) + 'px')
                .style('color', 'white')
                .html(Ttext)
        }

        function hideTooltip(d) {
            d3.select('.tooltip')
                .style('opacity', 0);
        }
		
		// $("#refresh").text("Refresh")

    });
}

// ----------------------------------------- Format all data -----------------------------------------

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
