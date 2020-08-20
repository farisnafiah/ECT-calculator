var ctx = $('#myChart');
var config = {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      type: 'line',
      label: "Freq vs real",
      yAxisID: "y-axis-0",
      fill: false,
      borderColor: 'rgba(255, 99, 132, 0.6)',
      data: [],
    }, {
      type: 'line',
      label: "Freq vs imaginary",
      yAxisID: "y-axis-1",
      fill: false,
      borderColor: 'rgba(0, 0, 255, 0.6)',
      data: [],
    }, ]
  },
  options: {
    scales: {
      yAxes: [{
        position: "left",
        "id": "y-axis-0",
      }, {
        position: "right",
        "id": "y-axis-1",
      }]
    }
  }
};
var myChart = new Chart(ctx, config);

function getInputValueAndCalculate() {

  let chosenV = $("select").children("option:selected").val();
  let mVariable;
  let mat1params;

  mVariable = math.range(  parseInt($('#con1-start').val()),parseInt($('#con1-end').val()),parseInt($('#con1-step').val()) )._data;

  if (chosenV === "conductivity") {
    mVariable = math.range(  parseInt($('#con1-start').val()),parseInt($('#con1-end').val()),parseInt($('#con1-step').val()) )._data;
    mat1params = {
      mr1: parseInt($('#mr1').val()),
      d: parseInt($('#d').val())
    };
  }
  else if (chosenV === "permeability") {
    mVariable = math.range(  parseInt($('#mr1-start').val()),parseInt($('#mr1-end').val()),parseInt($('#mr1-step').val()) )._data;
    mat1params = {
      con1: parseInt($('#con1').val()),
      d: parseInt($('#d').val())
    };
  }
  else {
    mVariable = math.range(  parseInt($('#d-start').val()),parseInt($('#d-end').val()),parseInt($('#d-step').val()) )._data;
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

    // con1: parseInt($('#con1').val()),
    // mr1: parseInt($('#mr1').val()),
    // d: parseInt($('#d').val())
  };

  $.ajax({
    method: 'POST',
    url: '/calculation1',
    data: data2Send
  })
  .then(
    response => {
      let responseParsed = JSON.parse(response);
      console.log(responseParsed);
      var myChartConfig = myChart.config;
      myChartConfig.data.datasets[0].data = responseParsed.re;
      myChartConfig.data.datasets[1].data = responseParsed.im;
      myChartConfig.data.labels = responseParsed.f;
      myChart.update();
    }
  )
};

$('#submitButton').on('click', getInputValueAndCalculate);

$("select").change(function(){
  $(this).find("option:selected").each(function(){
    var optionValue = $(this).attr("value");
    $(".box").not("." + optionValue).hide();
    $("." + optionValue).show();

    $(".bbox").not("." + optionValue).show();
    $(".bbox."+optionValue).hide();

  });
}).change();
