/**
 * author: xusf
 * description: 新闻列表
 */

// 函数防抖
function debounce(fn, delay) {
    var timer = null;
    return function () {
        timer && clearTimeout(timer);
        var context = this,         // 将执行环境指向当前dom
            arg = arguments;        // 事件e
        timer = setTimeout(function () {
            fn.call(context, arg);
        }, delay);
    }
}

// 检测某个元素是否出现在视口内
function isAppear(container, ele) {
    return container.clientHeight + container.scrollTop >= ele.offsetTop;
}

/**
 * 加载新闻列表数据
 * @param {*} curPage 
 * @param {*} perPageCount 
 */
function loadData(curPage, perPageCount) {
    var data = {
        app_key: '1271687855',
        num: perPageCount,
        page: curPage
    };

    var script = document.createElement('script');
    script.src = 'http://platform.sina.com.cn/slide/album_tech?jsoncallback=dataHandle' + getParam(data);
    document.body.appendChild(script);
    document.body.removeChild(script);
}

// 将对象转换为“键-值”对参数
function getParam(data) {
    var str = '';
    for (var key in data) {
        str += '&' + key + '=' + data[key];
    }
    return str;
}

// JSONP跨域-回调函数
function dataHandle(response) {
    if (response.status && response.status.code == 0) {
        // 请求成功
        WaterFull.render(response.data);
    }

}

// 函数封装
var WaterFull = (function () {
    var curPage = 1,                    // 当前页
        perPageCount = 10;              // 每页记录数

    var listArea = '',                  // 存放新闻列表容器
        listAreaW = '',                 // 宽度
        container = '',                 // 视口容器    
        itemW = '',                     // 元素宽度
        column = '',                    // 列数
        target = '',                    // 目标元素（用来判断目标元素是否进入视口）
        columnArr = [];                 // 存放每列数据（各列数据的各个元素高度累加之和）

    function init(_listArea, _container, _target) {
        listArea = _listArea;
        container = _container;
        listAreaW = _listArea.clientWidth;
        target = _target;
        itemW = _target.offsetWidth + 20;
        column = Math.floor(listAreaW / itemW);
        // 初始化数组
        for (var i = 0; i < column; i++) {
            columnArr[i] = 0;
        }
        loadData(curPage, perPageCount);
        eventHandle();
    }
    // 事件绑定
    function eventHandle() {
        container.addEventListener('scroll', debounce(
            function() {
                if(isAppear(container, target)) {
                    loadData(curPage, perPageCount);
                }
            }, 1000
        ));
    }

    // 获取视口容器
    function getContainer() {
        return listArea;
    }
    
    // 渲染元素
    function render(dataList) {
        if (dataList.length) {
            dataList.forEach(function (item, index, array) {
                var _html = `<li class="item">
                                <a href="${item.url}">
                                    <img src="${item.img_url}" alt="">
                                </a>
                                <h3>${item.short_name}</h3>
                                <p>${item.short_intro == '' ? '暂无介绍' : item.short_intro}</p>
                            </li>`;
                var $node = $(_html);
                // 图片加载完毕后，进行瀑布流布局
                $node.find('img').load(function () {
                    var container = WaterFull.getContainer();
                    $(container).append($node);
                    WaterFull.layout($node);
                });
            });
            curPage += 1;
        }
    }

    // 瀑布流布局
    function layout($node) {
        var minHeight = Math.min.apply(null, columnArr);        // 各列中最小累計高度和
        var index = columnArr.indexOf(minHeight);
        
        columnArr[index] += $node.outerHeight() + 20;
        $node.css({
            left: itemW * index + 20,
            top: minHeight + 20
        });
        
        listArea.style.height = Math.max.apply(null, columnArr) + 'px';
    }

    return {
        init: init,
        getContainer: getContainer,
        render: render,
        layout: layout
    };
})();

function $$(selector) {
    return document.querySelector(selector);
}

// 静态图片替换
WaterFull.init($$('#list'), $$('.waterfull'), $$('#item'));