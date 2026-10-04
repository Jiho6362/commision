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
  var apply = C.apply || {};
  var fields = apply.fields || [];

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
    '<div>' + (about.role ? '<span class="about-role">' + esc(about.role) + '</span>' : '') +
    '<h3 class="serif">' + esc(about.name) +
    (about.subname ? '<small>' + esc(about.subname) + '</small>' : '') + '</h3>' +
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
    // 유튜브 주소가 비어 있으면 '비어있음' 칸으로 표시 (누를 수 없음)
    if (!String(w.youtube || '').trim()) {
      return '<button type="button" class="card card-blank" disabled data-cat="' + esc(w.category) + '">' +
        '<span class="card-empty"><span class="badge">' + esc(w.category) + '</span>비어있음</span></button>';
    }
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
    '<div class="plans">' + options.map(function (o, j) {
      var no = j < 9 ? '0' + (j + 1) : String(j + 1);
      return '<button type="button" class="plan" data-j="' + j + '">' +
        '<span class="plan-no">OPTION ' + no + '</span>' +
        '<span class="plan-name serif">' + esc(o.name) + '</span>' +
        '<span class="plan-price">' + esc(o.price) + '</span>' +
        '<span class="plan-toggle">자세히 보기</span></button>';
    }).join('') + '</div>' +
    ((price.notices || []).length
      ? '<ul class="notice">' + price.notices.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>'
      : '') +
    '</section>';

  // 4. Apply (신청 양식): options 가 있으면 선택 버튼, 없으면 입력칸
  html += '<section class="section" id="apply"><h2 class="title serif">Apply</h2>' +
    (apply.guide ? '<p class="apply-guide pre">' + esc(apply.guide) + '</p>' : '') +
    '<div class="apply"><ul class="apply-list">' +
    fields.map(function (f, i) {
      var control;
      if (f.options && f.options.length) {
        control = '<div class="apply-opts">' + f.options.map(function (o) {
          return '<button type="button" class="apply-opt" data-f="' + i + '" data-v="' + esc(o) + '" aria-pressed="false">' + esc(o) + '</button>';
        }).join('') + '</div>';
      } else if (f.input === 'textarea') {
        control = '<textarea class="apply-input" data-f="' + i + '" rows="4" placeholder="' + esc(f.placeholder) + '"></textarea>';
      } else {
        control = '<input type="text" class="apply-input" data-f="' + i + '" placeholder="' + esc(f.placeholder) + '">';
      }
      return '<li><b>' + esc(f.label) + '</b>' + control + '</li>';
    }).join('') + '</ul>' +
    '<button type="button" class="apply-copy" id="apply-copy">양식 복사하기</button></div></section>';

  app.innerHTML = html;

  // 주소에 #portfolio 같은 위치가 붙어 있으면 내용을 그린 뒤 그 위치로 이동
  var target = location.hash && document.getElementById(location.hash.slice(1));
  if (target) target.scrollIntoView();


  // 신청 양식: 선택 버튼은 하나만 고를 수 있고, 다시 누르면 취소
  var answers = fields.map(function () { return ''; });
  app.querySelectorAll('.apply-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = +btn.getAttribute('data-f');
      var v = btn.getAttribute('data-v');
      answers[f] = answers[f] === v ? '' : v;
      app.querySelectorAll('.apply-opt[data-f="' + f + '"]').forEach(function (b) {
        var on = b.getAttribute('data-v') === answers[f];
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
      });
    });
  });
  app.querySelectorAll('.apply-input').forEach(function (el) {
    el.addEventListener('input', function () { answers[+el.getAttribute('data-f')] = el.value; });
  });

  // 가격 카드: 누르면 작은 팝업으로 설명 표시
  var pop = document.getElementById('pop');
  var popOption = null;
  var lastPlan = null;

  function openPop(plan) {
    var o = options[+plan.getAttribute('data-j')];
    popOption = o.name;
    lastPlan = plan;
    document.getElementById('pop-name').textContent = o.name || '';
    document.getElementById('pop-price').textContent = o.price || '';
    document.getElementById('pop-desc').textContent = o.description || '';
    pop.hidden = false;
    document.body.classList.add('lock');
    pop.querySelector('.pop-close').focus();
  }

  function closePop() {
    if (pop.hidden) return;
    pop.hidden = true;
    document.body.classList.remove('lock');
    if (lastPlan) lastPlan.focus();
  }

  app.querySelectorAll('.plan').forEach(function (plan) {
    plan.addEventListener('click', function () { openPop(plan); });
  });
  pop.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', closePop);
  });

  // 팝업의 '이 옵션으로 신청하기': 신청 양식에서 해당 옵션을 골라 두고 양식으로 이동
  document.getElementById('pop-apply').addEventListener('click', function () {
    var opt = Array.prototype.filter.call(app.querySelectorAll('.apply-opt'), function (b) {
      return b.getAttribute('data-v') === popOption;
    })[0];
    if (opt && !opt.classList.contains('on')) opt.click();
    closePop();
    document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
  });

  // 신청 양식 복사: 고르고 적은 내용을 양식 형태로 복사
  var copyBtn = document.getElementById('apply-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var applyText = fields.map(function (f, i) {
        var v = answers[i].trim();
        return '■ ' + f.label + ' : ' + (v.indexOf('\n') >= 0 ? '\n' + v : v);
      }).join('\n');
      var done = function () {
        copyBtn.textContent = '복사되었어요 ✓';
        copyBtn.classList.add('done');
        setTimeout(function () { copyBtn.textContent = '양식 복사하기'; copyBtn.classList.remove('done'); }, 2000);
      };
      var fallback = function () {
        var ta = document.createElement('textarea');
        ta.value = applyText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(applyText).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

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
    if (card.disabled) return;
    card.addEventListener('click', function () { open(card); });
  });
  modal.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); closePop(); }
  });
})();
