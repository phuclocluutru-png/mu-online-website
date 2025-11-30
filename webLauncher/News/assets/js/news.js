(function(){
  var API_BASE = 'https://pkclear.com/wp-json/wp/v2';
  var tabs = [
    { key: 'latest', label: 'Mới nhất' },
    { key: 'tin-tuc-cap-nhat', label: 'Tin tức & cập nhật' },
    { key: 'su-kien', label: 'Sự kiện' },
    { key: 'huong-dan', label: 'Hướng dẫn' },
    { key: 'nhan-vat', label: 'Nhân vật' }
  ];
  var catMap = {};
  var listEl = document.getElementById('news-list');
  var loadingClass = 'news-loading';

  function fmtDate(str){
    if(!str) return '';
    try{
      var d=new Date(str);
      if(isNaN(d.getTime())) return '';
      var dd=('0'+d.getDate()).slice(-2);
      var mm=('0'+(d.getMonth()+1)).slice(-2);
      var yy=d.getFullYear();
      return dd+'/'+mm+'/'+yy;
    }catch(e){return ''}
  }

  function setLoading(msg){
    if(!listEl) return;
    listEl.innerHTML = '<div class="'+loadingClass+'">'+(msg||'Đang tải...')+'</div>';
  }

  function renderPosts(posts){
    if(!listEl) return;
    if(!posts || !posts.length){
      listEl.innerHTML = '<div class="news-empty">Chưa có bài viết.</div>';
      return;
    }
    var html = posts.map(function(p){
      var title = (p.title && p.title.rendered) ? p.title.rendered : 'Bài viết';
      var link = '/pages/post.html?id='+p.id;
      var date = fmtDate(p.date);
      return '<a class="news-item" href="'+link+'" target="_blank" rel="noopener">'
           +   '<span class="news-item__text">'+title+'</span>'
           +   '<span class="news-item__date">'+date+'</span>'
           + '</a>';
    }).join('');
    listEl.innerHTML = html;
  }

  function fetchCategories(){
    return fetch(API_BASE + '/categories?per_page=100').then(function(r){return r.json();}).then(function(json){
      catMap = {};
      json.forEach(function(c){ catMap[c.slug]=c.id; });
      return catMap;
    }).catch(function(){ return {}; });
  }

  function loadTab(key){
    setLoading('Đang tải bài viết...');
    var url;
    if(key==='latest'){
      url = API_BASE + '/posts?per_page=20&_embed';
    } else {
      var catId = catMap[key];
      if(!catId){
        renderPosts([]);
        return;
      }
      url = API_BASE + '/posts?per_page=20&categories='+catId+'&_embed';
    }
    fetch(url).then(function(r){return r.json();}).then(function(json){
      renderPosts(json || []);
    }).catch(function(){
      if(listEl) listEl.innerHTML = '<div class="news-empty">Lỗi tải dữ liệu.</div>';
    });
  }

  function initTabs(){
    var btns = document.querySelectorAll('.news-tab');
    for(var i=0;i<btns.length;i++){
      (function(btn){
        btn.addEventListener('click', function(){
          for(var j=0;j<btns.length;j++){ btns[j].classList.remove('is-active'); btns[j].setAttribute('aria-selected','false'); }
          btn.classList.add('is-active');
          btn.setAttribute('aria-selected','true');
          loadTab(btn.getAttribute('data-key'));
        });
      })(btns[i]);
    }
  }

  function init(){
    if(!listEl) return;
    initTabs();
    fetchCategories().then(function(){ loadTab('latest'); });
  }

  if(document.readyState==='complete' || document.readyState==='interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
