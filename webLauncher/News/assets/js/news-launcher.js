(function(){
  var listEl = document.getElementById('news-list');
  var tabs = document.querySelectorAll('.news-tab');
  var catMap = {};
  // Build proxy URL cùng host để tránh mixed-content; fallback đổi https <-> http khi lỗi
  var baseHost = (location && location.host) ? (location.protocol + '//' + location.host) : 'https://pkclear.com';
  var PROXY_URL = baseHost + '/mu/webLauncher/News/proxy.php';

  function httpGetJSON(url, onSuccess, onError, triedSwitch){
    try{
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
          if(xhr.status >=200 && xhr.status <300){
            try{ onSuccess && onSuccess(JSON.parse(xhr.responseText)); } catch(e){ onError && onError(e); }
          } else {
            if(!triedSwitch && url.indexOf('https://') === 0){
              httpGetJSON(url.replace('https://','http://'), onSuccess, onError, true);
              return;
            }
            if(!triedSwitch && url.indexOf('http://') === 0){
              httpGetJSON(url.replace('http://','https://'), onSuccess, onError, true);
              return;
            }
            onError && onError(new Error('HTTP '+xhr.status));
          }
        }
      };
      xhr.open('GET', url, true);
      xhr.send();
    }catch(e){ if(onError) onError(e); }
  }

  function fmtDate(str){
    if(!str) return '';
    try{
      var d = new Date(str);
      if(isNaN(d.getTime())) return '';
      var dd=('0'+d.getDate()).slice(-2);
      var mm=('0'+(d.getMonth()+1)).slice(-2);
      var yy=d.getFullYear();
      return dd+'/'+mm+'/'+yy;
    }catch(e){ return ''; }
  }

  function setLoading(msg){
    if(!listEl) return;
    listEl.innerHTML = '<div class="news-loading">'+(msg||'Đang tải...')+'</div>';
  }

  function renderPosts(posts){
    if(!listEl) return;
    if(!posts || !posts.length){
      listEl.innerHTML = '<div class="news-empty">Chưa có bài viết.</div>';
      return;
    }
    var html='';
    for(var i=0;i<posts.length;i++){
      var p = posts[i];
      var title = (p.title && p.title.rendered) ? p.title.rendered : 'Bài viết';
      var link = '/pages/post.html?id='+p.id;
      var date = fmtDate(p.date);
      html += '<a class="news-item" href="'+link+'" target="_blank" rel="noopener">'
           +   '<span class="news-item__text">'+title+'</span>'
           +   '<span class="news-item__date">'+date+'</span>'
           + '</a>';
    }
    listEl.innerHTML = html;
    attachLinkHandler();
  }

  function attachLinkHandler(){
    if(!listEl) return;
    listEl.onclick = function(e){
      e = e || window.event;
      var target = e.target || e.srcElement;
      while (target && target !== listEl && target.tagName && target.tagName.toLowerCase() !== 'a') {
        target = target.parentNode;
      }
      if (target && target.tagName && target.tagName.toLowerCase() === 'a') {
        if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        var url = target.getAttribute('href');
        try {
          if (window.external && typeof window.external.Navigate === 'function') {
            window.external.Navigate(url);
            return false;
          }
        } catch(err){}
        try { window.open(url, '_blank'); } catch(err2) { window.location.href = url; }
        return false;
      }
    };
  }

  function fetchCategories(cb){
    httpGetJSON(PROXY_URL + '?action=categories', function(json){
      catMap = {};
      if(json && json.length){
        for(var i=0;i<json.length;i++){ catMap[json[i].slug] = json[i].id; }
      }
      cb && cb();
    }, function(){ cb && cb(); });
  }

  function loadTab(key){
    setLoading('Đang tải bài viết...');
    var url = PROXY_URL + '?action=posts';
    if(key && key !== 'latest'){
      var catId = catMap[key];
      if(!catId){ renderPosts([]); return; }
      url += '&cat='+catId;
    }
    httpGetJSON(url, function(json){ renderPosts(json||[]); }, function(){ if(listEl) listEl.innerHTML = '<div class="news-empty">Lỗi tải dữ liệu.</div>'; });
  }

  function initTabs(){
    for(var i=0;i<tabs.length;i++){
      (function(btn){
        btn.onclick = function(){
          for(var j=0;j<tabs.length;j++){ tabs[j].classList.remove('is-active'); tabs[j].setAttribute('aria-selected','false'); }
          btn.classList.add('is-active');
          btn.setAttribute('aria-selected','true');
          loadTab(btn.getAttribute('data-key'));
        };
      })(tabs[i]);
    }
  }

  function init(){
    if(!listEl) return;
    initTabs();
    fetchCategories(function(){ loadTab('latest'); });
  }

  if(document.readyState==='complete' || document.readyState==='interactive') init();
  else if(document.addEventListener) document.addEventListener('DOMContentLoaded', init);
  else if(document.attachEvent) document.attachEvent('onreadystatechange', function(){ if(document.readyState==='complete') init(); });
})();
