// global
var chosen_xaxis = "Sugars";
var chosen_yaxis = "Calories";
var bev_Type_Filter = "Classic Espresso Drinks";
var bevFilter = "";
var X_Axis_Filter = "Sugars";
var Y_Axis_Filter = "Calories";
var global_data = [];


$(document).ready(function() {
    readData();

    //event listener
    $(window).resize(function() {
        makePlot();
    });

    //event listener
    $("#selectButton0").change(function() {
        bev_Type_Filter = $("#selectButton0").val();
        buildOtherFilters();
        makePlot();
    });

    $("#selectButton").change(function() {
        bevFilter = $("#selectButton").val();
        makePlot();
    });

    //event listener
    $("#selectButton1").change(function() {
        X_Axis_Filter = $("#selectButton1").val();
        $("#x_title").text(X_Axis_Filter);
        makePlot();
    });

    //event listener
    $("#selectButton2").change(function() {
        Y_Axis_Filter = $("#selectButton2").val();
        $("#y_title").text(Y_Axis_Filter);
        makePlot();
    });

});

function readData() {
    d3.csv("static/data/starbucks_drinks.csv").then(function(data) {
        global_data = data;
        buildBevTypeFilter();
        buildOtherFilters();
        makePlot();
    }).catch(function(error) {
        console.log(error);
    });
}

function buildBevTypeFilter() {

    var allBevType = global_data.map(x => x.Beverage_category);
    var uniqueNames0 = [...new Set(allBevType)];
    uniqueNames0 = uniqueNames0.sort();

    $("#selectButton0").empty();
    d3.select("#selectButton0")
        .selectAll('option')
        .data(uniqueNames0)
        .enter()
        .append('option')
        .text(function(d) { return d; }) // text showed in the menu
        .attr("value", function(d) { return d; }) // corresponding value returned by the button
    $("#selectButton0").val(bev_Type_Filter);
}

function buildOtherFilters() {

    var currBevType = $("#selectButton0").val();
    var globalDataFiltered = global_data.filter(x => x.Beverage_category == currBevType);
    var allBevs = globalDataFiltered.map(x => x.Beverage_prep);
    var uniqueNames = [...new Set(allBevs)];
    uniqueNames = uniqueNames.sort();
    bevFilter = uniqueNames[0];
    var allVars = ["Calories", "Total_Fat", "Trans_Fat", "Saturated_Fat", "Sodium", "Total_Carbohydrates",
        "Cholesterol", "Dietary_Fiber", "Sugars", "Protein", "Vitamin_A", "Vitamin_C", "Calcium", "Iron", "Caffeine"
    ]

    $("#selectButton").empty();
    d3.select("#selectButton")
        .selectAll('option')
        .data(uniqueNames)
        .enter()
        .append('option')
        .text(function(d) { return d; }) // text showed in the menu
        .attr("value", function(d) { return d; }) // corresponding value returned by the button
    $("#selectButton").val(bevFilter);


    $("#selectButton1").empty();
    d3.select("#selectButton1")
        .selectAll('option')
        .data(allVars)
        .enter()
        .append('option')
        .text(function(d) { return d; }) // text showed in the menu
        .attr("value", function(d) { return d; }) // corresponding value returned by the button
    $("#selectButton1").val(X_Axis_Filter);

    $("#selectButton2").empty();
    d3.select("#selectButton2")
        .selectAll('option')
        .data(allVars)
        .enter()
        .append('option')
        .text(function(d) { return d; }) // text showed in the menu
        .attr("value", function(d) { return d; }) // corresponding value returned by the button
    $("#selectButton2").val(Y_Axis_Filter);

    $("#x_title").text(X_Axis_Filter);
    $("#y_title").text(Y_Axis_Filter);
}

function makePlot() {


    $("#scatter").empty();

    var svgWidth = window.innerWidth - 40;
    var svgHeight = 600;

    var margin = {
        top: 20,
        right: 40,
        bottom: 100,
        left: 80
    };

    var chart_width = svgWidth - margin.left - margin.right;
    var chart_height = svgHeight - margin.top - margin.bottom;


    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .classed("chart", true);

    var chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var global_data_filter = global_data.filter(x => (x.Beverage_category === bev_Type_Filter) && (x.Beverage_prep === bevFilter));
    global_data_filter.forEach(function(row) {
        row.Calories = +row.Calories;
        row.Cholesterol = +row.Cholesterol;
        row.Sugars = +row.Sugars;
        row.Sodium = +row.Sodium;
        row.Calcium = +row.Calcium;
        row.Total_Fat = +row.Total_Fat;
        row.Trans_Fat = +row.Trans_Fat;
        row.Saturated_Fat = +row.Saturated_Fat;
        row.Total_Carbohydrates = +row.Total_Carbohydrates;
        row.Dietary_Fiber = +row.Dietary_Fiber;
        row.Protein = +row.Protein;
        row.Vitamin_A = +row.Vitamin_A;
        row.Vitamin_C = +row.Vitamin_C;
        row.Iron = +row.Iron;
        row.Caffeine = +row.Caffeine;
    });

    var xScale = createXScale(global_data_filter, chart_width);
    var yScale = createYScale(global_data_filter, chart_height);

    var leftAxis = d3.axisLeft(yScale);
    var bottomAxis = d3.axisBottom(xScale);

    var xAxis = chart.append("g")
        .attr("transform", `translate(0, ${chart_height})`)
        .call(bottomAxis);

    var yAxis = chart.append("g")
        .call(leftAxis);

    var circlesGroup = chart.append("g")
        .selectAll("circle")
        .data(global_data_filter)
        .enter()
        .append("circle")
        .style("opacity", 0.5)
        .attr("stroke-width", "1")
        .classed("stateCircle", true);


    chart.selectAll("circle")
        .transition()
        .duration(500)
        .attr("cx", d => xScale(d[X_Axis_Filter]))
        .attr("cy", d => yScale(d[Y_Axis_Filter]))
        .attr("r", "15")
        .style("opacity", 0.5)
        .delay(function(d, i) { return i * 10 });

    var xlabel = "";
    if (X_Axis_Filter == "Sugars") {
        xlabel = "Sugars (g)";
    } else if (X_Axis_Filter == "Sodium") {
        xlabel = "Sodium (mg)";
    } else if (X_Axis_Filter == "Calories") {
        xlabel = "Calories";
    } else if (X_Axis_Filter == "Cholesterol") {
        xlabel = "Cholesterol (mg)";
    } else if (X_Axis_Filter == "Total_Fat") {
        xlabel = "Total Fat (g)";
    } else if (X_Axis_Filter == "Trans_Fat") {
        xlabel = "Trans Fat (g)";
    } else if (X_Axis_Filter == "Saturated_Fat") {
        xlabel = "Saturated Fat (g)";
    } else if (X_Axis_Filter == "Total_Carbohydrates") {
        xlabel = "Total Carbohydrates (g)";
    } else if (X_Axis_Filter == "Dietary_Fiber") {
        xlabel = "Dietary Fiber (g)";
    } else if (X_Axis_Filter == "Protein") {
        xlabel = "Protein (g)";
    } else if (X_Axis_Filter == "Vitamin_A") {
        xlabel = "Vitamin A (%DV)";
    } else if (X_Axis_Filter == "Vitamin_C") {
        xlabel = "Vitamin C (%DV)";
    } else if (X_Axis_Filter == "Iron") {
        xlabel = "Iron (%DV)";
    } else if (X_Axis_Filter == "Caffeine") {
        xlabel = "Caffeine (mg)";
    } else {
        xlabel = "Calcium (% DV)";
    }

    var ylabel = "";
    if (Y_Axis_Filter == "Sugars") {
        ylabel = "Sugars (g)";
    } else if (Y_Axis_Filter == "Sodium") {
        ylabel = "Sodium (mg)";
    } else if (Y_Axis_Filter == "Calories") {
        ylabel = "Calories";
    } else if (Y_Axis_Filter == "Cholesterol") {
        ylabel = "Cholesterol (mg)";
    } else if (Y_Axis_Filter == "Total_Fat") {
        ylabel = "Total Fat (g)";
    } else if (Y_Axis_Filter == "Trans_Fat") {
        ylabel = "Trans Fat (g)";
    } else if (Y_Axis_Filter == "Saturated_Fat") {
        ylabel = "Saturated Fat (g)";
    } else if (Y_Axis_Filter == "Total_Carbohydrates") {
        ylabel = "Total Carbohydrates (g)";
    } else if (Y_Axis_Filter == "Dietary_Fiber") {
        ylabel = "Dietary Fiber (g)";
    } else if (Y_Axis_Filter == "Protein") {
        ylabel = "Protein (g)";
    } else if (Y_Axis_Filter == "Vitamin_A") {
        ylabel = "Vitamin A (%DV)";
    } else if (Y_Axis_Filter == "Vitamin_C") {
        ylabel = "Vitamin C (%DV)";
    } else if (Y_Axis_Filter == "Iron") {
        ylabel = "Iron (%DV)";
    } else if (choseY_Axis_Filtern_yaxis == "Caffeine") {
        ylabel = "Caffeine (mg)";
    } else {
        ylabel = "Calcium (% DV)";
    }


    chart.append("text")
        .attr("transform", `translate(${chart_width / 2}, ${chart_height + margin.top + 30})`)
        .attr("class", "axisText active")
        .attr("id", X_Axis_Filter) // new, create id to identify text
        .text(xlabel)
        .style("font-size", "20px")
        .style("font-weight", "bold")
    $("#selectButton1").change(function() {

        xScale = createXScale(global_data_filter, chart_width);
        bottomAxis = d3.axisBottom(xScale);
        xAxis = createXAxis(xAxis, bottomAxis);
        circlesGroup = updateCircles(circlesGroup, xScale, yScale);
        circlesGroup = createTooltip(circlesGroup);
        d3.select(this).classed("inactive", false);
        d3.select(this).classed("active", true);
    });


    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 0)
        .attr("x", 0 - (chart_height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText active")
        .attr("id", Y_Axis_Filter) // new, create id to identify text
        .text(ylabel)
        .style("font-size", "20px")
        .style("font-weight", "bold")
    $("#selectButton2").change(function() {

        yScale = createYScale(global_data_filter, chart_height);

        leftAxis = d3.axisLeft(yScale);
        yAxis = createYAxis(yAxis, leftAxis);
        circlesGroup = updateCircles(circlesGroup, xScale, yScale);
        circlesGroup = createTooltip(circlesGroup);

        d3.select(this).classed("inactive", false);
        d3.select(this).classed("active", true);
    });

    circlesGroup = createTooltip(circlesGroup);
}

function createXScale(data, chart_width) {
    var xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[X_Axis_Filter]))
        .range([0, chart_width]);

    return xScale;
}


function createXAxis(xAxis, bottomAxis) {
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function createYScale(data, chart_height) {
    var yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[Y_Axis_Filter]))
        .range([chart_height, 0]);

    return yScale;
}

function createYAxis(yAxis, leftAxis) {
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

function updateCircles(circlesGroup, xScale, yScale) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => xScale(d[X_Axis_Filter]))
        .attr("cy", d => yScale(d[Y_Axis_Filter]));
    return circlesGroup;
}

function createTooltip(circlesGroup) {
    var xlabel = "";
    if (X_Axis_Filter == "Sugars") {
        xlabel = "Sugars (g)";
    } else if (X_Axis_Filter == "Sodium") {
        xlabel = "Sodium (mg)";
    } else if (X_Axis_Filter == "Calories") {
        xlabel = "Calories";
    } else if (X_Axis_Filter == "Cholesterol") {
        xlabel = "Cholesterol (mg)";
    } else if (X_Axis_Filter == "Total_Fat") {
        xlabel = "Total Fat (g)";
    } else if (X_Axis_Filter == "Trans_Fat") {
        xlabel = "Trans Fat (g)";
    } else if (X_Axis_Filter == "Saturated_Fat") {
        xlabel = "Saturated Fat (g)";
    } else if (X_Axis_Filter == "Total_Carbohydrates") {
        xlabel = "Total Carbohydrates (g)";
    } else if (X_Axis_Filter == "Dietary_Fiber") {
        xlabel = "Dietary Fiber (g)";
    } else if (X_Axis_Filter == "Protein") {
        xlabel = "Protein (g)";
    } else if (X_Axis_Filter == "Vitamin_A") {
        xlabel = "Vitamin A (%DV)";
    } else if (X_Axis_Filter == "Vitamin_C") {
        xlabel = "Vitamin C (%DV)";
    } else if (X_Axis_Filter == "Iron") {
        xlabel = "Iron (%DV)";
    } else if (X_Axis_Filter == "Caffeine") {
        xlabel = "Caffeine (mg)";
    } else {
        xlabel = "Calcium (% DV)";
    }

    var ylabel = "";
    if (Y_Axis_Filter == "Sugars") {
        ylabel = "Sugars (g)";
    } else if (Y_Axis_Filter == "Sodium") {
        ylabel = "Sodium (mg)";
    } else if (Y_Axis_Filter == "Calories") {
        ylabel = "Calories";
    } else if (Y_Axis_Filter == "Cholesterol") {
        ylabel = "Cholesterol (mg)";
    } else if (Y_Axis_Filter == "Total_Fat") {
        ylabel = "Total Fat (g)";
    } else if (Y_Axis_Filter == "Trans_Fat") {
        ylabel = "Trans Fat (g)";
    } else if (Y_Axis_Filter == "Saturated_Fat") {
        ylabel = "Saturated Fat (g)";
    } else if (Y_Axis_Filter == "Total_Carbohydrates") {
        ylabel = "Total Carbohydrates (g)";
    } else if (Y_Axis_Filter == "Dietary_Fiber") {
        ylabel = "Dietary Fiber (g)";
    } else if (Y_Axis_Filter == "Protein") {
        ylabel = "Protein (g)";
    } else if (Y_Axis_Filter == "Vitamin_A") {
        ylabel = "Vitamin A (%DV)";
    } else if (Y_Axis_Filter == "Vitamin_C") {
        ylabel = "Vitamin C (%DV)";
    } else if (Y_Axis_Filter == "Iron") {
        ylabel = "Iron (%DV)";
    } else if (Y_Axis_Filter == "Caffeine") {
        ylabel = "Caffeine (mg)";
    } else {
        ylabel = "Calcium (% DV)";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([180, -60])
        .html(function(d) {
            return (`<strong>${d.Beverage}</strong><hr><strong>${xlabel}: ${d[X_Axis_Filter]}</strong><hr><strong>${ylabel}: ${d[Y_Axis_Filter]}</strong>`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(event, d) {
        toolTip.show(d, this);

        d3.select(this)
            .transition()
            .duration(1000)
            .attr("r", 50);
    })

    .on("mouseout", function(event, d) {
        toolTip.hide(d);

        d3.select(this)
            .transition()
            .duration(1000)
            .attr("r", 15);
    });

    return circlesGroup; // this is important
}