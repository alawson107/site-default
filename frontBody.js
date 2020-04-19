//
//  frontBody.js
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
        shadowImages: true
    },
    data() {
        return {}
    },
    created(){},
    mounted(){
        // if (!debuggerCalled) {debuggerCalled = true;debugger;}
        block.jqm = $(this.$el);
        jnx.setVueCss(block);
    },
    methods: {
        showScroll(event){
            $(event.target).css({overflowY: 'auto'});
            // console.log('showScroll ' + e.target.id);
        },
        hideScroll(event){
            $(event.target).css({overflowY: 'hidden'});
            // console.log('hideScroll ' + e.target.id);
        },
        viewArticle(event){
            // if (!debuggerCalled) {debuggerCalled = true;debugger;}
            // console.log('frontBody.viewArticle ' + new Date());
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            var feedcatId = $(event.target).closest('[data-jnx-feedcat-id]').data('jnxFeedcatId');
            var articleId = $(event.target).closest('[data-jnx-article-id]').data('jnxArticleId').toString();
            jnx.setPageVar({pageCode: 'sideList', feedcatId, articleId}, {panel: block.panel});
        },
        viewAll(event){
            var feedcatId = $(event.target).closest('[data-jnx-feedcat-id]').data('jnxFeedcatId');
            var articleId = null;
            var feedcats = block.resData.feedcats;
            for (var i = 0; i < feedcats.length; ++i){
                if (feedcats[i].id != feedcatId) continue;
                if (feedcats[i].feature){
                    articleId = feedcats[i].feature._id;
                }else{
                    articleId = feedcats[i].items[0]._id;
                }
                break;
            }
            jnx.setPageVar({
                pageCode: 'sideList',
                feedcatId,
                articleId,
                viewAll: true
            }, {panel: block.panel});
            // console.log('frontBody.test [' + feedcatId + '] ' + new Date());
        }
    }
};

//  on any var change (runs on ANY var change - values must be tracked locally)
module.exports.onVarChange = function(changes){

};

