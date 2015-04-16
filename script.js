require('babelify/polyfill');
const xhr = require('xhr');

var filters = {};
var malts;

function filterAll(malt, filter) {
  var matcher = new RegExp(filter, 'i');

  return Object.keys(malt)
    .map(k => malt[k])
    .filter(v => typeof v === 'string')
    .some(v => v.match(matcher));
}

function renderMalts(malts) {
  insertAt('tbody', malts.map(function(malt) {
    return `
<tr>
  <td>${malt.name}</td>
  <td>${malt.origin}</td>
  <td>${malt.yield}</td>
  <td>${malt.ebc}</td>
  <td>${malt.diasticPower}</td>
  <td>${malt.description}</td>
  <td>${malt.maxPercentage}</td>
  <td>${malt.requiresMash}</td>
</tr>
    `;
  }).join(''));
}

function renderDefinitions(defs) {
  insertAt('#forklaring', defs.map(function(def) {
    return `
<dt>${def.display}</dt>
<dd>${def.description}</dd>
    `;
  }).join(''));
}

function renderHeader(defs) {
  insertAt('thead > tr', defs.map(function(def) {
    return `<th>${def.display}</th>`;
  }).join(''));
}

function insertAt(selector, html) {
  document.querySelector(selector).innerHTML = html;
}

function filteredMalts() {
  return malts.filter(function(malt) {
    return Object.keys(filters)
      .map(k => filters[k])
      .every(filter => filter.prop ? malt[filter.prop].match(filter.filter, 'i') : filterAll(malt, filter.filter));
  });
}

function rerenderMalts() {
  renderMalts(filteredMalts());
}

function addFilterFromClick(e) {
  var container = e.currentTarget;
  var el = e.target;
  var prop = el.getAttribute('data-property');
  var filter = el.getAttribute('data-filter');
  var name = container.getAttribute('data-name');

  if(el.classList.contains('isSelected')) {
    delete filters[name];
    el.classList.remove('isSelected');
  } else {
    Array.from(container.querySelectorAll('.filter a')).forEach(n => n.classList.remove('isSelected'));
    el.classList.add('isSelected');
    filters[name] = {prop, filter};
  }

  rerenderMalts();
}

xhr({uri: 'https://spreadsheets.google.com/feeds/list/1NH7wpE65AA5SjmNx6_vvj3CELUjjOdThRp9kZ4OtuAY/o5u89zd/public/basic?alt=json'}, function(err, res, body) {
  var data = JSON.parse(body).feed.entry;

  var metadata = data.map(function(d) {
    var fields = /^display: (.*), description: (.*)$/.exec(d.content.$t);
    return {
      id: d.title.$t,
      display: fields[1],
      description: fields[2]
    };
  });
  renderDefinitions(metadata);
  renderHeader(metadata);
});

xhr({uri: 'https://spreadsheets.google.com/feeds/list/1NH7wpE65AA5SjmNx6_vvj3CELUjjOdThRp9kZ4OtuAY/od6/public/basic?alt=json'}, function(err, res, body) {
  var data = JSON.parse(body).feed.entry;

  malts = data.map(function(d) {
    var fields = /^origin: (.*), yield: (.*), ebc: (.*), diasticpower: (.*), description: (.*), maxpercentage: (.*), requiresmash: (.*)$/.exec(d.content.$t);
    return {
      name: d.title.$t,
      origin: fields[1],
      yield: fields[2],
      ebc: fields[3],
      diasticPower: fields[4],
      description: fields[5],
      maxPercentage: fields[6],
      requiresMash: fields[7],
    };
  });
  renderMalts(malts);
});

//Add listeners
Array.from(document.querySelectorAll('.filter')).forEach(n => n.addEventListener('click', addFilterFromClick));
document.querySelector('#fjern-filter').addEventListener('click', function(e) {
  Array.from(document.querySelectorAll('.filter a')).forEach(n => n.classList.remove('isSelected'));
  filters = {};
  rerenderMalts();
});
