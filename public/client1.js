$('.progressBar').hide();
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

  mVariable = math.range(parseFloat($('#con1-start').val()), parseFloat($('#con1-end').val()), parseFloat($('#con1-step').val()))._data;

  if (chosenV === "Conductivity") {
    mVariable = math.range(parseFloat($('#con1-start').val()), parseFloat($('#con1-end').val()), parseFloat($('#con1-step').val()))._data;
    mat1params = {
      mr1: parseFloat($('#mr1').val()),
      d: parseFloat($('#d').val())
    };
  } else if (chosenV === "Permeability") {
    mVariable = math.range(parseFloat($('#mr1-start').val()), parseFloat($('#mr1-end').val()), parseFloat($('#mr1-step').val()))._data;
    mat1params = {
      con1: parseFloat($('#con1').val()),
      d: parseFloat($('#d').val())
    };
  } else {
    mVariable = math.range(parseFloat($('#d-start').val()), parseFloat($('#d-end').val()), parseFloat($('#d-step').val()))._data;
    mat1params = {
      mr1: parseFloat($('#mr1').val()),
      con1: parseFloat($('#con1').val())
    };
  }

  let data2Send = {
    a: parseFloat($('#a').val()),
    b: parseFloat($('#b').val()),
    n: parseFloat($('#n').val()),
    r1: parseFloat($('#r1').val()),
    r2: parseFloat($('#r2').val()),
    z1: parseFloat($('#z1').val()),
    z2: parseFloat($('#z2').val()),
    wireTurn: parseFloat($('#wireTurn').val()),
    cur: parseFloat($('#cur').val()),
    mVariable: mVariable,
    mat1params: mat1params,
    chosenV: chosenV
  };

  $('.progressBar').show();

  $.ajax({
      method: 'POST',
      url: '/calculation1',
      data: data2Send,
      success: function() {
      },
      complete: function(response) {
        $('.progressBar').hide();
        let responseParsed = JSON.parse(response.responseText);
        myChartConfig.data.labels = responseParsed.f;
        myChartConfig2.data.labels = responseParsed.f;

        responseParsed.result.forEach((resul, index) => {

          var unit2Insert = (chosenV) => (
            chosenV === "Thickness" ? " mm"
            : chosenV === "Conductivity" ? " "
            : ""
          );

          var symbol2Insert = (chosenV) => (
            chosenV === "Thickness" ? " d"
            : chosenV === "Conductivity" ? " σ"
            : "μ\u1D63"
          );

          var newDataset = {
            label: symbol2Insert(data2Send.chosenV) + "=" + data2Send.mVariable[index] + unit2Insert(data2Send.chosenV),
            backgroundColor: chartColors[myChartConfig.data.datasets.length % chartColors.length],
            borderColor: chartColors[myChartConfig.data.datasets.length % chartColors.length],
            data: resul.im,
            fill: false
          };
          updateChart(myChart, myChartConfig, newDataset);

          var newDataset2 = {
            label: symbol2Insert(data2Send.chosenV) + "=" + data2Send.mVariable[index] + unit2Insert(data2Send.chosenV),
            backgroundColor: chartColors[myChartConfig2.data.datasets.length % chartColors.length],
            borderColor: chartColors[myChartConfig2.data.datasets.length % chartColors.length],
            data: resul.re,
            fill: false
          };
          updateChart(myChart2, myChartConfig2, newDataset2);
        });
      }

    })
};

function deleteBothChart() {
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

    if (optionValue === "Conductivity") {
      $("#sampleProp").html("<i>&sigma;</i> values");
      $(".sampleProp-unit").html(" MS/m");
    } else if (optionValue === "Thickness") {
      $("#sampleProp").html("<i>d</i> values");
      $(".sampleProp-unit").html(" mm")
    } else {
      $("#sampleProp").html("</i>&mu;<sub>r</sub></i> values");
      $(".sampleProp-unit").html("")
    }

  });
}).change();
