// content.json 의 내용을 화면에 그립니다. 내용은 관리자 페이지(admin.html)에서 고칩니다.
(function () {
  var app = document.getElementById('app');

  // 고친 내용이 바로 보이도록 매번 새로 불러옴
  fetch('content.json?t=' + Date.now())
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () {
      app.innerHTML = '<p class="error">내용(content.json)을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</p>';
    });

  function render(C) {

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
  var collabs = C.collabs || [];
  var shared = C.shared || {};
  var models = shared.models || [];
  var options = price.options || [];
  var apply = C.apply || {};
  var fields = apply.fields || [];
  // 판매 모델이 없으면 신청 양식에서도 공용 모델 관련 항목을 숨김
  if (!models.length) {
    var sharedLabel = shared.label || '공용 모델';
    fields = fields.filter(function (f) { return f.key !== 'sharedModel'; }).map(function (f) {
      return f.options ? Object.assign({}, f, { options: f.options.filter(function (o) { return o !== sharedLabel; }) }) : f;
    });
  }

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
  }).join('') + '</div><div class="pager" id="pager"></div></section>';

  // Collaboration: 옆으로 넘기는 카드
  if (collabs.length) {
    html += '<section class="section" id="collab"><h2 class="title serif">Collaboration</h2>' +
      '<div class="collab"><button type="button" class="collab-nav prev" aria-label="이전">‹</button>' +
      '<div class="collab-track">' + collabs.map(function (a) {
        var tag = a.link ? 'a' : 'div';
        return '<' + tag + ' class="collab-card"' + (a.link ? ' href="' + esc(a.link) + '" target="_blank" rel="noopener"' : '') + '>' +
          (a.image
            ? '<img class="collab-img" src="' + esc(a.image) + '" alt="">'
            : '<span class="collab-img serif">' + esc(String(a.name || '').charAt(0)) + '</span>') +
          '<b class="serif">' + esc(a.name) + '</b>' +
          (a.role ? '<span class="collab-role">' + esc(a.role) + '</span>' : '') +
          (a.link ? '<span class="collab-link">작가 페이지 ↗</span>' : '') + '</' + tag + '>';
      }).join('') + '</div>' +
      '<button type="button" class="collab-nav next" aria-label="다음">›</button></div></section>';
  }

  // 3. Price
  var originalHtml = '<div class="table-wrap"><table class="table"><thead><tr><th></th>' +
    options.map(function (o) { return '<th class="serif">' + esc(o.name) + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
    (price.rows || []).map(function (r) {
      return '<tr><th>' + esc(r.label) + '</th>' +
        options.map(function (_, j) {
          var v = String((r.values || [])[j] == null ? '' : r.values[j]).trim();
          var cls = v === '○' || v.toUpperCase() === 'O' ? ' class="yes"' : v === '✕' || v.toUpperCase() === 'X' ? ' class="no"' : '';
          return '<td' + cls + '>' + esc(v) + '</td>';
        }).join('') + '</tr>';
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
    ((price.addons || []).length
      ? '<div class="addons"><div class="addons-head"><span class="addons-label">ADD-ON</span><b>추가 옵션</b>' +
        (price.addonNote ? '<span class="addons-note">' + esc(price.addonNote) + '</span>' : '') + '</div>' +
        '<ul class="addons-list">' + price.addons.map(function (a) {
          return '<li><span>' + esc(a.name) + '</span><b>' + esc(a.price) + '</b></li>';
        }).join('') + '</ul></div>'
      : '') +
    ((price.notices || []).length
      ? '<ul class="notice">' + price.notices.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>'
      : '');

  // Price 소제목 (공용 모델 / 오리지널 모델)
  function psub(label, title, intro) {
    return '<div class="psub"><span class="psub-label">' + esc(label) + '</span>' +
      '<h3 class="psub-title serif">' + esc(title) + '</h3>' +
      (intro ? '<p class="psub-intro pre">' + esc(intro) + '</p>' : '') + '</div>';
  }

  // 공용 모델(미리 만들어 둔 판매 모델): 있을 때만 표시
  var statusClass = function (st) { return st === '판매완료' ? 'sold' : st === '예약중' ? 'hold' : 'sale'; };
  var sharedHtml = '<div class="collab shop-row"><button type="button" class="collab-nav prev" aria-label="이전">‹</button>' +
    '<div class="collab-track">' + (models.length ? '' : [0, 1, 2].map(function () {
      return '<div class="shop-card shop-blank"><span class="shop-img"><span>비어있음</span></span>' +
        '<span class="shop-body"><span class="shop-name">&nbsp;</span></span></div>';
    }).join('')) + models.map(function (m, i) {
      var img = (m.images || [])[0];
      var id = youtubeId(m.youtube);
      var thumb = img || (id ? 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg' : '');
      return '<button type="button" class="shop-card' + (m.status === '판매완료' ? ' is-sold' : '') + '" data-m="' + i + '">' +
        '<span class="shop-img">' + (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy">' : '') +
        (m.status ? '<span class="shop-status ' + statusClass(m.status) + '">' + esc(m.status) + '</span>' : '') + '</span>' +
        '<span class="shop-body"><span class="shop-name serif">' + esc(m.name) + '</span>' +
        '<span class="shop-price">' + esc(m.price) + '</span></span></button>';
    }).join('') + '</div><button type="button" class="collab-nav next" aria-label="다음">›</button></div>';

  html += '<section class="section" id="price"><h2 class="title serif">Price</h2>' +
    psub('READY-MADE', shared.label || '공용 모델', shared.intro) + sharedHtml +
    psub('CUSTOM', price.label || '오리지널 모델', price.intro) + originalHtml +
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

  // 아트머그에 길게(화면보다 높게) 들어가 있을 때: 창을 화면 가운데가 아니라 누른 위치 근처에 띄움
  function isTallFrame() {
    return document.documentElement.classList.contains('in-frame') && window.innerHeight > screen.height;
  }
  // 아트머그 화면에서 지금 보이는 부분의 정중앙에 창을 놓음.
  // 틀 밖(아트머그) 스크롤 위치는 직접 알 수 없어서, 보이는 영역 감지(IntersectionObserver)로 알아냄
  function placeNear(overlay, box, anchorEl) {
    if (!isTallFrame()) { overlay.classList.remove('near'); box.style.marginTop = ''; box.style.maxHeight = ''; return; }
    var docH = document.documentElement.scrollHeight;
    overlay.classList.add('near');
    overlay.style.height = docH + 'px';
    box.style.visibility = 'hidden';
    var put = function (top, height) {   // 보이는 영역 [top, top+height] 의 가운데로
      box.style.maxHeight = Math.max(240, height - 32) + 'px';
      var y = Math.max(16, Math.min(top + (height - box.offsetHeight) / 2, docH - box.offsetHeight - 16));
      box.style.marginTop = y + 'px';
      box.style.visibility = '';
    };
    var fallback = function () {   // 감지가 안 되면 누른 위치 기준
      var r = anchorEl.getBoundingClientRect();
      put(r.top + window.scrollY + r.height / 2 - 300, 600);
    };
    if (!('IntersectionObserver' in window)) return fallback();
    var io = new IntersectionObserver(function (entries) {
      io.disconnect();
      var v = entries[0].intersectionRect;
      if (v.height > 0) put(v.top + window.scrollY, v.height); else fallback();
    });
    io.observe(document.documentElement);
  }
  // 메뉴 링크: 길게 들어가 있을 때도 아트머그 페이지가 해당 위치로 스크롤되도록
  document.querySelectorAll('.nav a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // 확인 모드: 주소에 ?debug 를 붙이면 아트머그가 준 틀 크기와 페이지 길이를 화면에 표시
  if (/[?&]debug/.test(location.search)) {
    var dbg = document.createElement('div');
    dbg.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;padding:6px 10px;border-radius:6px;background:rgba(0,0,0,.8);color:#fff;font:12px/1.5 monospace;pointer-events:none';
    var showDbg = function () {
      dbg.textContent = '틀 ' + window.innerWidth + '×' + window.innerHeight + 'px · 페이지 ' + document.documentElement.scrollHeight + 'px · ' + (window.self !== window.top ? 'iframe' : '직접 열림');
    };
    document.body.appendChild(dbg);
    showDbg();
    window.addEventListener('resize', showDbg);
    setTimeout(showDbg, 1500);
  }

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
    placeNear(pop, pop.querySelector('.pop-box'), plan);
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

  // 카테고리 필터 + 페이지 넘기기 (한 페이지에 PER_PAGE 개)
  var PER_PAGE = 6;
  var chips = app.querySelectorAll('.chip');
  var cards = app.querySelectorAll('.card');
  var pager = document.getElementById('pager');
  var curCat = '';
  var curPage = 1;

  function showWorks() {
    var list = Array.prototype.filter.call(cards, function (card) {
      return !curCat || card.getAttribute('data-cat') === curCat;
    });
    var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (curPage > pages) curPage = pages;
    cards.forEach(function (card) { card.hidden = true; });
    list.slice((curPage - 1) * PER_PAGE, curPage * PER_PAGE).forEach(function (card) { card.hidden = false; });

    if (pages < 2) { pager.innerHTML = ''; return; }
    var h = '<button type="button" class="page-btn" data-p="' + (curPage - 1) + '"' + (curPage === 1 ? ' disabled' : '') + ' aria-label="이전 페이지">‹</button>';
    for (var p = 1; p <= pages; p++) {
      h += '<button type="button" class="page-btn' + (p === curPage ? ' on' : '') + '" data-p="' + p + '">' + p + '</button>';
    }
    h += '<button type="button" class="page-btn" data-p="' + (curPage + 1) + '"' + (curPage === pages ? ' disabled' : '') + ' aria-label="다음 페이지">›</button>';
    pager.innerHTML = h;
  }

  pager.addEventListener('click', function (e) {
    var btn = e.target.closest('.page-btn');
    if (!btn || btn.disabled) return;
    curPage = +btn.getAttribute('data-p');
    showWorks();
    // 그리드 윗부분이 화면 위로 지나가 있으면 다시 보이게
    var top = document.getElementById('portfolio').getBoundingClientRect().top;
    if (top < 0) document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      curCat = chip.getAttribute('data-cat');
      curPage = 1;
      chips.forEach(function (c) { c.classList.toggle('on', c === chip); });
      showWorks();
    });
  });
  showWorks();

  // 옆으로 넘기는 줄(Collaboration, 공용 모델) 화살표: 한 화면만큼 넘기고, 끝에 닿으면 비활성
  app.querySelectorAll('.collab').forEach(function (box) {
    var track = box.querySelector('.collab-track');
    var prev = box.querySelector('.collab-nav.prev');
    var next = box.querySelector('.collab-nav.next');
    var updateNav = function () {
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
      track.parentNode.classList.toggle('fits', max <= 2);
    };
    prev.addEventListener('click', function () { track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }); setTimeout(updateNav, 500); });
    next.addEventListener('click', function () { track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }); setTimeout(updateNav, 500); });
    track.addEventListener('scroll', updateNav);
    window.addEventListener('resize', updateNav);
    updateNav();
  });

  // 공용 모델 상세 창: 왼쪽 사진/영상, 오른쪽 크레딧·가격·신청
  var shop = document.getElementById('shop');
  var shopVideo = document.getElementById('shop-video');
  var shopModel = null;
  var lastShopCard = null;

  // 영상 멈추기 (유튜브, mp4 파일 둘 다)
  function stopShopVideo() {
    shopVideo.src = 'about:blank';
    shopVideo.removeAttribute('data-id');
    document.getElementById('shop-video-wrap').hidden = true;
    var file = document.getElementById('shop-file');
    file.pause();
    file.removeAttribute('src');
    file.load();
    file.hidden = true;
  }

  // 사진 칸: 큰 사진 바꾸기
  function shopPhoto(src) {
    document.getElementById('shop-photo').src = src;
    shop.querySelectorAll('.shop-thumbs img').forEach(function (t) { t.classList.toggle('on', t.getAttribute('src') === src); });
  }

  // 영상 칸: 유튜브 우선(화질), 없으면 mp4 파일. 자동 재생하지 않고 누르면 재생
  function startShopVideo() {
    var id = youtubeId(shopModel.youtube);
    if (id) {
      document.getElementById('shop-video-wrap').hidden = false;
      shopVideo.src = 'https://www.youtube.com/embed/' + id + '?rel=0';
      shopVideo.setAttribute('data-id', id);
    } else if (shopModel.video) {
      var file = document.getElementById('shop-file');
      file.src = shopModel.video;
      file.hidden = false;
    }
  }

  function openShop(card) {
    var m = models[+card.getAttribute('data-m')];
    var imgs = m.images || [];
    var hasVideo = !!(m.video || youtubeId(m.youtube));
    shopModel = m;
    lastShopCard = card;
    var st = document.getElementById('shop-st');
    st.textContent = m.status || '';
    st.className = 'shop-status ' + statusClass(m.status);
    document.getElementById('shop-name').textContent = m.name || '';
    var opts = String(m.options || '').split('\n').map(function (t) { return t.trim(); }).filter(Boolean);
    document.getElementById('shop-opts').innerHTML = opts.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    document.getElementById('shop-opt-wrap').hidden = !opts.length;
    document.getElementById('shop-credit').textContent = m.credit || '';
    document.getElementById('shop-price').textContent = m.price || '';
    var btn = document.getElementById('shop-apply');
    btn.disabled = m.status === '판매완료';
    btn.textContent = m.status === '판매완료' ? '판매가 완료된 모델이에요' : '이 모델로 신청하기';
    var box = shop.querySelector('.shop-box');
    box.classList.toggle('no-photo', !imgs.length);
    box.classList.toggle('no-video', !hasVideo);
    document.getElementById('shop-photo-col').hidden = !imgs.length;
    document.getElementById('shop-video-col').hidden = !hasVideo;
    document.getElementById('shop-thumbs').innerHTML = imgs.length > 1
      ? imgs.map(function (src) { return '<img src="' + esc(src) + '" alt="">'; }).join('') : '';
    shop.hidden = false;
    document.body.classList.add('lock');
    placeNear(shop, shop.querySelector('.shop-box'), card);
    if (imgs.length) shopPhoto(imgs[0]);
    if (hasVideo) startShopVideo();
    shop.querySelector('.modal-close').focus();
  }

  function closeShop() {
    if (!shop || shop.hidden) return;
    shop.hidden = true;
    stopShopVideo();
    document.body.classList.remove('lock');
    if (lastShopCard) lastShopCard.focus();
  }

  if (shop) {
    app.querySelectorAll('.shop-card').forEach(function (c) {
      c.addEventListener('click', function () { openShop(c); });
    });
    shop.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closeShop); });
    document.getElementById('shop-thumbs').addEventListener('click', function (e) {
      if (e.target.tagName === 'IMG') shopPhoto(e.target.getAttribute('src'));
    });
    // 신청하기: 신청 옵션에서 '공용 모델'을 고르고, 모델 이름 칸을 채운 뒤 양식으로 이동
    document.getElementById('shop-apply').addEventListener('click', function () {
      var label = shared.label || '공용 모델';
      var opt = Array.prototype.filter.call(app.querySelectorAll('.apply-opt'), function (b) {
        return b.getAttribute('data-v') === label;
      })[0];
      if (opt && !opt.classList.contains('on')) opt.click();
      fields.forEach(function (f, i) {
        if (f.key === 'sharedModel') {
          var el = app.querySelector('.apply-input[data-f="' + i + '"]');
          if (el) { el.value = shopModel.name || ''; el.dispatchEvent(new Event('input')); }
        }
      });
      closeShop();
      document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
    });
  }

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
    placeNear(modal, modal.querySelector('.modal-box'), card);
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
    if (e.key === 'Escape') { close(); closePop(); closeShop(); }
  });
  }
})();
