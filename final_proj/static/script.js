var width = 900;
var height = 600;
var xPadding = 30;
var yPadding = 20;
var num_attr = 3;
var trasitionTime = 1000;
var dataset = {
  'country_name' : [],
  'x' : [],
  'y' :[],
  'size' :[],
  'color' :[],
  'maxX' : 0,
  'maxY' : 0,
  'minX' : 987654321,
  'minY' : 987654321,
};
var selected_country = ["Korea, Rep.","Korea, Dem. People's Rep.", "Afghanistan", "United States", "Vietnam", "United Kingdom", "Sweden", "Japan", "Cuba", "China"];
var selectedIdList = {};
var scaleX = d3.scaleLog().domain([20, 80000]).range([xPadding, width-xPadding]);
var scaleY = d3.scaleLinear().domain([30, 85]).range([height - yPadding, yPadding]);
var scaleSize = d3.scaleSqrt().domain([1000, 2000000000]).range([5, 50]);
var playEvent = {};

var init = function (){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', window.location.origin + '/all-country', true);
  xhr.addEventListener("load", function (e){
    var docs  = JSON.parse(xhr.responseText);
    dataset['country_name'] = docs.map(function(ele){return ele['country_name'];});

    var svg = d3.select("#screen").append("svg");
    svg.attr("width", width).attr("height", height);

    var xAxis = d3.axisBottom(scaleX).ticks(20, ",.0f");
    var xAxisSpr = svg.append("g").call(xAxis).attr("transform", "translate(0,"+(height - yPadding)+")");
    var yAxis = d3.axisLeft(scaleY).ticks(20, ",.1f");
    var yAxisSpr = svg.append("g").call(yAxis).attr("transform", "translate("+(xPadding)+",0)");

    var elementEnter = svg.selectAll("circle").data(dataset['country_name']).enter();

    var circles = elementEnter.append("circle");
    circles.text(function(d){return d;})
    .attr("cx", 0)
    .attr("cy", height)
    .attr("r", "2px")
    .attr("fill", function (d, i){
      return "rgba("+Math.floor(Math.random()*255)+","
      +Math.floor(Math.random()*255)+","
      +Math.floor(Math.random()*255)+","
      +0.6+")";
    })
    //.attr("stroke", "orange")
    //.attr("stroke-width", "2px")
    .attr("display", filterGroup)
    .on("click", toggleLabelList);

    var labels = elementEnter.append("text");
    labels.text(filterLabel)
    .on("click", toggleLabelList)
    ;

  }); //xhr
  xhr.send(null);
} // init

var toggleLabelList = function(d, i){
  selectedIdList[i] = !selectedIdList[i];
  var svg = d3.select("#screen svg");
  var labels = svg.selectAll("svg>text")
  .text(function(d, i){
    if(selectedIdList[i])
      return dataset['country_name'][i];
    else
      return "";
  });
}

var filterGroup = function(d,i){
  if(dataset['country_name'][i].includes("&") ||
    dataset['country_name'][i].includes("countries") ||
    dataset['country_name'][i].includes("World") ||
    dataset['country_name'][i].includes("Asia") ||
    dataset['country_name'][i].includes("income"))
    return "none";
  else
    return d;
};

var filterLabel = function(d, i){
  if(selected_country.indexOf(dataset['country_name'][i]) >= 0)
  {
    selectedIdList[i] = true;
    return dataset['country_name'][i];
  }
  else
  {
    selectedIdList[i] = false;
    return "";
  }
}

var xhrReq = function ( attribute, address, callback){

  var xhr = new XMLHttpRequest();
  //var address = '/indicator/economy_growth/GDP%20per%20capita%20%5C(current%20US%5C%24%5C)'
  xhr.open('GET', window.location.origin + address, true);
  xhr.addEventListener("load", function (e){
    var docs  = JSON.parse(xhr.responseText);
    callback(attribute, docs);

    num_attr -= 1;
    if(num_attr == 0) changeCicle();
  });
  xhr.send(null);
}

var click_event = function (e){
  //console.log(e.target.tagName);
  if(e.target.tagName == "BUTTON" && e.target.id === "changeButton"){
    changeCicle();
  }

  if(e.target.tagName == "BUTTON" && e.target.id === "playButton"){
    playEvent = setInterval(function(){
      var year = document.getElementById("year_input");
      year.value = Number(year.value) + 1;
      changeCicle();
      if(year.value >= 2014) {
        var year = document.getElementById("year_input");
        year.value = 1960;
        clearInterval(playEvent)
      };
    }, 1200);
  }

  if(e.target.tagName == "BUTTON" && e.target.id === "stopButton"){
    clearInterval(playEvent);
  }

  if(e.target.tagName == "BUTTON" && e.target.id === "loadData"){
    console.log("Load Data");

    num_attr = 3;
    var attr_list = document.querySelectorAll("div.index_div");
    for(var i = 0; i < num_attr; i++)
    {
      var groupName = attr_list[i].dataset.group + "/";
      var addr = encodeURI('/indicator/' + groupName + attr_list[i].dataset.val);
      console.log(addr);
      xhrReq(attr_list[i].dataset.attrName, addr, set_data);
    }
  }
}

var set_data = function( index, data)
{
  dataset[index] = data.map(function(ele){return ele['value'];});
}

var changeCircleRandom = function(){
  var svg = d3.select("svg");
  var circles = svg.selectAll("circle").transition().duration(trasitionTime)
  .attr("cx", function (d){return Math.random() * width; })
  .attr("cy", function (d){return Math.random() * height; });
}

var changeCicle = function(){
  var year = document.getElementById("year_input");
  console.log(year.value);
  make_circle(Number(year.value));
}

var make_circle = function (year){
  var yearData = [];
  dataset['maxX'] = 0;
  dataset['maxY'] = 0;
  dataset['minX'] = 987654321;
  dataset['minY'] = 987654321;
  for( i in dataset['country_name'])
  {
    var obj = {};
    obj['country_name'] = dataset['country_name'][i];
    for( j in dataset['x'][i]){
      if(parseInt(dataset['x'][i][j]['year']) == year){
        obj['x'] = Number(dataset['x'][i][j]['value']);
        break;
      }
    }
    for( j in dataset['y'][i]){
      if(parseInt(dataset['y'][i][j]['year']) == year){
        obj['y'] = Number(dataset['y'][i][j]['value']);
        break;
      }
    }
    for( j in dataset['size'][i]){
      if(parseInt(dataset['size'][i][j]['year']) == year){
        obj['size'] = Number(dataset['size'][i][j]['value']);
        break;
      }
    }
    //console.log(obj['country_name'] + " " +obj['x'] + " " + obj['y']);
    yearData.push(obj);
  }

  //change circle
  var svg = d3.select("svg");
  var circles = svg.selectAll("circle").transition().duration(trasitionTime);
  circles
    .attr("cx", function (d, i){
      if(yearData[i]['x'])
        return scaleX(Number(yearData[i]['x']));
      else
        return d['x'];
      })
    .attr("cy", function (d, i){
      if(yearData[i]['y'])
        return scaleY(yearData[i]['y']);
      else
        return d['y'];
    })
    .attr("r", function(d,i){
      if(yearData[i]['size'])
        return "" + scaleSize(yearData[i]['size']) +"px";
      else
        return d['r'];
    });

  var labels = svg.selectAll("svg>text").transition().duration(trasitionTime);
  labels
  .attr("dx", function (d, i){
    if(yearData[i]['x'])
      return scaleX(Number(yearData[i]['x']));
    else
      return d['x'];
    })
  .attr("dy", function (d, i){
    if(yearData[i]['y'])
      return scaleY(yearData[i]['y']);
    else
      return d['y'];
  })
};

document.addEventListener("click", click_event);
init();
