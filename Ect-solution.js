const BESSEL = require('bessel');
const J1root = require("./J1root.js");
const maths  = require('mathjs');

class EctSolution {

  constructor (coilParams, mat1Params, mat2Params, frequency, ns) {
    // coilParams: r1, r2, z1, z2, wireTurn, cur
    // mat1Params: con1, mr1, d
    // mat2Params: con2, mr2
    this.r1 = coilParams.r1;
    this.r2 = coilParams.r2;
    this.z1 = coilParams.z1;
    this.z2 = coilParams.z2;
    this.wireTurn = coilParams.wireTurn;
    this.cur = coilParams.cur;
    this.con1 = mat1Params.con1;
    this.d = mat1Params.d;
    this.mr1 = mat1Params.mr1;
    this.con2 = mat2Params.con2;
    this.mr2 = mat2Params.con2;
    this.f = frequency;
    this.ns = ns;
  };

  getBz() {
    const h=10*this.r2, z=this.z1, omega=maths.dotMultiply(this.f, (2*Math.PI)), wireTurnsDensity=this.wireTurn*this.cur/((this.r2-this.r1)*(this.z2-this.z1));
    const coef=Math.PI*4.0e-7*wireTurnsDensity;
    let q = maths.divide(J1root.slice(0,this.ns), h);

    let eqz_ = maths.subtract(maths.exp(maths.dotMultiply(q, -1*(this.z1-z))), maths.exp(maths.dotMultiply(q, -1*(this.z2-z))));
    let eqz = maths.subtract(maths.exp(maths.dotMultiply(q, -1*(this.z1+z))), maths.exp(maths.dotMultiply(q, -1*(this.z2+z))));

    // let k=[...Array(1002).keys()];
    let nu = maths.chain([...Array(1002).keys()])
                  .dotMultiply(2)
                  .add(1)
                  .done();
    let x1 = maths.dotMultiply(q, this.r1), x2 = maths.dotMultiply(q, this.r2);

    var jx = [];
    var _jx_1 = [];
    var _jx_2 = [];
    for (var i = 0; i < this.ns; i++) {

      _jx_1 = -x2[i]*BESSEL.besselj(x2[i],0) + 2*maths.sum(nu.map(val => (BESSEL.besselj(x2[i],val))));
      _jx_2 = -x1[i]*BESSEL.besselj(x1[i],0) + 2*maths.sum(nu.map(val => (BESSEL.besselj(x1[i],val))));

      jx.push(_jx_1 - _jx_2);
    }

    let _bes = q.map(val => BESSEL.besselj(val*h,0));
    let bes = maths.chain(q).dotMultiply(h).dotMultiply(_bes).done();
    let oros = maths.chain(jx).dotDivide(q).dotDivide(maths.dotPow(bes, 2)).done();

    const j2 = maths.complex('i');

    var dz = [];
    for (var i = 0; i < this.f.length; i++) {
      var p2 = maths.sqrt(maths.chain(q)
                    .dotMultiply(q)
                    .add(maths.dotMultiply(j2,omega[i]*Math.PI*4.0e-7*this.mr2*this.con2))
                    .done());

      var p1 = maths.sqrt(maths.chain(q)
                    .dotMultiply(q)
                    .add(maths.dotMultiply(j2,omega[i]*Math.PI*4.0e-7*this.mr1*this.con1))
                    .done());

      var qp1a = maths.add(maths.dotMultiply(q, this.mr1), p1);
      var qp1s = maths.subtract(maths.dotMultiply(q, this.mr1), p1);

      var p1p2a = maths.add(maths.dotMultiply(p1, this.mr1), maths.dotMultiply(p2, this.mr1));
      var p1p2s = maths.subtract(maths.dotMultiply(p1, this.mr1), maths.dotMultiply(p2, this.mr1));

      var ep1d = maths.exp(maths.dotMultiply(p1, this.d*-2));

      var refl_temp1 = qp1s.map((val, index) => val.mul(p1p2a[index]));
      var refl_temp2 = qp1a.map((val, index) => (val.mul(p1p2s[index].mul(ep1d[index]))));
      var refl_temp3 = qp1a.map((val, index) => val.mul(p1p2a[index]));
      var refl_temp4 = qp1s.map((val, index) => (val.mul(p1p2s[index].mul(ep1d[index]))));
      var refl_temp5 = (refl_temp1.map((val, index) => val.add(refl_temp2[index])));
      var refl_temp6 = (refl_temp3.map((val, index) => val.add(refl_temp4[index])));
      var refl = refl_temp5.map((val, index) => (val.div(refl_temp6[index])));

      var orosf = maths.dotMultiply(oros, maths.add(eqz, maths.dotMultiply(eqz, refl)));

      dz.push(maths.dotMultiply(maths.sum(orosf),coef));
    }

    return {re: dz.map((val)=>(val.re)), im: dz.map((val)=>(val.im))};
  }

}

module.exports = EctSolution;
