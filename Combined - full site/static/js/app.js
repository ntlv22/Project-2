var censusData = ""
var starbucksData = ''

$(document).ready(function() {

    getData();

    $(window).resize(function() {
        getData();
    });

    $('#select-state').change(function() {
        getData();
    })
})


function getData() {
    var queryUrl = "static/data/Stores.geojson"
        // Perform a GET request to the query URL
    $.ajax({
        type: "GET",
        url: queryUrl,
        success: function(data_starb) {
            starbucksData = data_starb;
            d3.csv("../static/data/census_data.csv").then(function(data_c) {
                censusData = data_c;
                doingWork();
            })

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });

}

function getMedianIncome(demoData) {
    var total = 0;
    demoData.forEach(function(data) {
        if (data['Household Income'] > 0) {
            total += parseInt(data['Household Income']);
        }
    })
    return Math.round(total / demoData.length);
}

function getMedianAge(demoData) {
    var total = 0;
    demoData.forEach(function(data) {
        if (data['Median Age'] > 0) {
            total += parseInt(data['Median Age']);
        }
    })
    return Math.round(total / demoData.length);
}

function getTotalPopulation(demoData) {
    var totalPop = 0;
    demoData.forEach(function(data) {
        totalPop += parseInt(data.Population);
    })
    return totalPop;
}

function doingWork() {
    var stateSelection = $("#select-state").val();

    var demographicData = censusData.filter(x => x.State == stateSelection);

    var usLocations = []

    starbucksData.features.forEach(function(state) {
        if (state.properties.Country === "US") {
            usLocations.push(state);
        }
    })
    var starbucksLocData = usLocations.filter(x => x.properties['State/Province'] == stateSelection);
    var cityData = [];
    for (var i = 0; i < demographicData.length; i++) {
        var city = demographicData[i].City;
        if (!!cityData[city]) {
            continue;
        }

        var cityDemoData = demographicData.filter(x => x.City == city);

        var data = {};
        data.numStarbucks = starbucksLocData.filter(x => x.properties.City == city).length;
        if (data.numStarbucks === 0) {
            continue;
        }
        data.mediumIncome = getMedianIncome(cityDemoData);
        data.totalPopulation = getTotalPopulation(cityDemoData);
        data.medAge = getMedianAge(cityDemoData);
        data.city = city;

        if ((cityData.length > 0) & !(cityData.map(x => x.city).includes(city))) {
            cityData.push(data);
        } else if (cityData.length == 0) {
            cityData.push(data);
        }

    }

    showDemographics(cityData);
    makePlot(cityData);
    makePlot2(cityData);
}

function showDemographics(cityData) {
    var dataTable = cityData.sort(function(a, b) {
        return b.numStarbucks - a.numStarbucks
    })
    var cityTable = dataTable.map(x => x.city);

    var numStarbucksTable = dataTable.map(x => x.numStarbucks);

    var incomeTable = dataTable.map(x => x.mediumIncome);
    var ageTable = dataTable.map(x => x.medAge);

    var table = d3.select("#summary-table");
    var tbody = table.select("tbody");
    tbody.html("");
    var trow;
    for (var i = 0; i < 10; i++) {

        trow = tbody.append("tr");
        trow.append("td").text(cityTable[i]);
        trow.append("td").text(numStarbucksTable[i]);
        trow.append("td").text(incomeTable[i]);
        trow.append("td").text(ageTable[i]);

    }
}


function makePlot(cityData) {

    $("#chart").empty();

    var svgWidth = window.innerWidth / 2;
    var svgHeight = 500;

    var margin = {
        top: 20,
        right: 40,
        bottom: 60,
        left: 100
    };

    var chart_width = svgWidth - margin.left - margin.right;
    var chart_height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var xScale = d3.scaleLinear()
        .domain(d3.extent(cityData, d => d.numStarbucks))
        .range([0, chart_width]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(cityData, d => d.mediumIncome))
        .range([chart_height, 0]);

    var leftAxis = d3.axisLeft(yScale);
    var bottomAxis = d3.axisBottom(xScale);

    chartGroup.append("g")
        .attr("transform", `translate(0, ${chart_height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(cityData)
        .enter()
        .append("circle")
        .attr("class", "incomeGraph");

    chartGroup.selectAll("circle")
        .transition()
        .duration(2000)
        .attr("cx", d => xScale(d.numStarbucks))
        .attr("cy", d => yScale(d.mediumIncome))
        .attr("r", "8")
        .style("opacity", 1)
        .delay(function(d, i) { return i * 10 });

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([100, -80])
        .html(function(d) {
            return (`<strong>${d.city}<strong><hr><strong>Number of Starbucks: ${d.numStarbucks}</strong>`);
        });


    circlesGroup.call(toolTip);


    circlesGroup.on("mouseover", function(event, d) {
        toolTip.show(d, this);

        d3.select(this)
            .transition()
            .duration(1000)
            .attr("r", 10);
    })

    .on("mouseout", function(event, d) {
        toolTip.hide(d);

        d3.select(this)
            .transition()
            .duration(1000)
            .attr("r", 8);
    });

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (chart_height / 1.5))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Median Income");

    chartGroup.append("text")
        .attr("transform", `translate(${chart_width / 2.5}, ${chart_height + margin.top +30})`)
        .attr("class", "axisText")
        .text("Number of Starbucks");
}

function makePlot2(cityData) {
    $("#chart2").empty();

    var svgWidth = window.innerWidth / 2;
    var svgHeight = 500;

    var margin = {
        top: 20,
        right: 40,
        bottom: 60,
        left: 100
    };

    var chart_width = svgWidth - margin.left - margin.right;
    var chart_height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select("#chart2")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var xScale = d3.scaleLinear()
        .domain(d3.extent(cityData, d => d.numStarbucks))
        .range([0, chart_width]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(cityData, d => d.totalPopulation))
        .range([chart_height, 0]);

    var leftAxis = d3.axisLeft(yScale);
    var bottomAxis = d3.axisBottom(xScale);

    chartGroup.append("g")
        .attr("transform", `translate(0, ${chart_height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(cityData)
        .enter()
        .append("circle")
        .attr("class", "popGraph");

    chartGroup.selectAll("circle")
        .transition()
        .duration(2000)
        .attr("cx", d => xScale(d.numStarbucks))
        .attr("cy", d => yScale(d.totalPopulation))
        .attr("r", "8")
        .style("opacity", 1)
        .delay(function(d, i) { return i * 10 });

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([100, -80])
        .html(function(d) {
            return (`<strong>${d.city}<strong><hr><strong>Number of Starbucks: ${d.numStarbucks}</strong>`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(event, d) {
            toolTip.show(d, this);

            d3.select(this)
                .transition()
                .duration(1000)
                .attr("r", 10);
        })
        .on("mouseout", function(event, d) {
            toolTip.hide(d);

            d3.select(this)
                .transition()
                .duration(1000)
                .attr("r", 8);
        });
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (chart_height / 1.5))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Total Population");
    chartGroup.append("text")
        .attr("transform", `translate(${chart_width / 2.5}, ${chart_height + margin.top +30})`)
        .attr("class", "axisText")
        .text("Number of Starbucks");
}