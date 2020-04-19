//
//  file: default/header.js
//

// if (!debuggerCalled) {debuggerCalled = true;debugger;}
var debuggerCalled = false;
// debugger;

var Header = {};
var scrollSetByScrollHeader = false;
module.exports.scrollSetByScrollHeader = scrollSetByScrollHeader;
var blockId;
var skipHeaderCall = false;
var hasScrollInWindow = false;
var hdrScrollTop = null;                        //  current scroll position of header (used for page changing)
// var srcBlock = null;                            //  current srcBlock

module.exports.vueConfig = {
    css: {},
    options: {
        isFixed: true                           //  position is handled as 'fixed' with scrolling as needed
    },
    data() {
        return {}
    },
    created(){},
    methods: {},
    mounted(){
        block.jqm = $(this.$el);
    }
};

module.exports.blockInit = function(){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    var _block = this;
    var trace = false;
    this.uid = jnx.uid;
    this.vues['menu'] = new Vue({
        el: _block.jqm.find('div#menu')[0],
        data() {
            return {
                textColor: '#fff',
                activeTextColor: '#ffd04b',
                backgroundColor: jnx.prop({prop: 'navigator.backgroundColor', default: '#545c64'}),
                // backgroundColor: '#476fd0',
                activeIndex: '0',
                userName: jnx.user.firstName + ' ' + jnx.user.lastName
            }
        },
        methods: {
            handleSelect(key, keyPath) {
                var pageCode, feedcatId, articleId;
                // if (!debuggerCalled) {debuggerCalled = true;debugger;}
                var _this = this;
                // Header;
                setTimeout(closeMenu, 100);

                // var data = {
                //     _type: 'debugMessage',
                //     sessionId: jnx.sessionId,
                //     message: 'handleSelect: key=' + key + ' keys=[' + keyPath.join(',') + '] ' + new Date()
                // };
                // jnx.socketSend(data);

                if (key == '') return;
                if (key.match(/^pop:/)){                        //  no change for My profile, Logout, or Login
                    return;
                }
                if (key == 'home'){
                    pageCode = 'home';
                }else{
                    pageCode = 'sideList';
                    for (var i = 0; i < keyPath.length; ++i){
                        var kA = keyPath[i].split('=');
                        if (kA[0] == 'feedId'){
                            feedcatId = kA[1];
                        }else if (kA[0] == 'categoryId'){
                            feedcatId += '-' + kA[1];
                        }else if (kA[0] == 'articleId'){
                            articleId = kA[1];
                        }
                    }
                }
                jnx.setPageVar({
                        pageCode: pageCode,
                        feedcatId: feedcatId || null,
                        articleId: articleId || null},
                    {panel: block.panel}
                );
                if (pageCode == 'home' && jnx.panel.layout == 'narrow'){
                    setTimeout(closeMenu, 100);
                }
                setTimeout(function(){
                    closeMenu();
                }, 5000);
            },
            editProfile(){
                var _this = this;
                saveCurrentMenuItem();
                // var $isActiveEl = $(_this.$el).find('li.is-active');
                jnx.loadPage('user.html?mode=edit&userId=' + jnx.uid);
                restoreMenuItem();
            },
            sendAppInvite(){
                if (location.host.match(/^www-/)){
                    var url = location.host.replace(/^www-/, '');
                }else {
                    var url = location.host.replace(/^www/, 'app');
                }
                url = 'https://' + url;
                url = 'mailto:?Subject='
                    + encodeURIComponent('Link to application')
                    + '&body=Here%20is%20the%20link:%0A%0D' + encodeURIComponent(url);
                window.open(url, '_blank');
                // location.href = url;
                setCurMenuTab();
            },
            openApp(){
                // if (!debuggerCalled) {debuggerCalled = true;debugger;}
                if (location.host.match(/^www-/)){
                    var url = location.host.replace(/^www-/, '');
                }else {
                    var url = location.host.replace(/^www/, 'app');
                }
                window.open('https://' + url, '_blank');
                setCurMenuTab();
            },
            makeSubmission(){
                // if (!debuggerCalled) {debuggerCalled = true;debugger;}
                if (jnx.isGuest){
                    jnx.errorMessagePop('You must be logged in to make a submission');
                }else{
                    // jnx.loadPage('user.html?mode=edit&userId=' + jnx.uid);
                    jnx.page['articles'].createArticle(event, this);
                }
                setCurMenuTab();
                jnx.sendAnalyticsActivity({             //  send analytics message for new ads and closedAds
                    action: 'makeSubmissionClicked'
                });
                return;
            },
            login(){
                // saveCurrentMenuItem();
                jnx.page['load'].openLogin();
                // restoreMenuItem();
                setCurMenuTab();
            },
            logout(){
                jnx.popupClose(event);
                jnx.logout();
            }
        },
        mounted(){
            jnx.setVueCss(block);
            Header._this = this;
            setCurMenuTab();
            this.backgroundColor = jnx.prop({prop: 'navigator.backgroundColor', default: '#545c64'});

            // if ((jnx.detect.tablet() || jnx.detect.mobile()) && jnx.detect.android()){    //  fix touch events
            if (jnx.detect.tablet() || jnx.detect.mobile()){                                //  fix touch events
                // if (!debuggerCalled) {debuggerCalled = true;debugger;}
                block.panel.pageV.jqm.on('click', function(event){
                    // console.log('pageClick ' + new Date());
                    var activePop$ = $('.ui-popup-active').find('div[data-role="popup"]');
                    if (activePop$.length > 0){                                            //  a popup is open, just closing it
                        return;
                    }
                    closeMenu();
                });
                block.jqm.find('li[role="menuitem"]').on('click', function(event){    //  pointerdown  click
                    // console.log('menuItem pointer down ' + new Date());
                    var vueItem = event.currentTarget['__vue__'];
                    var index = vueItem.$options.propsData.index;
                    if (index && vueItem.$options._renderChildren.length > 1){
                        Header._this.$refs.headerMenu.open(index);
                        Header.opened = Header.opened || [];
                        Header.opened.push(index);
                    }else{
                        // console.log('No open: index=' + index + ' _rc.length=' + vueItem.$options._renderChildren.length);
                        var keys = [index];
                        var vueParent = vueItem.$parent;
                        while (vueParent && vueParent.$options.propsData.index){
                            var pIndex = vueParent.$options.propsData.index;
                            if (!pIndex.match(/=/)) break;
                            keys.splice(0, 0, pIndex)
                            vueParent = vueParent.$parent;
                        }
                        // Header._this.handleSelect(index, keys);
                        // closeMenu();
                    }
                    if (!index.match(/^pop:/)){
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                    }else{
                        // event.stopImmediatePropagation();
                        event.stopPropagation();
                    }
                });
            }

            // $(window).scroll(function(){                            //  scroll header but keep menu bar on screen
            //     // if (!debuggerCalled) {debuggerCalled = true;debugger;}
            //     scrollHeader();
            //
            // });

            // $('html').on('mousewheel.header', function(event){
            //     var cDiv = $('html')[0];
            //     if (cDiv.scrollTop < 3 && event.originalEvent.deltaY < 0
            //     ){
            //         event.preventDefault();
            //         event.stopPropagation();
            //         event.stopImmediatePropagation();
            //     }else if (cDiv.scrollTop > cDiv.scrollHeight - cDiv.clientHeight - 3 && event.originalEvent.deltaY > 0){
            //         event.preventDefault();
            //     }
            // });
            $(window).off('scroll.header');
            $(window).on('scroll.header', function(event){                            //  scroll header but keep menu bar on screen
                // if (!debuggerCalled) {debuggerCalled = true;debugger;}
                // srcBlock = block.srcBlock;
                if (skipHeaderCall){
                    skipHeaderCall = false;
                    return;
                }
                var mTop = parseInt(block.panel.pageV.jqm.css('marginTop'));
                var sTop = $('html')[0].scrollTop;
                if (mTop != 0){
                    block.panel.pageV.jqm.css({
                        // transition: 'all 3s',
                        marginTop: '0px'
                    })
                }
                if (sTop == 0){                                                 //  old iPad scrolls differently
                    sTop = event.target.scrollingElement.scrollTop;
                }
                scrollHeader(sTop);
                // scrollHeader(null, event);
                // scrollHeader();
            });

        },
        // beforeUpdate(){
        //     console.log('beforeUpdate ' + new Date());
        // },
        // updated(){
        //     console.log('updated ' + new Date());
        // },
        beforeDestroy(){
            $(window).off('scroll.header');
        }
    })
};

function closeMenu(){
    // Header._this.$refs.headerMenu.close('menu');
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    if (Header.opened){
        Header.opened.forEach(v => {
            Header._this.$refs.headerMenu.close(v);
        });
        Header.opened = [];
    }
    //  on S9 some top level submenus do not close
    // setTimeout(function(){
    //     $('body > div.el-menu--horizontal').css({display: 'none'});
    // }, 100);
    if ($(':focus').length > 0){
        $(':focus')[0].blur();
    }
    // setCurMenuTab();
}

//  set scroll on header
//  - only called by window scroll OR on new block (not called on block scrolls)
//  srcScrollTop    - is the scrollTop of the page
//                  - if not defined then hdrScrollTop is used
//  - changes the mode of the header from absolute (scrolling) to fixed (scrolled far enough)
//  - all scrollInWindow blocks start out as overFlowY:hidden and change to 'auto' when past max scroll
function scrollHeader(srcScrollTop){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    var trace = false;

    var srcBlock = null;
    if (block.panel.pageV.blocks['header'].srcBlock){
        srcBlock = block.panel.pageV.blocks['header'].srcBlock;
        if (!srcBlock.jqm || !srcBlock.jqm[0] || !srcBlock.jqm[0].parentNode){   //  reset jqm - does not get updated when article changed!!
            block.panel.pageV.blocks['header'].srcBlock.jqm = block.panel.pageV.jqm.find('[data-jnx-block="' + srcBlock.blockUrl + '"]');
        }
        if (!srcBlock.jqm || !srcBlock.jqm[0] || !srcBlock.jqm[0].parentNode){
            if (trace) console.log('srcBlock did not have jqm[0] after setting');
            srcBlock = null;
        }
    }

    var hdrBlock = block.panel.pageV.blocks['header'];
    var blocks = block.panel.pageV.blocks;
    if (!hdrBlock) return;                                          //  no header - no need to do anything
    var mbH = hdrBlock.jqm.find('div#menu').outerHeight();          //  height of nav bar
    var scrollLimit = hdrBlock.jqm.outerHeight(true) - mbH;         //  max header can be scrolled

    for (var i in blocks){
        if (blocks[i].vueConfig && blocks[i].vueConfig.options && blocks[i].vueConfig.options.scrollInWindow){
            hasScrollInWindow = true;
            break;
        }
    }

    if (typeof srcScrollTop == 'undefined' && hdrScrollTop !== null){       //  restore page scroll on page change
        $('html')[0].scrollTop = hdrScrollTop;
        return;
    }
    if (typeof srcScrollTop == 'undefined'){                                //  should always be defined past this point
        if (trace) console.log('srcScrollTop is undefined');
        return;
    }

    if (srcBlock && srcBlock.jqm){              //  this section applies to a scrolling block
        var sDiv = srcBlock.jqm[0];
        var toScroll = sDiv.scrollHeight - sDiv.scrollTop - sDiv.clientHeight;          //  distance to scroll to bottom
        var fDiv = blocks['footer'].jqm[0];
        var mDiv = blocks['main'].jqm[0];
        var wH = window.innerHeight;
        var ftrShowing = fDiv.scrollHeight - (mDiv.scrollHeight - wH - srcScrollTop);   //  amount of footer showing
        ftrShowing = ftrShowing < 0 ? 0 : ftrShowing;
        if (trace) console.log('toScroll=' + toScroll + ' ' + ftrShowing);
        if (toScroll == 0 && ftrShowing == 0){                                          //  allow block scroll
            if (srcBlock.jqm.css('overflowY') != 'auto'){           //  allow block to scroll in itself
                if (trace) console.log('  srcBlock set to auto at top');
                srcBlock.jqm.css({overflowY: 'auto'});
            }
        }
    }

    if (trace) {
        var m = 'srcScrollTop=' + srcScrollTop + ' scrollLimit=' + scrollLimit
            + ' hdrScrollTop=' + hdrScrollTop + ' toScroll=' + toScroll + ' ftrShowing=' + ftrShowing
            + ' wHeight=' + window.innerHeight + ' hdrPos=' + hdrBlock.jqm.css('position');
        if (srcBlock){
            m +=  ' srcBlock=' + srcBlock.id;
            if (srcBlock.jqm[0].parentNode){
                m +=  ' parentNode=OK';
            }else{
                m +=  ' parentNode=null';
            }
            if (!srcBlock.jqm[0].parentNode){
                debugger;
            }
        }else{
            m += ' srcBlock is null';
        }
        console.log(m);
    }

    // console.log('srcScrollTop=' + srcScrollTop + ' scrollLimit=' + scrollLimit);
    if (srcScrollTop < scrollLimit){
        if (trace) console.log('srcScrollTop < scrollLimit');
        hdrBlock.jqm.css({
            position: 'absolute',
            top: '0px',
            width: jnx.detect.isTouch() ? '100%' : window.innerWidth - 15 + 'px'
        });
        for (var i in blocks){
            if (blocks[i].vueConfig && blocks[i].vueConfig.options && blocks[i].vueConfig.options.scrollInWindow){
                var sDiv = blocks[i].jqm[0];
                if (sDiv.scrollTop == 0){
                    if (jnx.detect.mobile()) blocks[i].jqm.css({overflowY: 'hidden'});    //TODO removed to get scroll working better
                }
            }
        }
        hdrScrollTop = srcScrollTop;
    }else{
        // trace = true;
        if (trace) console.log('srcScrollTop >= scrollLimit');
        hdrScrollTop = scrollLimit;
        if (hdrBlock.jqm.css('position') != 'fixed'){               //  change header to fixed and page position
            if (trace) console.log('  set to fixed');
            hdrBlock.jqm.css({
                position: 'fixed',
                top: -scrollLimit + 'px',
            });
            // $('html')[0].scrollTop = scrollLimit;
            $('html')[0].scrollTop = srcScrollTop;
            // $('html')[0].scrollTo({top: srcScrollTop, behavior: 'smooth'});  << DOES NOT WORK WELL ON S9, NOT AT ALL ON iOS
            skipHeaderCall = true;
        }
        if (srcBlock){
            if (trace) console.log('  srcBlock.overFlowY=' + srcBlock.jqm.css('overflowY'));
            // var sDiv = srcBlock.jqm[0];
            // var toScroll = sDiv.scrollHeight - sDiv.scrollTop - sDiv.clientHeight;          //  distance to scroll to bottom
            // var fDiv = blocks['footer'].jqm[0];
            // var mDiv = blocks['main'].jqm[0];
            // var wH = window.innerHeight;
            // var ftrShowing = fDiv.scrollHeight - (mDiv.scrollHeight - wH - srcScrollTop);   //  amount of footer showing
            // ftrShowing = ftrShowing < 0 ? 0 : ftrShowing;
            // console.log('  toScroll=' + toScroll + ' ftrShowing=' + ftrShowing);
            if (toScroll > 0 || ftrShowing == 0){
                if (srcBlock.jqm.css('overflowY') != 'auto'){           //  allow block to scroll in itself
                    if (trace) console.log('  srcBlock set to auto');
                    srcBlock.jqm.css({overflowY: 'auto'});
                    $('html')[0].scrollTop = scrollLimit;
                    skipHeaderCall = true;
                }
            }else{
                if (srcBlock.jqm.css('overflowY') == 'auto'){           //  lock block scroll so page scrolls
                    if (trace) console.log('  srcBlock scroll locked');
                    if (jnx.detect.mobile()) srcBlock.jqm.css({overflowY: 'hidden'});     //TODO removed to get scroll working better
                }
            }
        }
    }
    cpTimer = setTimeout(checkPage, 300);

    function checkPage(){
        var delayMs = 300;
        // block.panel.pageV.blocks['main'].scrollInWindow = true;
        var now = new Date();
        if (cpCalledAt && now - cpCalledAt < delayMs){
            clearTimeout(cpTimer);
            cpTimer = null;
        }
        if (!cpTimer){
            cpCalledAt = now;
            cpTimer = setTimeout(checkPage, delayMs);
            return;
        }
        if (trace) console.log('  Page checked ' + new Date());
        if (trace) console.log('  PC: srcScrollTop=' + srcScrollTop + ' scrollLimit=' + scrollLimit + ' srcBlock=' + srcBlock
            + ' hdrScrollTop=' + hdrScrollTop + ' toScroll=' + toScroll + ' ftrShowing=' + ftrShowing);
        if (ftrShowing > 0 && toScroll > 0 && srcScrollTop > 0){                                //  hide footer
            var reduceHtmlScrollTop = ftrShowing > srcScrollTop ? srcScrollTop : ftrShowing;
            $('html')[0].scrollTop = srcScrollTop - reduceHtmlScrollTop;
            skipHeaderCall = true;
        }
        if (sDiv && sDiv.scrollTop > 0 && srcScrollTop > scrollLimit){  //  check of header has scroll a bit when it shouldn't have
            if (trace) console.log('  checkpage: header fixed');
            var hTop = parseInt(hdrBlock.jqm.css('top'));
            if (hTop != -scrollLimit){
                hdrBlock.jqm.css({
                    position: 'fixed',
                    top: -scrollLimit + 'px',
                });
            }
        }
        clearTimeout(cpTimer);
        cpTimer = null;
    }

};
module.exports.scrollHeader = scrollHeader;
var cpTimer = null;            //  checkPage timer
var cpCalledAt = null;         //  timestamp of when checkPage last called at

function saveCurrentMenuItem(){
    Header.$isActiveEl = $(Header._this.$el).find('li.is-active');
    if (Header.$isActiveEl.length == 0){
        Header.$isActiveEl = $($(Header._this.$el).find('li[tabindex="0"]')[0]);
    }
}

function restoreMenuItem(){
    Vue.nextTick(function(){
        clearMenu();
        var activeCSS = {color: Header._this.activeTextColor, borderBottomColor: Header._this.activeTextColor};
        Header.$isActiveEl.css(activeCSS);
        Header.$isActiveEl.addClass('is-active');
    });
}

function clearMenu(){
    // var resetCSS = {color: Header._this.textColor, borderBottomColor: '.onesparent'};
    var resetCSS = {
        color: Header._this.textColor,
        borderBottomColor: Header._this.backgroundColor
    };
    $(Header._this.$el).find('li.el-menu-item').css(resetCSS);
    $(Header._this.$el).find('div.el-submenu__title').css(resetCSS);
    $(Header._this.$el).find('> ul > li.el-menu-item').css({backgroundColor: ''});
    $('body div.el-menu--horizontal li.el-menu-item').css({color: Header._this.textColor});
}

//  Set the appropriate navbar to active based on feedcatId value
function setCurMenuTab(){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    var vars = block.panel.pageV.vars;
    var tabIndex = 0;
    if (vars.pageCode != 'home'){
        var feedcatId = vars.feedcatId;
        var feedId = feedcatId.split('-')[0];
        var sections = block.resData;
        if (sections.length > 1){
            if (vars.pageCode != 'home'){
                for (var i =  0; i < sections.length; ++i){
                    if (sections[i]._id.match(/-/)) continue;
                    if (sections[i]._id == feedId){
                        break;
                    }
                    ++tabIndex;
                }
            }
        }
    }
    var $li = block.jqm.find('div#menu > ul[role="menubar"] > li');
    if ($li.length > tabIndex){
        Vue.nextTick(function(){
            clearMenu();
            var activeCSS = {color: Header._this.activeTextColor, borderBottomColor: Header._this.activeTextColor};
            $($li[tabIndex]).css(activeCSS);
            $($li[tabIndex]).find('> div.el-submenu__title').css(activeCSS);
        });
    }
}
module.exports.setCurMenuTab = setCurMenuTab;

//  on any var change (runs on ANY var change - values must be tracked locally)
module.exports.onVarChange = function(changes){

    //  if not on home page
    // if (changes){
    // }

    Vue.nextTick(function() {
        // clearMenu();
        setCurMenuTab();
    })

};


