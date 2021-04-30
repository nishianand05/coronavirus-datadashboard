// ----------------------------------------- Default Scat ----------------------------------------- 

// Get date and attribute and create Map
var dateInput = $("#dateInput").val();
$('#mainTitleDate').text(dateInput)
scatPolt(dateInput);



// ----------------------------------------- Scat and date selected by user ----------------------------------------- 

// Load button
$("#refresh").click(function(){
  $("#refresh").text("Loading...")
  dateInput = $("#dateInput").val();
  scatPolt(dateInput)

});

// ----------------------------------------- Scat function ----------------------------------------- 

function scatPolt(dateInput){
  
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
    var totData = totalData(data);


    AddTotalData(totData);

    //Tooltips

    var tooltip = d3.select('body')
    .append('div')
        .classed('tooltip', true);


    // SVG width and height
    var width = 1200;
    var height = 600;
    var padding = 100;
    
    var svg = d3.select('svg')
                .attr('width', width)
                .attr('height', height);

    // Set x-axis and y-axis 'g' with class

    svg.append('g')
        .attr('transform', `translate(0, ${height-padding})` )
        .attr('fill', 'white')
        .classed('x-axis', true);

    svg.append('g')
        .attr('transform', `translate(${padding}, 0)` )
        .attr('fill', 'white')
        .classed('y-axis', true);

    // Axis text

    svg.append('text')
        .text('Confirmed Cases')
        .attr('x', width / 2)
        .attr('y', height)
        .attr('dy', '-2.5em')
        .attr('text-anchor', 'middle')
        .attr('fill', 'burlywood');

    svg.append('text')
        .text('Deaths')
        .attr('transform', 'rotate(-90)')
        .attr('x', - height / 2)
        .attr('y', '2em')
        .attr('text-anchor', 'middle')
        .attr('fill', 'burlywood');


      // Refresh button
      d3.select('#refresh')
      .on('click', function(){
          drawScat(coroArr, dateInput);
      });
      
    drawScat(coroArr, dateInput);

    function drawScat(data, dateInput) {

      // Title
      d3.select('#scatTitle')
        .text(`Scatterplot - (${dateInput})`);

      // Scales

      var xScale = d3.scaleLinear()
                     .domain(d3.extent(data, d => d.cases))
                     .range([padding, width - padding]);

      var yScale = d3.scaleLinear()
                     .domain(d3.extent(data, d => d.deaths))
                     .range([height - padding, padding]);

      var fScale = d3.scaleLinear()
                     .domain(d3.extent(data, d => ((d.deaths/d.cases)*100)))
                     .range(['darkgreen', 'darkred'])


      var rScale = d3.scaleLinear()
                     .domain(d3.extent(data, d => d.recovered))
                     .range([5, 30]);



      // Axis
      d3.select('.x-axis')
          .call(d3.axisBottom(xScale)
                  .tickSize(-height + 2*padding)
                  .tickSizeOuter(2))
          .selectAll("text")
            .attr("dy", "2em")
            .attr('fill', 'white');

      d3.select('.y-axis')
          .call(d3.axisLeft(yScale)
                  .tickSize(-width + 2*padding)
                  .tickSizeOuter(2))
          .selectAll("text")
            .attr("x", "-8")
            .attr('fill', 'white');


      // Update pattern
      var update = svg.selectAll('circle')
                      .data(data, d => d.name);
                      
      update
        .exit()
        .transition()
          .duration(500)
          .attr('r', 0)
        .remove();

      update
        .enter()
        .append('circle')
          .on('mousemove touchmove', showTooltip)
          .on('mouseout touchend', hideTooltip)
          .attr('cx', d => xScale(d.cases))
          .attr('cy', d => yScale(d.deaths))
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
        .merge(update)
          .transition()
          .duration(500)
          .delay((d, i) => i * 5)
			.on('end', function(d,i,nodes){
			  if(i === nodes.length - 1){
				  $("#refresh").text("Refresh")	  
			  }})
            .attr('cx', d => xScale(d.cases))
            .attr('cy', d => yScale(d.deaths))
            .attr('fill', d => fScale((d.deaths/d.cases)*100))
            .attr('r', d => rScale(d.recovered));
    }

    function showTooltip(d) {
      var tooltip = d3.select('.tooltip');
      tooltip
          .style('opacity', 1)
          .style('left', ( d3.event.pageX - tooltip.node().offsetWidth/5) + 'px' )
          .style('top', ( d3.event.pageY - tooltip.node().offsetHeight/5 + 10) + 'px')
          .style('color', 'white')
          .html(`
             <p>Name: ${d.name}</p>
             <p>Date: ${d.date}</p>
             <p>Cases: ${d.cases.toLocaleString()}</p>
             <p>Recovered: ${d.recovered.toLocaleString()}</p>
             <p>Deaths: ${d.deaths.toLocaleString()}</p>             
             <p>Case Fatality Rate: ${((d.deaths/d.cases)*100).toFixed(2)}%</p>

          `)
    }

    function hideTooltip(d) {
      d3.select('.tooltip')
          .style('opacity', 0);
    }
	  
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
            cases: countries[c[i]]['today_confirmed'],
            recovered: countries[c[i]]['today_recovered'],
            deaths: countries[c[i]]['today_deaths']
        }
    }
    return ct;
}

// ----------------------------------------- Format total data ----------------------------------------- 

function totalData(data){

  var tt = data[0]['total']
  var t = {
      'date': tt['date'],
      'cases': tt['today_confirmed'],
      'newCases': tt['today_new_confirmed'],
      'deaths': tt['today_deaths'],
      'newDeaths': tt['today_new_deaths'],
      'recovered': tt['today_recovered'],
      'newRecovered': tt['today_new_recovered'],
      'lastUpdated': data[0]['updated_at'] 
  }
  return t;
}

