/** 有鼠标的才能使用的放大镜
 * 用法：在要放大的图片上放class="jsImgMouseZoom" src-zoom="大图url"后；并载入本模块即可
 **/
// define(['jquery'], function($) {
if (!('onmouseover' in document)) {
    // 没有鼠标不支持不实例化
    // return;
}

var M = {};

//注入浮动html
function insertHtml() {
    var zoomHtml = '<style>' +
        '.jsImgMouseZoomFloat{display:none;cursor:move;position:absolute;width:400px;height:400px;top:0;left:0;border-radius:50%;text-align:center;font-size:12px;background:#fff;color:#000;overflow: hidden;}' +
        '.jsImgMouseZoomFloat img{position:absolute;top:0;left:0;border:0;}' +
        '.jsImgMouseZoomFloat i{position:absolute;left: 0;top:50%;width:100%;}' +
        '</style>' +
        '<div class="jsImgMouseZoomFloat"><img /><i></i></div>';
    $('body').append(zoomHtml);
}


/**
 * 浮动对象
 * @returns {*|jQuery|HTMLElement}
 */
function getFloat() {
    return $('div.jsImgMouseZoomFloat');
}

/**
 * 浮动img对象
 * @returns {*|jQuery|HTMLElement}
 */
function getFloatImg() {
    return $('div.jsImgMouseZoomFloat img');
}

/**
 * 浮动i对象
 * @returns {*|jQuery|HTMLElement}
 */
function getFloatI() {
    return $('div.jsImgMouseZoomFloat i');
}

/**
 * 获取浮动层的大小
 */
function getFloatWH() {
    M.floatWidth = getFloat().width();
    M.floatHeight = getFloat().height();
}

// 同步显示大图
function syncImg(event) {
    // 鼠标离小图片左上角的距离
    var ix = event.pageX - M.img.offset().left;
    var iy = event.pageY - M.img.offset().top;
    // 从小图的x点得到它在整个width上的比例
    var bx = ix / M.img.width();
    // 从比例得到大图上的x点像素值
    bx = M.floatImgWidth * bx;
    // 从小图的y点得到它整个height上的比例
    var by = iy / M.img.height();
    // 根据小图比例得到大图的y点
    by = M.floatImgHeight * by;
    var bl = M.floatWidth / 2 - bx;
    var bt = M.floatHeight / 2 - by;
    // 浮动层的实时跟鼠标,鼠标在浮动层的中心点上
    getFloat().css({
        top: (event.pageY - M.floatHeight / 2) + 'px',
        left: (event.pageX - M.floatWidth / 2) + 'px'
    });
    // 大图片xy点在浮动层的中心，与鼠标的位置同步
    getFloatImg().css({
        left: bl + 'px',
        top: bt + 'px'
    });
}

$(function() {
    insertHtml();
    $(document).delegate('img.jsImgMouseZoom', 'mouseenter', function showFloat() {
            //显示放大的浮层
            // 如果有延时关闭
            clearTimeout(M.hider);

            if (M.on) {
                // 已经显示，不要重复初始化
                return;
            }

            M.img = $(this);
            var img = this;
            var arg = arguments;
            var src = M.img.attr('src-zoom');
            // 判断这个img是否达到要求
            if (!src) {
                M.on = 0;
                // 无效图片
                return;
            }

            getFloatI().html('图片加载中，请稍候...');
            // 没有加载完成，不用改变定位
            M.floatImgWidth = M.floatImgHeight = 0;
            getFloatImg().one('load', function() {
                // 图片加载完成了
                M.floatImgWidth = this.width;
                M.floatImgHeight = this.height;
                getFloatI().html('');
                syncImg.apply(img, arg);
            });
            getFloatImg().prop('src', src);
            M.on = 1;
            getFloat().show();
            getFloatWH();
        })
        .on('mousemove', function moveFloat(event) {
            //移动浮层
            if (!M.on || !M.img) {
                // 无效图片,或是已经移出小图区域
                return;
            }

            // 鼠标离小图片左上角的距离
            var ix = event.pageX - M.img.offset().left;
            var iy = event.pageY - M.img.offset().top;

            if (ix < 0 || ix > M.img.width() || iy < 0 || iy > M.img.height()) {
                // 若移出小图区域，就要隐藏
                M.hider = setTimeout(function hideFloat() {
                    // 隐藏浮层
                    if (!M.on) {
                        return;
                    }

                    delete M.on;
                    getFloat().hide();
                }, 200);
                return;
            }
            syncImg.apply(this, arguments);
        });
});
// });