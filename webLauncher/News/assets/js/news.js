(function(){
  // Đơn giản cho WebBrowser (không dùng fetch/Promise phức tạp)
  var API_BASE = 'https://pkclear.com/wp-json/wp/v2';
  var listEl = document.getElementById('news-list');
  var tabs = document.querySelectorAll('.news-tab');
  var catMap = {};

  function httpGetJSON(url, onSuccess, onError, triedFallback){
    try{
      var done = false;
      function success(data){ if(done) return; done=true; if(onSuccess) onSuccess(data); }
      function fail(err){ if(done) return; done=true; if(onError) onError(err); }
      if(window.XDomainRequest){
        var xdr = new XDomainRequest();
        xdr.onload = function(){ try{ success(JSON.parse(xdr.responseText)); }catch(e){ fail(e); } };
        xdr.onerror = function(){
          if(!triedFallback && url.indexOf('https://') === 0){
            httpGetJSON(url.replace('https://','http://'), onSuccess, onError, true);
            return;
          }
          fail(new Error('XDR error'));
        };
        xdr.open('GET', url);
        xdr.send();
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
          if(xhr.status >=200 && xhr.status <300){
            try{ success(JSON.parse(xhr.responseText)); } catch(e){ fail(e); }
          } else {
            if(!triedFallback && url.indexOf('https://') === 0){
              httpGetJSON(url.replace('https://','http://'), onSuccess, onError, true);
              return;
            }
            fail(new Error('HTTP '+xhr.status));
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
  }

  function fetchCategories(cb){
    httpGetJSON(API_BASE + '/categories?per_page=100', function(json){
      catMap = {};
      if(json && json.length){
        for(var i=0;i<json.length;i++){ catMap[json[i].slug] = json[i].id; }
      }
      if(cb) cb();
    }, function(){ if(cb) cb(); });
  }

  function loadTab(key){
    setLoading('Đang tải bài viết...');
    var url;
    if(key==='latest'){
      url = API_BASE + '/posts?per_page=20&_embed';
    } else {
      var catId = catMap[key];
      if(!catId){ renderPosts([]); return; }
      url = API_BASE + '/posts?per_page=20&categories='+catId+'&_embed';
    }
    httpGetJSON(url, function(json){ renderPosts(json||[]); }, function(err){
      if(listEl) listEl.innerHTML = '<div class="news-empty">Lỗi tải dữ liệu.</div>';
    });
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
  else document.attachEvent('onreadystatechange', function(){ if(document.readyState==='complete') init(); });
})();
