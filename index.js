const express = require('express');
const maths = require("mathjs");
const bodyParser = require('body-parser');

const EctSolution = require("./Ect-solution.js");

const port = 3000;

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

const mm=1.0e-3, megaSm=1.0e6;
let ectSoln1 = new EctSolution({r1: 0*mm, r2: 0*mm, z1: 0*mm, z2: 0*mm, wireTurn: 0, cur: 0}, {con1: 0*megaSm, mr1: 0, d: 0*mm}, {con2: 0*megaSm, mr2: 1.0}, [], 100);

app.post('/calculation1', (req, res) => {
  let a = parseInt(req.body.a), b = parseInt(req.body.b), n = parseInt(req.body.n);
  let r1 = parseInt(req.body.r1), r2 = parseInt(req.body.r2), z1 = parseInt(req.body.z1), z2 = parseInt(req.body.z2);
  let wireTurn = parseInt(req.body.wireTurn), cur = parseInt(req.body.cur);
  // let con1 = parseInt(req.body.con1), mr1 = parseInt(req.body.mr1), d = parseInt(req.body.d);
  let chosenV = req.body.chosenV, mVariable = req.body.mVariable, mat1params = req.body.mat1params;
  // console.log(req.body.mat1params);
  // console.log(req.body.mVariable);
  // console.log(req.body.chosenV);

  let f = new Array(n).fill(0);
  // console.log(n);
  f[0] = Math.pow(10, a)
  f.slice(1, f.length).forEach((_f, index) => {
    return f[index+1] = f[index] * (Math.pow(10, ((b-a)/(n-1)) ))
  })
  f[f.length-1] = Math.pow(10, b);
  ectSoln1.f = f;
  ectSoln1.r1 = r1*mm;
  ectSoln1.r2 = r2*mm;
  ectSoln1.z1 = z1*mm;
  ectSoln1.z2 = z2*mm;
  ectSoln1.wireTurn = wireTurn;
  ectSoln1.cur = cur;

  // ectSoln1.con1 = con1*megaSm;
  // ectSoln1.mr1 = mr1;
  // ectSoln1.d = d*mm;

  let result;

  // if (chosenV === "conductivity") {
  //   ectSoln1.mr1 = mat1params.mr1;
  //   ectSoln1.d = mat1params.d*mm;
  //
  //   result = mVariable.forEach((mV) => {
  //     ectSoln1.con1 = mV*megaSm;
  //     return ectSoln1.getBz();
  //   });
  // }
  // else if (chosenV === "permeability"){
  //   ectSoln1.con1 = mat1params.con1*megaSm;
  //   ectSoln1.d = mat1params.d*mm;
  //
  //   result = mVariable.forEach((mV) => {
  //     ectSoln1.mr1 = mV;
  //     return ectSoln1.getBz();
  //   });
  // }
  // else {
  //   ectSoln1.con1 = mat1params.con1*megaSm;
  //   ectSoln1.mr1 = mat1params.mr1;
  //
  //   result = mVariable.forEach((mV) => {
  //     ectSoln1.d = mV*mm;
  //     console.log(ectSoln1.d);
  //     return ectSoln1.getBz();
  //   });
  // }

  // if (chosenV === "conductivity") {
    ectSoln1.con1 = mat1params.con1*megaSm;
    ectSoln1.mr1 = mat1params.mr1;

    result = mVariable.map( (mV) => {
      ectSoln1.d = mV*mm;
      return ectSoln1.getBz();
    });
  // }


  // console.log(result);

  res.send(JSON.stringify({
    f: f,
    re: result[0].re,
    im: result[0].im
  }));

  res.end();
});

app.listen(port, () => {
    console.log(`in port ${port}`);
})
