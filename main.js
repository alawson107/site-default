//
//  main.js SPECIAL FUNCTIONS FOR main.html BLOCK
//

// debugger;
// if (!debuggerCalled) {debuggerCalled = true;debugger;}
var debuggerCalled = false;
var pointer = {};
module.exports.point = pointer;
var scrollInWindow = false;
var scrollTimer;
var traceTouch = false;
module.exports.scrollInWindow = scrollInWindow;

//  PAGE VARIABLES FOR NAVIGATION (panel.pageV.vars.xxx)
//  pageCode        'main'          main page
//                  'sideList'      list of articles
//  feedcatId
//  articleId
//  NOTES - all vue pages MUST have a single 'main' vue block at the top

//  These vars are only accessible in this module
var Main = {
    userId: jnx.uid
};

module.exports.vueConfig = {
    css: {
        // '.boxShadow': {
        //     'box-shadow': '0px 0px 12px 3px rgba(0,0,0,0.25)'
        // }
    },
    //  returns list of jnx or page vars that will trigger refresh of block if changed (can be an array or a function)
    //  - vars are from pageV.vars then from jnx.vars, context is block
    changeVarsList(){
        // if (this.panel.pageV.vars.pageCode){
        //     return ['pageCode']
        // }else{
        //     return []
        // }
        return []
    },
    data() {
        return {}
    },
    methods: {
        pDown(event){
            // if (!debuggerCalled) {debuggerCalled = true;debugger;}
            if (!(jnx.detect.tablet() || jnx.detect.mobile()) || jnx.detect.ios()) return;
            if (traceTouch) console.log('main.pDown ' + event.target.tagName + ' ' + new Date());
            if (scrollInWindow) return;
            if (event.target.tagName == 'A') return;
            if (event.target.dataset.jnxTrigger) return;
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            if (pointer.inTransition){
                var marginTop = parseInt(pointer.jqm.css('marginTop'));
                // console.log('marginTop=' + marginTop + ' pointer.finalScrollTop=' + pointer.finalScrollTop);
                pointer.jqm.off('transitionend.pointer');
                pointer.jqm.css({transition: 'none'});
                var finalScrollTop = pointer.start.scrollTop - marginTop;
                pointer.jqm.css({marginTop: '0px'});
                // console.log('newScrollTop=' + scrollTop + ' deltaExtra=' + deltaExtra + ' deltaFinal=' + deltaFinal);
                $('html')[0].scrollTop = finalScrollTop;
                delete pointer.inTransition;
            }
            pointer.jqm = block.panel.pageV.jqm;
            pointer.last = [{Y: event.clientY, timeStamp: event.timeStamp}];
            pointer.start = {
                Y: event.clientY,
                scrollTop: $('html')[0].scrollTop
            };
            // console.log('down event.clientY' + event.clientY + ' scrollTop=' + pointer.start.scrollTop);
        },
        pMove(event){
            if (!(jnx.detect.tablet() || jnx.detect.mobile()) || jnx.detect.ios()) return;
            // if (!debuggerCalled) {debuggerCalled = true;debugger;}
            if (traceTouch) console.log('main.pMove ' + event.target.tagName + ' ' + new Date());
            if (scrollInWindow) return;
            if (event.target.tagName == 'A') return;
            if (event.target.dataset.jnxTrigger) return;
            var now = new Date();
            if (!pointer.last) return;
            pointer.last.push({Y: event.clientY, timeStamp: event.timeStamp});
            var deltaY = event.clientY - pointer.start.Y;                       //  negative when going up
            var scrollTop = pointer.start.scrollTop - deltaY;                   //  new scrollTop
            if (traceTouch) console.log('pMove:deltaY=' + deltaY + ' scrollTop=' + scrollTop);
            if (now - jnx.linkClickAt < 300) return;
            if (scrollTop < -5){                                                //  finger dragged too far down
                // event.preventDefault();
                // event.stopImmediatePropagation();
                event.stopPropagation();
                return;
            }

            // var elBlock = jnx.getBlock(event.target);                               //  check for scrolling inside block
            // var $block = elBlock.jqm;
            // var blockDOM = $block[0];
            // if (blockDOM.scrollTop < blockDOM.scrollHeight - blockDOM.clientHeight){
            //     // event.preventDefault();
            //     // event.stopImmediatePropagation();
            //     // event.stopPropagation();
            //     return;
            // }

            var $page = block.panel.pageV.jqm;
            var bottomOver = $page.outerHeight() - scrollTop - window.innerHeight;
            if (bottomOver < 0){                                                    // finger dragged too far up
                event.stopPropagation();
                return;
            }
            pointer.jqm.css({marginTop: deltaY + 'px'});
            // console.log('move movementY=' + event.movementY + ' event.clientY=' + event.clientY + ' deltaY=' + deltaY);
            var now = new Date();                                                   //  delete any older than 300ms
            for (var i = 0; i < pointer.last.length; ++i){
                if (now - pointer.last[i].timestamp > 300) continue;
                if (i == 0) break;
                pointer.last.splice(0, i - 1);
                break;
            }

            event.stopPropagation();
            if (block.panel.pageV.blocks['header'] && block.panel.pageV.blocks['header'].scrollHeader){       //  scroll header if needed
                block.panel.pageV.blocks['header'].scrollHeader(scrollTop);
            }

        },
        pUp(event){
            // if (!debuggerCalled) {debuggerCalled = true;debugger;}
            if (!(jnx.detect.tablet() || jnx.detect.mobile()) || jnx.detect.ios()) return;
            if (traceTouch) console.log('main.pup ' + event.target.tagName + ' ' + new Date());
            if (scrollInWindow) return;
            var totYfirst = 0;
            var totYlast = 0;                                                       //  average of Y
            // console.log('pointer.last.length=' + pointer.last.length);
            if (!pointer.last) return;
            if (event.target.tagName == 'A') return;
            if (event.target.dataset.jnxTrigger) return;
            for (var i = 0; i < pointer.last.length; ++i){
                if (i == pointer.last.length - 1 && pointer.last.length % 2 == 0) break;
                if (i < pointer.last.length / 2){                       //  0123
                    totYfirst += pointer.last[i].Y;
                }else{
                    totYlast += pointer.last[i].Y
                }
            }
            var fUp = totYlast < totYfirst ? true : false;                          //  finger direction UP

            var last = pointer.last[pointer.last.length - 1];
            while (pointer.last.length > 1){
                if (fUp
                    && (pointer.last[0].Y > pointer.start.Y || pointer.last[0].Y < last.Y)){
                    pointer.last.splice(0, 1);
                    continue;
                }
                if (!fUp
                    && (pointer.last[0].Y < pointer.start.Y || pointer.last[0].Y > last.Y)){
                    pointer.last.splice(0, 1);
                    continue;
                }
                break;
            }
            if (pointer.last.length > 2){                                           //  ballistic scroll
                var deltaExtra = last.Y - pointer.last[0].Y;                        //  distance in last 300ms
                deltaExtra = deltaExtra * 500 / (last.timeStamp - pointer.last[0].timeStamp);  //  -ve for dragging down
                // console.log('deltaExtra=' + deltaExtra);
                var deltaFinal = deltaExtra + last.Y - pointer.start.Y;             //  plus total travelled so far
                var scrollTop = pointer.start.scrollTop - deltaFinal;               //  new scrollTop
                if (scrollTop < 0){                                                 //  scroll would end too low
                    deltaFinal = deltaFinal + scrollTop;
                    scrollTop = 0;
                }
                var $page = block.panel.pageV.jqm;
                var $footer = block.panel.pageV.blocks.footer.jqm;
                var pH = $page.outerHeight();
                var fH = $footer.outerHeight();
                if (pH - scrollTop - fH < window.innerHeight){                      //  page would scroll too high
                    scrollTop = $page.outerHeight() -  window.innerHeight;
                    deltaFinal = pointer.start.scrollTop - scrollTop;
                    // deltaFinal -= window.innerHeight - ($page.outerHeight() - scrollTop);
                    // var scrollTop = pointer.start.scrollTop - deltaFinal;           //  adjusted scrollTop
                }
                // console.log('Final scrollTop=' + scrollTop + ' deltaFinal=' + deltaFinal);
                if (fUp && deltaFinal > 0                                           //  wrong direction
                    || !fUp && deltaFinal < 0
                ){
                    // console.log('no ballistic - wrong direction');
                    pointer = {};
                    return;
                }

                var ms = 1000 * Math.abs(deltaExtra) / 500;
                ms = ms > 1000 ? 1000 : ms;
                pointer.jqm.css({transition: 'all ' + ms + 'ms ease-out'});
                pointer.jqm.css({marginTop: deltaFinal + 'px'});
                // pointer.jqm.on('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', function(e){
                if (jnx.detect.ios()){
                    pointer.inTransition = true;
                    pointer.finalScrollTop = scrollTop;
                    pointer.jqm.one('transitionend.pointer', function(e){       //  iOS uses CSS for balistic scrolling
                        pointer.jqm.css({transition: 'none'});
                        pointer.jqm.css({marginTop: '0px'});
                        // console.log('newScrollTop=' + scrollTop + ' deltaExtra=' + deltaExtra + ' deltaFinal=' + deltaFinal);
                        $('html')[0].scrollTop = pointer.finalScrollTop;
                        delete pointer.inTransition;
                        pointer = {};
                        if (block.panel.pageV.blocks['header'] && block.panel.pageV.blocks['header'].scrollHeader){       //  scroll header if needed
                            block.panel.pageV.blocks['header'].scrollHeader(scrollTop);
                        }
                    });
                }
                scrollTimer = true;
            }else{
                // console.log('not enough points');
                pointer = {};
            }
        },
    },
    mounted(){
        // if (!debuggerCalled) {debuggerCalled = true;debugger;}
        block.jqm = $(this.$el);
        block.panel.pageV.vars.pageCode = 'home';
        jnx.setVueCss(block);
        // jnx.vars.pageCode = 'main';
    }
};

//  extra initialization done after block has been loaded (this = curPanel.pageV.block[xxx])
//  - default vue init by jnx.HTMLblock(data) will not be done if this exists
// module.exports.blockInit = function(){
//
// };

//  always executed after block created or re-created, after vue initialized one way or another
module.onCreated = function(){

};

//  called by jnx.setPageVar() when any var changes (on ANY panel if no panel provided)
//  changes.xxx.old         only for variables that have changed
//  changes.xxx.new
//  - called by jnx.setPageVar(), context is block (ie. block.id = 'header'
//  - pageV.vars already updated by the time this is called
//  - runs on ANY var change - values must be tracked locally)
module.exports.onVarChange = function(changes){
    if (jnx.uid != Main.userId){
        Main.userId = jnx.uid;
        jnx.getHTMLblocks(this.jqm[0]);
    }
};

//  called just before panel closes
//  - if returns a message will cancel close
module.exports.onPanelClose = function(){

};

//  increase block height so that foot is at bottom of page
//  - this is called from within any block that might be expanded
//  -
//  - adjusts all other blocks on page when one is adjusted
module.exports.adjustBlockHeight = function(block){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    if (block.vueConfig.options && block.vueConfig.options.scrollInWindow) return;
    if (!block.vueConfig.options || !block.vueConfig.options.adjustBlockHeight) return;
    var blocks = block.panel.pageV.blocks;                                              //  ALL blocks on page
    var hdrH = blocks['header'].jqm.height();                       //  adjust height of article (may be too short)
    var ftrH = blocks['footer'].jqm.outerHeight(true);
    if ($(block.jqm[0].parentNode).hasClass('el-col')){                                 //  is a column
        var $blocks = block.jqm.closest('div.el-row').find('div[data-jnx-block]');      //  get blocks in same row
        var nBlocksDone = 0;
        for (var i = 0; i < $blocks.length; ++i){                                       //  remove height from all blocks
            var conEl = getConEl($blocks[i]);
            if (!conEl) continue;
            $(conEl).css({height: ''});
            jnx.onImagesLoaded(conEl, {}, function(){
               ++nBlocksDone;
               if (nBlocksDone == $blocks.length){                  //  after images loaded in all blocks all blocks
                   adjustBlockHeights();
               }
            });
        }
    }else{
        doBlock(block);
    }

    function adjustBlockHeights(){
        var tallestH = 0;
        var tallestIndex = -1;
        for (var i = 0; i < $blocks.length; ++i){
            if ($($blocks[i]).outerHeight(true) > tallestH){                 //  get tallest height
                tallestH = $($blocks[i]).outerHeight(true);
                tallestIndex = i;
            }
        }
        var extraHeight = 31;                                                   //  added 31 for touch device when chrome at top shrinks
        var addH = window.innerHeight - hdrH - ftrH - tallestH + extraHeight;   //  height to add to fill screen
        if (addH > 0){
            var conEl = getConEl($blocks[tallestIndex]);
            var newH = $(conEl).innerHeight() + addH;
            console.log('newH1=' + newH);
            $(conEl).css({height: newH + 'px'});
        }
        for (var i = 0; i < $blocks.length; ++i){                               //  adjust all other columns to match height
            if (i == tallestIndex) continue;
            var blkH = $($blocks[i]).outerHeight(true);
            var addH = window.innerHeight - hdrH - ftrH - blkH + extraHeight;   //  height to add to fill screen
            var conEl = getConEl($blocks[i]);
            var newH = $(conEl).innerHeight() + $($blocks[tallestIndex]).outerHeight(true)
                - $($blocks[i]).outerHeight(true);
            console.log('newH2=' + newH);
            $(conEl).css({height: newH + 'px'});
            // console.log(i + ' newH=' + newH);
        }
        blocks['footer'].jqm.css({position: 'relative', top: ''});       //  restore position of footer
    }

    function doBlock(block){
        var blkH = block.jqm.outerHeight(true);
        var addH = window.innerHeight - hdrH - ftrH - blkH;
        var conEl = getConEl(block)
        var $con = block.jqm.find('[data-role="content"]');
        if ($con.length == 0){
            $con = block.jqm.find('section');
        }
        if ($con.length != 1) return;
        if (addH > 0){
            var newH = $con.innerHeight() + addH;
            newH = newH + 'px';
        }else{
            var newH = '';
        }
        console.log('newH3=' + newH);
        $con.css({height: newH});
    };

    function getConEl(blockEl){       //  get content element of block
        var $con = $(blockEl).find('[data-role="content"]');
        if ($con.length == 0){
            $con = $(blockEl).find('section');
        }
        if ($con.length == 1){
            return $con[0];
        }else{
            return null;
        }
    }

};


