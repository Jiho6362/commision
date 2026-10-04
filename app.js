// content.js 의 내용을 화면에 그립니다. 이 파일은 고치지 않아도 됩니다.
(function () {
  var C = window.CONTENT;
  var app = document.getElementById('app');

  if (!C) {
    app.innerHTML = '<p class="error">content.js 를 읽지 못했어요. 마지막으로 고친 곳에서 쉼표(,)나 따옴표가 빠지지 않았는지 확인해 주세요.</p>';
    return;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 유튜브 주소(watch, youtu.be, shorts, embed, live)나 영상 ID에서 ID만 꺼냅니다
  function youtubeId(url) {
    var s = String(url || '').trim();
    var m = s.match(/(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(s) ? s : '';
  }

  var about = C.about || {};
  var works = C.works || [];
  var price = C.price || {};
  var options = price.options || [];
  var contacts = C.contacts || [];

  if (about.name) document.title = about.name + ' | 커미션 안내';

  // 카테고리: 작업물에 적힌 순서대로
  var cats = [];
  works.forEach(function (w) {
    if (w.category && cats.indexOf(w.category) < 0) cats.push(w.category);
  });

  var html = '';

  // 1. About Me
  html += '<section class="section" id="about"><h2 class="title serif">About Me</h2><div class="about">' +
    (about.image
      ? '<img class="about-img" src="' + esc(about.image) + '" alt="">'
      : '<div class="about-img serif">' + esc(String(about.name || '').charAt(0)) + '</div>') +
    '<div><h3 class="serif">' + esc(about.name) + '</h3>' +
    '<p class="pre">' + esc(about.intro) + '</p>' +
    '<div class="tags">' + (about.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
    '</div></div></section>';

  // 2. Portfolio
  html += '<section class="section" id="portfolio"><h2 class="title serif">Portfolio</h2>';
  if (cats.length > 1) {
    html += '<div class="chips"><button type="button" class="chip on" data-cat="">전체</button>' +
      cats.map(function (c) { return '<button type="button" class="chip" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') +
      '</div>';
  }
  html += '<div class="grid">' + works.map(function (w, i) {
    var id = youtubeId(w.youtube);
    var thumb = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
    return '<button type="button" class="card" data-i="' + i + '" data-cat="' + esc(w.category) + '">' +
      (id
        ? '<img class="card-bg" src="' + thumb + '" alt="" loading="lazy"><img class="card-img" src="' + thumb + '" alt="" loading="lazy">'
        : '<span class="card-empty">유튜브 주소를 확인해 주세요</span>') +
      '<span class="card-info"><span class="badge">' + esc(w.category) + '</span>' +
      '<span class="card-title">' + esc(w.title) + '</span></span></button>';
  }).join('') + '</div></section>';

  // 3. Price
  html += '<section class="section" id="price"><h2 class="title serif">Price</h2>' +
    '<div class="table-wrap"><table class="table"><thead><tr><th></th>' +
    options.map(function (o) { return '<th class="serif">' + esc(o.name) + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
    (price.rows || []).map(function (r) {
      return '<tr><th>' + esc(r.label) + '</th>' +
        options.map(function (_, j) { return '<td>' + esc((r.values || [])[j]) + '</td>'; }).join('') + '</tr>';
    }).join('') +
    '<tr class="price-row"><th>가격</th>' +
    options.map(function (o) { return '<td>' + esc(o.price) + '</td>'; }).join('') +
    '</tr></tbody></table></div>' +
    '<div class="options">' + options.filter(function (o) { return o.description; }).map(function (o) {
      return '<details><summary>' + esc(o.name) + '</summary><p class="pre">' + esc(o.description) + '</p></details>';
    }).join('') + '</div>' +
    ((price.notices || []).length
      ? '<ul class="notice">' + price.notices.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>'
      : '') +
    '</section>';

  // 4. Contact
  html += '<section class="section" id="contact"><h2 class="title serif">Contact</h2><div class="contact">' +
    contacts.map(function (c) {
      var external = /^https?:/.test(c.link || '');
      return '<a href="' + esc(c.link) + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<b>' + esc(c.label) + '</b>' + esc(c.text) + '</a>';
    }).join('') + '</div></section>';

  app.innerHTML = html;


  // 카테고리 필터
  var chips = app.querySelectorAll('.chip');
  var cards = app.querySelectorAll('.card');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var cat = chip.getAttribute('data-cat');
      chips.forEach(function (c) { c.classList.toggle('on', c === chip); });
      cards.forEach(function (card) { card.hidden = !!cat && card.getAttribute('data-cat') !== cat; });
    });
  });

  // 작업물 상세 창
  var modal = document.getElementById('modal');
  var video = document.getElementById('modal-video');
  var lastCard = null;

  function open(card) {
    var w = works[+card.getAttribute('data-i')];
    var id = youtubeId(w.youtube);
    lastCard = card;
    document.getElementById('modal-cat').textContent = w.category || '';
    document.getElementById('modal-title').textContent = w.title || '';
    document.getElementById('modal-credit').textContent = w.credit || '';
    video.src = id ? 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0' : 'about:blank';
    modal.hidden = false;
    document.body.classList.add('lock');
    modal.querySelector('.modal-close').focus();
  }

  function close() {
    if (modal.hidden) return;
    modal.hidden = true;
    video.src = 'about:blank'; // 닫으면 영상도 멈춤
    document.body.classList.remove('lock');
    if (lastCard) lastCard.focus();
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () { open(card); });
  });
  modal.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
