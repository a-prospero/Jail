var svgWidth = 800;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  
// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "state_pop_13";
var chosenYAxis = "inmate_pop_13";

// function used for updating x-scale var upon click on axis label
function xScale(jailData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(jailData, d => d[chosenXAxis]) * 0,
      d3.max(jailData, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

  return xLinearScale;

}
function yScale(jailData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(jailData, d => d[chosenYAxis]) * 0,
        d3.max(jailData, d => d[chosenYAxis]) * 1.05
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating the circles location and x axix scale 
// with a transition to selected label data
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating the circles location and y axix scale 
// with a transition to selected label data
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}

// function used for updating the state abbreviation data location on the  
// x axis with a transition to selected label data
function renderXCirclesText(TextGroup, newXScale, chosenXAxis) {

    TextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));
  
    return TextGroup;
  }
// function used for updating the state abbreviation text data location on the  
// y axis with a transition to selected label data
function renderYCirclesText(TextGroup, newYScale, chosenYAxis) {

    TextGroup.transition()
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return TextGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var labelx;
  var labely;
  var labelposition = [80, -60]

  if (chosenXAxis === "state_pop_13") {
    labelx = "2013 State Population:";
  }
  else if (chosenXAxis === "state_pop_14") {
    labelx = "2014 State Population:";
    labelposition = [80, -60];
  }
  else {
      labelx = "state_pop_14:";
      labelposition = [80, -60];
  }
  if (chosenYAxis === "inmate_pop_14") {
    labely = "2014 Inmate Population";
  }
  else if (chosenYAxis === "inmate_pop_13") {
    labely = "2013 Inmate Population";
  }
  else {
      labely = "inmate_pop_14";
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset(labelposition)
    .html(function(d) {
      return (`${d.state}<br>${labelx} ${d[chosenXAxis]}<br>${labely} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  // on mouseover event to highlight the chart circle selected
  circlesGroup.on("mouseover", function(data) {
    d3.select(this)
      .transition()
      .duration(600)
      .attr("r", 20)
      toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      d3.select(this)
          .transition()
          .duration(600)
          .attr("r", 12)
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("../Resources/prison_custody_by_state.csv").then(function(jailData) {
  jailData.state_pop_14 = jailData["state_pop_14"]
console.log(jailData)
  // parse data
  jailData.forEach(function(data) {
    data.state_pop_13 = +data.state_pop_13;
    data.state_pop_14 = +data.state_pop_14;
    data.inmate_pop_13 = +data.inmate_pop_13;
    data.inmate_pop_14 = +data.inmate_pop_14;
  });

  // xLinearScale and yLinearScale functions from above 
  var xLinearScale = xScale(jailData, chosenXAxis);
  var yLinearScale = yScale(jailData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var dataCircles = chartGroup.selectAll("circlesGroup")
    .data(jailData)
    .enter()
    var circlesGroup = dataCircles
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "12")
    .attr("fill", "lightblue")
    .attr("opacity", ".6")
    .classed("stateCircle", true);

  // append initial circles text
  var TextGroup= dataCircles
    .append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text(d => d.state)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .style("fill", "black")
    .attr("opacity", ".7")
    .classed("stateText", true);

  // Create group for the 3 x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "state_pop_13") // value to grab for event listener
    .classed("active", true)
    .text("2013 State Population");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "state_pop_14") // value to grab for event listener
    .classed("inactive", true)
    .text("2014 State population");

//   var incomeLabel = xlabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 60)
//     .attr("value", "income") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Household Income (Median)");
  
  // Create group for the 3 y-axis labels
  var ylabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)")

//   var obeseLabel = ylabelsGroup.append("text")
//     .attr("y", 10 - margin.left)
//     .attr("x", 0 - (height / 2))
//     .attr("dy", "1em")
//     .attr("value", "inmate_pop_13") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Obese (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 30 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "inmate_pop_14") // value to grab for event listener
    .classed("inactive", true)
    .text("2014 Inmate Population");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 50 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "inmate_pop_13") // value to grab for event listener
    .classed("active", true)
    .text("2013 Inmate Population");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(jailData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
        TextGroup = renderXCirclesText(TextGroup, xLinearScale, chosenXAxis);
        
        // updates tooltips with new info based on x axis selection
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "state_pop_13") {
         povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        //   incomeLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        }
        else if (chosenXAxis === "state_pop_14") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        //   incomeLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        //   incomeLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        }
      }
    });
    // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
      chosenYAxis = value;

      // console.log(chosenYAxis)

      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(jailData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);
      TextGroup = renderYCirclesText(TextGroup, yLinearScale, chosenYAxis)
      // updates circles with new y values
      circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips with new info based on y axis selection
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "inmate_pop_13") {
    //    obeseLabel
    //       .classed("active", true)
    //       .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "inmate_pop_14") {
        // obeseLabel
        //   .classed("active", false)
        //   .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        // obeseLabel
        //   .classed("active", false)
        //   .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
  console.log(error);
});