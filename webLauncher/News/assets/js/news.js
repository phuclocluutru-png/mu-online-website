(function(){
  var listEl = document.getElementById('news-list');
  var tabs = document.querySelectorAll('.news-tab');
  var catMap = {};
  // Dùng proxy cùng domain để tránh CORS/TLS trên WebBrowser của launcher.
  var PROXY_URL = '/mu/webLauncher/News/proxy.php';

  function httpGetJSON(url, onSuccess, onError){
    try{
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function(){
        if (xhr.readyState === 4){
          if (xhr.status >= 200 && xhr.status < 300){
            try { onSuccess && onSuccess(JSON.parse(xhr.responseText)); }
            catch(e){ onError && onError(e); }
          } else {
            onError && onError(new Error('HTTP '+xhr.status));
          }
        }
      };
      xhr.open('GET', url, true);
      xhr.send();
    }catch(e){ if(onError) onError(e); }
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
    var html = '';
    for (var i=0;i<posts.length;i++){
      var p = posts[i];
      var title = (p.title && p.title.rendered) ? p.title.rendered : 'Bài viết';
      var link = '/pages/post.html?id='+p.id;
      html += '<a class="news-item" href="'+link+'" target="_blank" rel="noopener">'
           +   '<span class="news-item__text">'+title+'</span>'
           + '</a>';
    }
    listEl.innerHTML = html;
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
          for(var j=0;j<tabs.length;j++){
            tabs[j].classList.remove('is-active');
            tabs[j].setAttribute('aria-selected','false');
          }
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

  if(document.readyState === 'complete' || document.readyState === 'interactive') init();
  else if(document.addEventListener) document.addEventListener('DOMContentLoaded', init);
  else if(document.attachEvent) document.attachEvent('onreadystatechange', function(){ if(document.readyState === 'complete') init(); });
})();
