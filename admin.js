// 관리자 페이지: 비밀번호로 잠긴 GitHub 토큰을 풀어서 content.json 과 사진을 저장소에 직접 저장합니다.
(function () {
  var OWNER = 'Jiho6362';
  var REPO = 'commision';
  var BRANCH = 'main';
  var KEY_FILE = 'admin-key.json';   // 비밀번호로 암호화한 토큰 (공개돼도 비밀번호 없이는 못 씀)
  var DATA_FILE = 'content.json';
  var ITER = 310000;                 // 비밀번호 → 암호 키 변환 반복 횟수 (높을수록 무차별 대입에 강함)
  var TOKEN_KEY = 'adm-token';

  var $ = function (id) { return document.getElementById(id); };
  var token = null;
  var data = null;        // 편집 중인 content.json
  var loadedSha = null;   // 불러올 때의 content.json 버전
  var pending = {};       // 아직 저장 안 한 사진 { 경로: base64 }
  var previews = {};      // 사진 미리보기 { 경로: dataURL }
  var dirty = false;
  var tab = 'profile';

  // ---------- 공통 도구 ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function msg(id, text, kind) {
    var el = $(id);
    el.textContent = text || '';
    el.className = 'adm-msg' + (kind ? ' ' + kind : '');
  }
  function show(view) {
    ['view-setup', 'view-login', 'view-edit'].forEach(function (v) { $(v).hidden = v !== view; });
    $('logout').hidden = view !== 'view-edit';
  }
  function youtubeId(url) {
    var s = String(url || '').trim();
    var m = s.match(/(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(s) ? s : '';
  }
  function bufToB64(buf) {
    var bytes = new Uint8Array(buf), bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function b64ToBytes(b64) {
    var bin = atob(String(b64).replace(/\s/g, '')), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  function utf8ToB64(str) { return bufToB64(new TextEncoder().encode(str)); }
  function b64ToUtf8(b64) { return new TextDecoder().decode(b64ToBytes(b64)); }

  // ---------- 비밀번호 암호화 ----------
  async function deriveKey(pw, salt, iter) {
    var base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function encryptToken(tok, pw) {
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var key = await deriveKey(pw, salt, ITER);
    var enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(tok));
    return { v: 1, iter: ITER, salt: bufToB64(salt), iv: bufToB64(iv), data: bufToB64(enc) };
  }
  async function decryptToken(blob, pw) {
    var key = await deriveKey(pw, b64ToBytes(blob.salt), blob.iter);
    var dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(blob.iv) }, key, b64ToBytes(blob.data));
    return new TextDecoder().decode(dec);
  }

  // ---------- GitHub API ----------
  async function gh(path, opts, tok) {
    opts = opts || {};
    var headers = {
      Authorization: 'Bearer ' + (tok || token),
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (opts.body) headers['Content-Type'] = 'application/json';
    var r = await fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + path,
      { method: opts.method || 'GET', headers: headers, body: opts.body, cache: 'no-store' });
    if (!r.ok) { var e = new Error('GitHub ' + r.status); e.status = r.status; throw e; }
    return r.status === 204 ? null : r.json();
  }
  async function getFile(path, tok) {
    return gh('/contents/' + encodeURIComponent(path).replace(/%2F/g, '/') + '?ref=' + BRANCH, null, tok);
  }
  async function putFile(path, b64, message, sha, tok) {
    var body = { message: message, content: b64, branch: BRANCH };
    if (sha) body.sha = sha;
    return gh('/contents/' + encodeURIComponent(path).replace(/%2F/g, '/'), { method: 'PUT', body: JSON.stringify(body) }, tok);
  }

  // ---------- 처음 설정 ----------
  $('setup-go').addEventListener('click', async function () {
    var tok = $('setup-token').value.trim(), pw = $('setup-pw').value, pw2 = $('setup-pw2').value;
    if (!tok) return msg('setup-msg', 'GitHub 토큰을 넣어 주세요.', 'err');
    if (pw.length < 10) return msg('setup-msg', '비밀번호는 10자 이상으로 정해 주세요.', 'err');
    if (pw !== pw2) return msg('setup-msg', '비밀번호 확인이 맞지 않아요.', 'err');
    this.disabled = true;
    msg('setup-msg', '토큰을 확인하는 중...');
    try {
      await getFile(DATA_FILE, tok);
      var blob = await encryptToken(tok, pw);
      var old = null;
      try { old = await getFile(KEY_FILE, tok); } catch (e) { if (e.status !== 404) throw e; }
      await putFile(KEY_FILE, utf8ToB64(JSON.stringify(blob, null, 2) + '\n'), 'Update admin key', old && old.sha, tok);
      msg('setup-msg', '등록됐어요. 1~2분 뒤 이 비밀번호로 로그인할 수 있어요.', 'ok');
      $('setup-token').value = '';
    } catch (e) {
      msg('setup-msg', e.status === 401 ? '토큰이 올바르지 않아요.' :
        e.status === 403 || e.status === 404 ? '토큰에 이 저장소(' + REPO + ')의 Contents 읽기/쓰기 권한이 없어요.' :
        '등록하지 못했어요. (' + e.message + ')', 'err');
    }
    this.disabled = false;
  });

  // ---------- 로그인 / 로그아웃 ----------
  var keyBlob = null;

  async function login() {
    var pw = $('login-pw').value;
    if (!pw) return;
    $('login-go').disabled = true;
    msg('login-msg', '확인하는 중...');
    try {
      var tok;
      try { tok = await decryptToken(keyBlob, pw); }
      catch (e) { throw Object.assign(new Error('pw'), { pw: true }); }
      token = tok;
      await loadData();
      ($('login-remember').checked ? localStorage : sessionStorage).setItem(TOKEN_KEY, tok);
      $('login-pw').value = '';
      startEdit();
    } catch (e) {
      token = null;
      msg('login-msg', e.pw ? '비밀번호가 맞지 않아요.' :
        e.status === 401 ? '저장 열쇠(토큰)가 만료됐어요. 저장소 주인에게 다시 등록을 부탁해 주세요.' :
        '불러오지 못했어요. (' + e.message + ')', 'err');
    }
    $('login-go').disabled = false;
  }
  $('login-go').addEventListener('click', login);
  $('login-pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') login(); });

  $('logout').addEventListener('click', function () {
    if (dirty && !confirm('저장하지 않은 내용이 있어요. 로그아웃할까요?')) return;
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    dirty = false;
    location.href = 'admin.html';
  });

  // ---------- 불러오기 ----------
  async function loadData() {
    var f = await getFile(DATA_FILE);
    data = JSON.parse(b64ToUtf8(f.content));
    data.about = data.about || {};
    data.works = data.works || [];
    data.collabs = data.collabs || [];
    loadedSha = f.sha;
    sortWorks();
    pending = {};
    previews = {};
    setDirty(false);
  }

  function startEdit() {
    show('view-edit');
    render();
  }

  function setDirty(v) {
    dirty = v;
    $('save').disabled = !v;
    if (v) msg('save-msg', '저장하지 않은 변경 사항이 있어요.');
  }

  // ---------- 사진 처리: 정사각형으로 자르고 줄이기 ----------
  function processImage(file, size) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var m = Math.min(img.width, img.height);
        var c = document.createElement('canvas');
        c.width = c.height = size;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = function () { reject(new Error('사진을 읽지 못했어요.')); };
      img.src = URL.createObjectURL(file);
    });
  }
  async function attachImage(file, size, folder, assign) {
    var url = await processImage(file, size);
    var path = folder + Date.now() + '.jpg';
    pending[path] = url.split(',')[1];
    previews[path] = url;
    assign(path);
    setDirty(true);
    render();
  }
  function imgSrc(path) { return previews[path] || path; }

  // ---------- 화면 그리기 ----------
  function field(label, path, value, type) {
    if (type === 'textarea') {
      return '<label>' + label + '<textarea data-path="' + path + '" rows="3">' + esc(value) + '</textarea></label>';
    }
    return '<label>' + label + '<input type="text" data-path="' + path + '" value="' + esc(value) + '"></label>';
  }
  function tools(kind, i, len) {
    var noUp = i === 0, noDown = i === len - 1;
    if (kind === 'works') {   // 포트폴리오는 같은 카테고리 안에서만 이동
      noUp = noUp || catRank(data.works[i - 1]) !== catRank(data.works[i]);
      noDown = noDown || catRank(data.works[i + 1]) !== catRank(data.works[i]);
    }
    return '<div class="adm-tools">' +
      '<button type="button" data-act="up" data-kind="' + kind + '" data-i="' + i + '"' + (noUp ? ' disabled' : '') + '>↑ 위로</button>' +
      '<button type="button" data-act="down" data-kind="' + kind + '" data-i="' + i + '"' + (noDown ? ' disabled' : '') + '>↓ 아래로</button>' +
      '<button type="button" class="del" data-act="del" data-kind="' + kind + '" data-i="' + i + '">삭제</button></div>';
  }
  function avatar(path, name) {
    return path ? '<img class="adm-avatar" src="' + esc(imgSrc(path)) + '" alt="">'
      : '<span class="adm-avatar serif">' + esc(String(name || '').charAt(0)) + '</span>';
  }

  function render() {
    document.querySelectorAll('.adm-tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === tab); });
    var h = '';
    if (tab === 'profile') {
      var a = data.about;
      h = '<div class="adm-item profile"><div>' + avatar(a.image, a.name) +
        '<label class="adm-file" style="margin-top:10px">사진 바꾸기<input type="file" accept="image/*" data-img="profile"></label></div>' +
        '<div class="adm-fields">' +
        '<div class="adm-row2">' + field('이름', 'about.name', a.name) + field('이름 옆 작은 글씨', 'about.subname', a.subname) + '</div>' +
        field('이름 위 작은 문구', 'about.role', a.role) +
        field('소개글 (엔터로 줄바꿈)', 'about.intro', a.intro, 'textarea') +
        field('태그 (쉼표로 구분)', 'about.tags', (a.tags || []).join(', ')) +
        '</div></div>';
    } else if (tab === 'works') {
      var cats = (data.price && data.price.options || []).map(function (o) { return o.name; });
      h = '<p class="adm-help">작업물은 카테고리 순서(' + esc(cats.join(' → ')) + ')로 자동 정렬돼요. ↑↓ 는 같은 카테고리 안에서 순서를 바꿔요. 유튜브 주소를 비워 두면 \'비어있음\' 칸으로 보여요.</p>' +
        '<button type="button" class="adm-btn ghost adm-add" data-act="add" data-kind="works">+ 작업물 추가</button>' +
        '<datalist id="cats">' + cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist>' +
        '<div class="adm-list" style="margin-top:12px">' + data.works.map(function (w, i) {
          var id = youtubeId(w.youtube);
          return '<div class="adm-item"><div>' +
            (id ? '<img class="adm-thumb" src="https://img.youtube.com/vi/' + id + '/hqdefault.jpg" alt="">' : '<span class="adm-thumb" style="display:block"></span>') +
            '</div><div class="adm-fields">' +
            field('유튜브 주소', 'works.' + i + '.youtube', w.youtube) +
            '<div class="adm-row2">' + field('제목', 'works.' + i + '.title', w.title) +
            '<label>카테고리<input type="text" list="cats" data-path="works.' + i + '.category" value="' + esc(w.category) + '"></label></div>' +
            field('크레딧 (엔터로 줄바꿈)', 'works.' + i + '.credit', w.credit, 'textarea') +
            tools('works', i, data.works.length) + '</div></div>';
        }).join('') + '</div>';
    } else if (tab === 'settings') {
      h = '<div class="adm-card"><h2>비밀번호 바꾸기</h2>' +
        '<label>새 비밀번호 (10자 이상)<input type="password" id="pw-new" autocomplete="new-password"></label>' +
        '<label>새 비밀번호 확인<input type="password" id="pw-new2" autocomplete="new-password"></label>' +
        '<button type="button" class="adm-btn" id="pw-change">바꾸기</button>' +
        '<p class="adm-msg" id="pw-msg"></p>' +
        '<p class="adm-help">바꾼 뒤 1~2분 지나면 새 비밀번호로 로그인해요. 지금 로그인은 그대로 유지돼요.</p></div>';
    } else {
      h = '<p class="adm-help">사진은 올리면 자동으로 정사각형으로 잘리고 작게 줄여져요.</p>' +
        '<div class="adm-list">' + data.collabs.map(function (c, i) {
          return '<div class="adm-item"><div>' + avatar(c.image, c.name) +
            '<label class="adm-file" style="margin-top:8px">사진<input type="file" accept="image/*" data-img="collab" data-i="' + i + '"></label></div>' +
            '<div class="adm-fields">' +
            '<div class="adm-row2">' + field('이름', 'collabs.' + i + '.name', c.name) + field('역할 태그 (선택)', 'collabs.' + i + '.role', c.role) + '</div>' +
            field('아트머그 작가 페이지 주소', 'collabs.' + i + '.link', c.link) +
            tools('collabs', i, data.collabs.length) + '</div></div>';
        }).join('') + '</div>' +
        '<button type="button" class="adm-btn ghost adm-add" data-act="add" data-kind="collabs">+ 아티스트 추가</button>';
    }
    $('panel').innerHTML = h;
  }

  // 포트폴리오 자동 정렬: 가격표 옵션 순서(Light → Standard → Premium → Wallpaper)대로, 같은 카테고리 안의 순서는 유지
  function catRank(w) {
    var order = (data.price && data.price.options || []).map(function (o) { return o.name; });
    var r = order.indexOf(String(w.category || '').trim());
    return r < 0 ? order.length : r;
  }
  function sortWorks() {
    var sorted = data.works.map(function (w, j) { return { w: w, j: j }; })
      .sort(function (a, b) { return catRank(a.w) - catRank(b.w) || a.j - b.j; })
      .map(function (x) { return x.w; });
    data.works.splice.apply(data.works, [0, data.works.length].concat(sorted));
  }

  // 입력: data-path 가 가리키는 곳에 값 저장
  $('panel').addEventListener('input', function (e) {
    var path = e.target.getAttribute('data-path');
    if (!path) return;
    var keys = path.split('.'), obj = data;
    for (var i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    var last = keys[keys.length - 1], v = e.target.value;
    obj[last] = path === 'about.tags' ? v.split(',').map(function (t) { return t.trim(); }).filter(Boolean) : v;
    setDirty(true);
    if (/^works\.\d+\.youtube$/.test(path)) {
      var thumb = e.target.closest('.adm-item').querySelector('.adm-thumb');
      var id = youtubeId(v);
      if (id && thumb.tagName === 'IMG') thumb.src = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
      else if (id) render();
    }
  });

  // 버튼: 위/아래/삭제/추가
  $('panel').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var kind = b.getAttribute('data-kind'), list = data[kind], i = +b.getAttribute('data-i'), act = b.getAttribute('data-act');
    if (act === 'up' && i > 0) list.splice(i - 1, 0, list.splice(i, 1)[0]);
    else if (act === 'down' && i < list.length - 1) list.splice(i + 1, 0, list.splice(i, 1)[0]);
    else if (act === 'del') {
      var name = kind === 'works' ? (list[i].title || '이 작업물') : (list[i].name || '이 아티스트');
      if (!confirm('"' + name + '"을(를) 삭제할까요? (저장해야 사이트에 반영돼요)')) return;
      list.splice(i, 1);
    } else if (act === 'add') {
      if (kind === 'works') list.unshift({ youtube: '', title: '', category: '', credit: 'Rigged by 4ki' });
      else list.push({ name: '', link: '', role: '', image: '' });
    } else return;
    setDirty(true);
    render();
  });

  // 비밀번호 바꾸기: 지금 풀려 있는 토큰을 새 비밀번호로 다시 잠가 저장
  $('panel').addEventListener('click', async function (e) {
    if (e.target.id !== 'pw-change') return;
    var pw = $('pw-new').value, pw2 = $('pw-new2').value;
    if (pw.length < 10) return msg('pw-msg', '비밀번호는 10자 이상으로 정해 주세요.', 'err');
    if (pw !== pw2) return msg('pw-msg', '비밀번호 확인이 맞지 않아요.', 'err');
    e.target.disabled = true;
    msg('pw-msg', '바꾸는 중...');
    try {
      var blob = await encryptToken(token, pw);
      var old = await getFile(KEY_FILE);
      await putFile(KEY_FILE, utf8ToB64(JSON.stringify(blob, null, 2) + '\n'), 'Change admin password', old.sha);
      $('pw-new').value = $('pw-new2').value = '';
      msg('pw-msg', '바꿨어요. 다음 로그인부터 새 비밀번호를 써 주세요.', 'ok');
    } catch (err) {
      msg('pw-msg', err.status === 401 ? '로그인이 만료됐어요. 다시 로그인해 주세요.' : '바꾸지 못했어요. (' + err.message + ')', 'err');
    }
    e.target.disabled = false;
  });

  // 카테고리 입력을 마치면 제자리로 이동
  $('panel').addEventListener('change', function (e) {
    var path = e.target.getAttribute('data-path') || '';
    if (/^works\.\d+\.category$/.test(path)) { sortWorks(); render(); }
  });

  // 사진 올리기
  $('panel').addEventListener('change', function (e) {
    var kind = e.target.getAttribute('data-img');
    var file = e.target.files && e.target.files[0];
    if (!kind || !file) return;
    var p = kind === 'profile'
      ? attachImage(file, 480, 'images/profile-', function (path) { data.about.image = path; })
      : attachImage(file, 240, 'images/collab/', function (path) { data.collabs[+e.target.getAttribute('data-i')].image = path; });
    p.catch(function (err) { alert(err.message); });
  });

  document.querySelectorAll('.adm-tabs button').forEach(function (b) {
    b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); render(); });
  });

  // ---------- 저장 ----------
  $('save').addEventListener('click', async function () {
    var btn = this;
    var bad = data.collabs.filter(function (c) { return !String(c.name || '').trim(); }).length;
    if (bad) return msg('save-msg', '이름이 빈 아티스트가 있어요. 이름을 넣거나 삭제해 주세요.', 'err');
    btn.disabled = true;
    msg('save-msg', '저장하는 중...');
    try {
      var cur = await getFile(DATA_FILE);
      if (cur.sha !== loadedSha &&
          !confirm('관리자 페이지를 연 뒤에 다른 곳에서 내용이 바뀌었어요. 지금 내용으로 덮어쓸까요?')) {
        btn.disabled = false;
        return msg('save-msg', '저장을 취소했어요. 새로고침하면 최신 내용을 불러와요.', 'err');
      }
      var paths = Object.keys(pending);
      for (var i = 0; i < paths.length; i++) {
        msg('save-msg', '사진 올리는 중... (' + (i + 1) + '/' + paths.length + ')');
        await putFile(paths[i], pending[paths[i]], 'Upload image via admin');
        delete pending[paths[i]];
      }
      sortWorks();
      var res = await putFile(DATA_FILE, utf8ToB64(JSON.stringify(data, null, 2) + '\n'), 'Update content via admin', cur.sha);
      loadedSha = res.content.sha;
      setDirty(false);
      msg('save-msg', '저장됐어요. 1~2분 뒤 사이트에 반영돼요.', 'ok');
    } catch (e) {
      btn.disabled = false;
      msg('save-msg', e.status === 401 ? '로그인이 만료됐어요. 다시 로그인해 주세요.' : '저장하지 못했어요. (' + e.message + ')', 'err');
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  // ---------- 시작 ----------
  (async function init() {
    if (/[?&]setup/.test(location.search)) return show('view-setup');
    try {
      var r = await fetch(KEY_FILE + '?t=' + Date.now(), { cache: 'no-store' });
      if (r.status === 404) return show('view-setup');
      keyBlob = await r.json();
    } catch (e) { return show('view-setup'); }
    var saved = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (saved) {
      token = saved;
      try { await loadData(); return startEdit(); }
      catch (e) { token = null; sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); }
    }
    show('view-login');
    $('login-pw').focus();
  })();
})();
