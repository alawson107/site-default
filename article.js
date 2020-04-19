//
//  article.js
//

// debugger
// if (!debuggerCalled) {debuggerCalled = true;debugger;}
var debuggerCalled = false;

var Status = {
    isOpen: false                               //  for narrow layout is article currently open
};
module.exports.Status = Status;

module.exports.vueConfig = {
    css: {},
    options: {
        scrollInWindow: jnx.panel.layout == 'wide',
        maxImageHeightToWindow: true,
        markdownFloatImages: true,
        shadowImages: true
    },
    changeVarsList: ['articleId'],
    data() {
        return {}
    },
    created(){},
    methods: {
        showComments(event){
            var trace = false;
            if (trace) console.log('showComments ' + new Date());
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            var pid = 'div[data-jnx-block="article.html"]';
            var componentUrl = 'blog/comments.html?articleId=' + block.vars.articleId;
            var sel = pid + ' div[data-jnx-component="' + componentUrl + '"]';
            var $dom = $(pid + ' div#comments-placeholder');
            var html = '<div data-jnx-component="' + componentUrl + '"></div>';
            $dom.replaceWith(html);
            jnx.getVUEcomponents(sel);
            block.jqm.find('button#comments').hide();                                 //  hide '3 Comments' button
        },
        scrollComments(){
            // if (!debuggerCalled) {debuggerCalled = true;debugger;}
            var trace = false;
            var pid = 'div[data-jnx-block="article.html"]';
            var componentUrl = 'blog/comments.html?articleId=' + block.vars.articleId;
            var sel = pid + ' div[data-jnx-component="' + componentUrl + '"]';
            if ($(pid).css('overflowY') == 'hidden'){                   //  article is not free scrolling
                var scrollTop = $('html')[0].scrollTop;
                if (trace) console.log('page scrolled: 100 added to ' + scrollTop);
                $('html')[0].scrollTop += 100;
                return;
            }
            //  scroll to put 'Comments' button near top of screen
            var dom = $(pid)[0];
            var curScrollTop = dom.scrollTop;
            var toScroll = dom.scrollHeight - dom.scrollTop - dom.clientHeight;
            var wH = window.innerHeight;
            var addScroll = wH * .80;
            curScrollTop += addScroll;
            dom.scrollTo({top: curScrollTop, behavior: 'smooth'});
            if (toScroll < addScroll){
                var pageScroll = addScroll - toScroll;
                pageScroll = pageScroll > 77 ? 77 : pageScroll;
                pageScroll -= $('html')[0].scrollTop;
                pageScroll = pageScroll < 0 ? 0 : pageScroll;
                if (pageScroll > $('html')[0].scrollTop){
                    $('html')[0].scrollTop = pageScroll;
                }
            }
            if ($(':focus').length > 0){
                $(':focus')[0].blur();
            }
        },
        makeComment(event){
            // if (!debuggerCalled) {debuggerCalled = true;debugger;};
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            if (jnx.isGuest){
                jnx.errorMessagePop('Anonymous comments are not allowed, please create an account and log in.', 3000);
                return;
            }
            jnx.loadPage('/pages/blog/comment.html?mode=create&articleId=' + block.vars.articleId);
        }
    },
    mounted(){
        // if (!debuggerCalled) {debuggerCalled = true;debugger;}
        if (!block.resData || !block.resData.itemData) return;          //  blank panel - no data yet
        block.jqm = $(this.$el);
        jnx.setVueCss(block);
        block.jqm.find('img').on('click', function(event){
            jnx.imageViewerPopup(event);
        });

        var itemData = block.resData.itemData;
        if (itemData.copyProtect){
            var pid = 'div[data-jnx-block="article.html"]';
            $(pid).on('contextmenu',function(e){
                jnx.errorMessagePop(itemData.copyProtectText);
                return false;
            });
            $(pid).bind('cut copy', function (e) {
                jnx.errorMessagePop(itemData.copyProtectText);
                e.preventDefault();
            });
        }

        if (jnx.panel.layout == 'narrow'){
            slideIni();
        }else{
            var $dom = block.jqm.find('div[data-role="content"]');
            articleReformat({$dom, block});
            delete block.panel.pageV.vars.viewAll;
        }
    }
};

//  on any var change (runs on ANY var change - values must be tracked locally)
module.exports.onVarChange = function(changes){

};

function slideIni(){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    block = block.panel.pageV.blocks['article'];                    //  get block pointing to updated object
    var w = window.innerWidth;
    var $cols = block.jqm.closest('div.el-row').find('div.el-col');
    $($cols[1]).css({left: w + 'px', position: 'absolute'});
    $($cols[1]).on('click dblclick touchstart touchmove touchend tap taphold mousedown mouseup mousemove', function(e){
        if (e.target.nodeName == 'A'){      //  is a link, do not handle here
            return;
        }
        jnx.sdClick2(e, null, null, null, {
            noDelay: true,
            swipeRight: function(e){
                slideOut();
            },
            horizontalDistanceThreshold: 10
        });
    });
    var $dom = block.jqm.find('div[data-role="content"]');
    articleReformat({$dom}, function(){
        if (!block.panel.pageV.vars.viewAll){
            slideIn();
        }
        delete block.panel.pageV.vars.viewAll;
    });
}

function slideOut(){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    block = block.panel.pageV.blocks['article'];                    //  get block pointing to updated object
    var w = window.innerWidth;
    var $cols = block.jqm.closest('div.el-row').find('div.el-col');
    $($cols[1]).css({position: 'absolute', left: '0px'});
    $($cols[1]).css({transition: 'all 300ms ease'});
    $($cols[0]).show();

    var w = window.innerWidth;
    setTimeout(function(){
        $($cols[1]).css({left: w + 'px'});
    }, 1);
    $($cols[1]).one('transitionend', function(e){
        $($cols[1]).css({transition: ''});
        $($cols[1]).hide();
        if (jnx.panel.layout == 'narrow'){
            var htmlScrollTop = block.panel.pageV.blocks['sideListBody'].htmlScrollTop;
            if (htmlScrollTop){
                // console.log('ArticleSlideOutScrollTop to ' + htmlScrollTop);
                // if (!debuggerCalled) {debuggerCalled = true;debugger;}
                block.panel.pageV.blocks['header'].scrollHeader(htmlScrollTop);
                delete block.panel.pageV.blocks['sideListBody'].htmlScrollTop;
            }
        }
    });
    Status.isOpen = false;
}
module.exports.slideOut = slideOut;

function slideIn(){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    block = block.panel.pageV.blocks['article'];                    //  get block pointing to updated object
    var $cols = block.jqm.closest('div.el-row').find('div.el-col');
    $($cols[1]).show();
    $($cols[1]).css({transition: 'all 300ms ease'});
    setTimeout(function(){          //  timeout is needed!!
        $($cols[1]).css({left: '0px'});
    }, 1);
    $($cols[1]).one('transitionend', function(e){
        $($cols[0]).hide();
        $($cols[1]).css({transition: '', position: 'relative', left: ''});
    });
    Status.isOpen = true;
    history.pushState({}, '', '');                  //  needed so back button will work
}
module.exports.slideIn = slideIn;

//  Adjust picture sizes and wrap taxt as indicated
//  $dom    content div for article
function articleReformat({$dom}, callback){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    block = block.panel.pageV.blocks['article'];                    //  get block pointing to updated object
    // if (block.jqm.height() == 0) return;
    if (!block.resData || !block.resData.itemData) return;      //  block is initializing, no data yet
    var itemData = block.resData.itemData;
    var o = {
        itemData: itemData,
        block: block,
        maxW: block.jqm.width(),
        // maxH: $dom.closest('div.el-row').height()
        maxH: window.innerHeight - 139                      //TODO this is just a guestament
    };
    jnx.page['blog-articleDisplay'].adjustImages($dom[0], o, function(){
        block.jqm.find('[data-role="content"]').show();
        block.panel.pageV.blocks['main'].adjustBlockHeight(block);
        if (callback) callback();
    });
};