require('babelify/polyfill');
const data = require('./malts.json');

var filters = {};

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
  <td>${malt.requireMask ? "Ja" : "Nei"}</td>
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
  return data.malts.filter(function(malt) {
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
    el.classList.remove('isSelected')
  } else {
    Array.from(container.querySelectorAll('.filter a')).forEach(n => n.classList.remove('isSelected'));
    el.classList.add('isSelected')
    filters[name] = {prop, filter};
  }

  rerenderMalts();
}

//Render stuff
renderMalts(data.malts);
renderDefinitions(data.attributes);
renderHeader(data.attributes);

//Add listeners
Array.from(document.querySelectorAll('.filter')).forEach(n => n.addEventListener('click', addFilterFromClick));
document.querySelector('#fjern-filter').addEventListener('click', function(e) {
  Array.from(document.querySelectorAll('.filter a')).forEach(n => n.classList.remove('isSelected'));
  filters = {};
  rerenderMalts();
});
