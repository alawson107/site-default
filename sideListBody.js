//
//  sideListBody.js
//

// debugger;
// if (!debuggerCalled) {debuggerCalled = true;debugger;}
var debuggerCalled = false;

module.exports.vueConfig = {
    css: {
        '.slash': {
            content: "",
            display: 'inline-block',
            'margin-right': '.3em',
            background: '#eda753 linear-gradient(#eda753,#f68f44)',
            height: '.7em',
            width: '.35em',
            transform: 'skewX(-30deg)'
        }
    },
    options: {
        scrollInWindow: jnx.panel.layout == 'wide',
        shadowImages: true,
        adjustBlockHeight: jnx.panel.layout == 'wide'
    },
    changeVarsList: ['feedcatId'],
    data() {
        return {}
    },
    created(){},
    mounted(){
        // if (!debuggerCalled) {debuggerCalled = true;debugger;}
        block.jqm = $(this.$el);
        jnx.setVueCss(block);
        var hBlock = block.panel.pageV.blocks['header'];
        hBlock.setCurMenuTab();
        var vars = block.panel.pageV.vars;
        if (jnx.panel.layout == 'wide' && !vars.articleId){
            vars.articleId = block.resData.feedcats[0].feature._id;
            jnx.getHTMLblocks('article.html');
        }
        if (jnx.panel.layout == 'narrow'){
            block.jqm.on('click dblclick touchstart touchmove touchend tap taphold mousedown mouseup mousemove', function(e){
                if (e.target.nodeName == 'A'){      //  is a link, do not handle here
                    return;
                }
                jnx.sdClick2(e, null, null, null, {
                    noDelay: true,
                    swipeRight: function(e){
                        jnx.setPageVar({
                                pageCode: 'home',
                                feedcatId: null,
                                articleId: null},
                            {panel: block.panel}
                        );
                    },
                    horizontalDistanceThreshold: 10
                });
            });
        }
    },
    methods: {
        viewArticle(event){
            var vars = block.panel.pageV.vars;
            // if (!debuggerCalled) {debuggerCalled = true;debugger;}
            // // console.log('sideListBody.viewArticle ' + new Date());
            if ($(event.target).data('jnxTrigger')){        //  this gets hit first on trigger clicks
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            if (jnx.panel.layout == 'narrow'){  //  save scroll position of page when narrow so that it can be restored after article closed
                block.htmlScrollTop = $('html')[0].scrollTop;
            }
            jnx.linkClickAt = new Date();
            var articleId = $(event.target).closest('[data-jnx-article-id]').data('jnxArticleId').toString();
            if (jnx.panel.layout == 'narrow' && !vars.articleId){
                vars.articleId = articleId;
                jnx.getHTMLblocks('article.html');
            }else if (articleId == block.panel.pageV.vars.articleId){
                block.panel.pageV.blocks.article.slideIn();
            }else{
                jnx.setPageVar({pageCode: 'sideList', articleId, articleId}, {panel: block.panel});
            }
        }
    }
};

//  on any var change (runs on ANY var change - values must be tracked locally)
module.exports.onVarChange = function(changes){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    // console.log('sideListBody var change');
    //
    // Vue.nextTick(function() {
    //     // clearMenu();
    //     // setCurMenuTab();
    // })
};