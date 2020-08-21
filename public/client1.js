const chartColors = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62778",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf"
];

var ctx = $('#myChart');
var ctx2 = $('#myChart2');
var config = {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: "Imaginary Component vs Frequency"
    },
    scales: {
      xAxes: [{
        display: true,
        ticks: {
          callback: function(label, index, labels) {
            return label.toFixed(3)
          }
        },
        scaleLabel: {
          display: true,
          labelString: "Frequency, Hz"
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Imaginary component, V"
        }
      }]
    }
  }
};
var myChart = new Chart(ctx, config);
var config2 = {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: "Real Component vs Frequency"
    },
    scales: {
      xAxes: [{
        display: true,
        ticks: {
          callback: function(label, index, labels) {
            return label.toFixed(3)
          }
        },
        scaleLabel: {
          display: true,
          labelString: "Frequency, Hz"
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Real component, V"
        }
      }]
    }
  }
};
var myChart2 = new Chart(ctx2, config2);
var myChartConfig = myChart.config;
var myChartConfig2 = myChart2.config;

function getInputValueAndCalculate() {

  let chosenV = $("select").children("option:selected").val();
  let mVariable;
  let mat1params;

  mVariable = math.range(parseInt($('#con1-start').val()), parseInt($('#con1-end').val()), parseInt($('#con1-step').val()))._data;

  if (chosenV === "conductivity") {
    mVariable = math.range(parseInt($('#con1-start').val()), parseInt($('#con1-end').val()), parseInt($('#con1-step').val()))._data;
    mat1params = {
      mr1: parseInt($('#mr1').val()),
      d: parseInt($('#d').val())
    };
  } else if (chosenV === "permeability") {
    mVariable = math.range(parseInt($('#mr1-start').val()), parseInt($('#mr1-end').val()), parseInt($('#mr1-step').val()))._data;
    mat1params = {
      con1: parseInt($('#con1').val()),
      d: parseInt($('#d').val())
    };
  } else {
    mVariable = math.range(parseInt($('#d-start').val()), parseInt($('#d-end').val()), parseInt($('#d-step').val()))._data;
    mat1params = {
      mr1: parseInt($('#mr1').val()),
      con1: parseInt($('#con1').val())
    };
  }

  let data2Send = {
    a: parseInt($('#a').val()),
    b: parseInt($('#b').val()),
    n: parseInt($('#n').val()),
    r1: parseInt($('#r1').val()),
    r2: parseInt($('#r2').val()),
    z1: parseInt($('#z1').val()),
    z2: parseInt($('#z2').val()),
    wireTurn: parseInt($('#wireTurn').val()),
    cur: parseInt($('#cur').val()),
    mVariable: mVariable,
    mat1params: mat1params,
    chosenV: chosenV
  };

  $.ajax({
      method: 'POST',
      url: '/calculation1',
      data: data2Send
      
    })
    .then(
      response => {
        let responseParsed = JSON.parse(response);
        myChartConfig.data.labels = responseParsed.f;
        myChartConfig2.data.labels = responseParsed.f;

        responseParsed.result.forEach((resul, index) => {

          var newDataset = {
            label: data2Send.chosenV + " " + data2Send.mVariable[index],
            backgroundColor: chartColors[myChartConfig.data.datasets.length % chartColors.length],
            borderColor: chartColors[myChartConfig.data.datasets.length % chartColors.length],
            data: resul.im,
            fill: false
          };
          updateChart(myChart, myChartConfig, newDataset);

          var newDataset2 = {
            label: data2Send.chosenV + " " + data2Send.mVariable[index],
            backgroundColor: chartColors[myChartConfig2.data.datasets.length % chartColors.length],
            borderColor: chartColors[myChartConfig2.data.datasets.length % chartColors.length],
            data: resul.re,
            fill: false
          };
          updateChart(myChart2, myChartConfig2, newDataset2);
        });

      }
    )
};

function deleteBothChart() {
  console.log("kjasbv");
  myChartConfig.data.datasets = [];
  myChart.update();
  myChartConfig2.data.datasets = [];
  myChart2.update();
}

const updateChart = (whichChart, chartConfig, dataset) => {
  chartConfig.data.datasets.push(dataset);
  whichChart.update();
}

$('#submitButton').on('click', getInputValueAndCalculate);
$('#deleteButton').on('click', deleteBothChart);
$("select").change(function() {
  $(this).find("option:selected").each(function() {
    var optionValue = $(this).attr("value");
    $(".box").not("." + optionValue).hide();
    $("." + optionValue).show();
    $(".bbox").not("." + optionValue).show();
    $(".bbox." + optionValue).hide();

    if (optionValue === "conductivity") {
      $("#sampleProp").html(optionValue + " values");
      $(".sampleProp-unit").html(" MS/m");
    } else if (optionValue === "thickness") {
      $("#sampleProp").html(optionValue + " values");
      $(".sampleProp-unit").html(" mm")
    } else {
      $("#sampleProp").html("relative " + optionValue + " values");
      $(".sampleProp-unit").html("")
    }

  });
}).change();
