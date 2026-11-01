const {PROPERTIES:P}=require('../js/data.js');const {filterProps:f}=require('../js/app.js');const a=require('assert');
a.equal(f(P,{mode:'sale'}).length,5);a.equal(f(P,{mode:'rent'}).length,4);
a.deepEqual(f(P,{mode:'sale',loc:'Alpine Valley'}).map(p=>p.id),[3,7]);
a.equal(f(P,{mode:'sale',maxPrice:3500000}).every(p=>p.price<=3500000),true);
a.equal(f(P,{mode:'sale',beds:6}).length,2);a.equal(f(P,{mode:'sale',q:'ski'}).length,1);
a.equal(f(P,{mode:'sale',type:'Estate',q:'zzz'}).length,0);
a.equal(f(P,{mode:'sale',sort:'pa'})[0].id,6);a.equal(f(P,{mode:'sale',sort:'pd'})[0].id,3);
console.log('all filter tests passed');
