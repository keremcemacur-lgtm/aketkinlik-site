// AKetkinlik paylaşım bağlantıları: uygulamayı açmayı dener, yoksa kod/yükleme yolunu gösterir.
// Yalnızca herkese açık (anon) sorgular kullanılır; kişisel veri gösterilmez (davet edenin yalnızca ilk adı).
(function () {
  var SB = 'https://uuowaqhrezlbafevoqfp.supabase.co';
  var KEY = 'sb_publishable_ewHHCznhVpGxwj-Xr_j-pg_12LwJp1x';
  var PKG = 'com.aketkinlik.app';
  var PLAY = 'https://play.google.com/store/apps/details?id=' + PKG;
  var android = /android/i.test(navigator.userAgent);
  var $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  var mode = document.body.getAttribute('data-mode');

  function appUrl(path) {
    return android
      ? 'intent://' + path + '#Intent;scheme=aketkinlik;package=' + PKG + ';S.browser_fallback_url=' + encodeURIComponent(PLAY) + ';end'
      : 'aketkinlik://' + path;
  }
  function fmt(iso) {
    try {
      return new Date(iso).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + ' TSİ';
    } catch (e) { return ''; }
  }
  function show(card) {
    $('t').textContent = card.title || 'AKetkinlik';
    if (card.kicker) $('k').textContent = card.kicker;
    var meta = [card.when, card.where, card.org].filter(Boolean);
    $('m').innerHTML = '';
    meta.forEach(function (x) { var li = document.createElement('li'); li.textContent = x; $('m').appendChild(li); });
    if (card.title) document.title = card.title + ' · AKetkinlik';
  }
  function rpc(name, body) {
    return fetch(SB + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.ok ? r.json() : null; });
  }

  var path = null;
  if (mode === 'davet') {
    var code = (q.get('k') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) { $('t').textContent = 'Davet kodu eksik ya da hatalı'; $('open').style.display = 'none'; return; }
    path = 'davet/' + code;
    $('code').textContent = code; $('codebox').style.display = 'block';
    rpc('invite_preview', { p_code: code }).then(function (p) {
      if (!p) { $('k').textContent = 'Davetiye'; $('t').textContent = 'Bu davetiye artık geçerli değil'; return; }
      show({ kicker: (p.inviter_name || 'Bir arkadaşın') + ' seni çağırıyor', title: p.title, when: fmt(p.start_at),
        where: [p.district, p.city].filter(Boolean).join(', '), org: p.organization_name });
    }).catch(function () {});
  } else {
    var id = (q.get('id') || '').toLowerCase();
    if (!/^[0-9a-f-]{36}$/.test(id)) { $('t').textContent = 'Etkinlik bağlantısı hatalı'; $('open').style.display = 'none'; return; }
    path = 'event/' + id;
    fetch(SB + '/rest/v1/events_feed?select=title,start_at,district,city,organization_name,status&id=eq.' + id, { headers: { apikey: KEY } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        var e = rows && rows[0]; if (!e) return;
        show({ kicker: e.status === 'cancelled' ? 'İptal edildi' : 'Etkinlik', title: String(e.title || '').replace(/^\[DEMO\]\s*/, ''),
          when: fmt(e.start_at), where: [e.district, e.city].filter(Boolean).join(', '), org: e.organization_name });
      }).catch(function () {});
  }
  $('open').href = appUrl(path);
  $('play').href = PLAY;
  // Bir kez otomatik dene (uygulama yüklüyse doğrudan açılır); olmazsa sayfa yerinde kalır.
  setTimeout(function () { if (!document.hidden) location.href = appUrl(path); }, 350);
})();
