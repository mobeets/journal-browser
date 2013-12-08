var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 350 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;
var datafile = 'data.csv';

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

function cast_type(d) {
  d.count = +d.count;
  d.year = +d.year;
  return d;
}

function get_chart_div(month){
  return '#chart-' + month;
}
function get_detail_div(month){
  return '#detail-' + month;
}

var svgs = new Array();;
var all_data;

function update_chart(year, month) {
  svg = svgs[month];
  chart_div = get_chart_div(month);

  data = all_data.filter(function(d) { return d.year == year && d.month == month; });

  x.domain(data.map(function(d) { return d.i; }));
  y.domain([0, d3.max(data, function(d) { return d.count; })]);

  bars = svg.selectAll(".bar").data(data);

  bars.enter()
    .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.i); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.count); })
      .on('mouseover', function(d) {
        $(get_detail_div(month)).html(d.info);
      })
      .on('mouseout', function(d) {
        $(get_detail_div(month)).html('');
      })
      .attr("height", function(d) { return 0; })
    .transition().delay(function(d, i) { return i*10; }).duration(400)
      .attr("height", function(d) { return height - y(d.count); });

  bars.exit()
    .transition()
      .delay(function(d, i) { return i*10; })
      .duration(400)
      .attr("height", function(d) { return 0; })
      .remove();

  bars
    .transition()
    .delay(function(d, i) { return i*10; })
    .duration(400)
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.i); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.count); })
      .attr("height", function(d) { return height - y(d.count); });

}

function update_charts(year) {
  for (var month = 1; month <= 12; month++){
    update_chart(year, month);
  }
}

function init_charts(year) {
  // create svg elements for each month's chart
  for (var month = 1; month <= 12; month++){
    chart_div = get_chart_div(month);
    svgs[month] = d3.select(chart_div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }
}

function init(infile) {
  // load data and init charts to show first year
  first_year = $('#year-1').html();
  $('#year-1').addClass('active');
  d3.csv(infile, cast_type, function(error, data) {
    all_data = data;
    init_charts(first_year);
    update_charts(first_year);
  });
}

function UrlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
}

$(function() {

  // clicking on year updates data
  $(".year").click(function() {
    $(".year.active").removeClass('active');
    $(this).addClass('active');
    year = $(this).html();
    update_charts(year);
  });

  // load datafile
  if (UrlExists(datafile)){
    init(datafile);
  } else {
    console.log('ERROR loading file: ' + datafile);
  }

});
