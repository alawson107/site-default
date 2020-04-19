//
//  main-admin.js
//  - functions that will only be loaded for admin users
//  - extra initialization done after block has been loaded (this = curPanel.pageV.block[xxx])
//  - 'all' means call it for all child blocks as well (as they are created)

// debugger;
// if (!debuggerCalled) {debuggerCalled = true;debugger;}
var debuggerCalled = false;

var MainAdmin = {
    css: {
        'div.el-form-item__content > button': {
            width: '87px'
        },
        'label.el-form-item__label': {
            lineHeight: '20px'
        },
        'div.el-form-item': {
            marginBottom: '6px'
        }
    }
};

//  adjustments for other html blocks as they load (called by each block after it loads)
//  opts.isRefresh          only content was replaced
module.exports.onCreatedAllAdmin = function(block, opts){

    if (block.id != 'main'){                                                        //  create block popup trigger
        if ( block.jqm.css('position') == 'static'){
            block.jqm.css({position: 'relative'});
        }
        var top = block.id == 'frontBody' ? '142px' : '0px';
        // var right = block.id != 'header' ? '14px' : '0px';
        if (block.id == 'header'){
            var right = '0px';
        }else{
            var $columns = block.jqm.closest('div[data-jnx-block="columns"]');
            if ($columns.length > 0){
                var right = '0px';
            }else{
                var right = '14px';
            }
        }
        var triggerDiv = '<div data-jnx-trigger="block" ' +
            'style="width:30px;height: 30px;background-color: greenyellow;position: absolute;top:' + top
                + ';right:' + right + ';display:none;"></div>';
        block.jqm.append(triggerDiv);

        var pBlockUrl = $(block.jqm[0].parentNode).data('jnxBlock');
        if (pBlockUrl == 'main.html'){
            $(window).on('scroll', function(event){
                moveTriggers(event);
            });
        }else{
            block.jqm.on('scroll', function(event){
                moveTriggers(event);
            });
        }

    }else{                                                                          //  create page popup trigger
        var triggerDiv = '<div data-jnx-trigger="page" ' +
            'style="width:20px;height: 20px;background-color: orange;position: fixed;top:0px;right:0px;z-index: 2;display:none;"></div>';
        block.jqm.append(triggerDiv);
    }

    if (block.id.match(/frontBody|sideListBody/)){                                  //  create section popup triggers

        var triggerDiv = '<div data-jnx-trigger="feedcat" ' +
            'style="width:40px;height: 40px;background-color: deepskyblue;position: absolute;top:0px;right:0px;display:none;"></div>';
        block.jqm.find('[data-jnx-feedcat-id]').append(triggerDiv);

        var triggerDiv = '<div data-jnx-trigger="article" ' +
            'style="width:10px;height: 10px;background-color: deepskyblue;position: absolute;top:0px;left:0px;display:none;"></div>';
        block.jqm.find('[data-jnx-article-id]').append(triggerDiv);

        if (MainAdmin.articleDiv){                                                  //  reset div
            var articleId = $(MainAdmin.articleDiv).data('jnxArticleId');
            MainAdmin.articleDiv = block.jqm.find('[data-jnx-article-id="' + articleId + '"]');
            if (MainAdmin.articleDiv.length > 0){
                MainAdmin.articleDiv = MainAdmin.articleDiv[0];
                shadeItem(true, MainAdmin.articleDiv);
                MainAdmin.articlePopVue.onChange();
                setTimeout(function(){
                    positionPopup(MainAdmin.articlePopVue.$el)
                });
            }else{
                delete MainAdmin.articleDiv;
                closeArticlePop();
            }
        }
        if (MainAdmin.feedcatDiv){
            var feedcatId = $(MainAdmin.feedcatDiv).data('jnxFeedcatId');
            MainAdmin.feedcatDiv = block.jqm.find('[data-jnx-feedcat-id="' + feedcatId + '"]');
            if (MainAdmin.feedcatDiv.length > 0){
                MainAdmin.feedcatDiv = MainAdmin.feedcatDiv[0];
                shadeItem(true, MainAdmin.feedcatDiv);
                MainAdmin.feedcatPopVue.onChange();
            }else{
                delete MainAdmin.feedcatDiv;
                closeFeedcatPop();
            }
        }
        // if (MainAdmin.blockDiv){
        //     var blockId = $(MainAdmin.blockDiv).data('jnxBlock');
        //     MainAdmin.blockDiv = block.jqm[0];
        //     shadeItem(true, MainAdmin.blockDiv);
        //     MainAdmin.blockPopVue.onChange();
        // }
    }

    if (MainAdmin.blockDiv){                                                            //  reset div
        var blockId = $(MainAdmin.blockDiv).data('jnxBlock');
        MainAdmin.blockDiv = block.jqm[0];
        shadeItem(true, MainAdmin.blockDiv);
        MainAdmin.blockPopVue.onChange();
    }

    if (jnx.siteMisc.adminTriggersOn && !MainAdmin.isInAdminPopup){                            //  re-display triggers
        block.jqm.find('div[data-jnx-trigger]').show();
    }

};

//  move triggers as page scrolled
function moveTriggers(event){
    if (!jnx.siteMisc.adminTriggersOn) return;
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    if (!event){
        var sTop = $('HTML').scrollTop() || 0;
        var $tDivs = $('div[data-jnx-block="main.html"]').find('div[data-jnx-trigger="block"]');
    }else if (event.target.nodeName == '#document'){
        var sTop = $('HTML').scrollTop();
        var $tDivs = $('div[data-jnx-block="main.html"]').find('div[data-jnx-trigger="block"]');
    }else{
        var sTop = event.target.scrollTop;
        var $tDivs = $(event.target).find('div[data-jnx-trigger="block"]');
    }
    var hdrHeight = 0;          //  full height of header
    var navHeight = 0;          //  height of navigator bar in header
    var $hdr = $('div[data-jnx-block="main.html"]').find('div[data-jnx-block="header.html"]');
    if ($hdr.length > 0){
        hdrHeight = $hdr.outerHeight(true);
        navHeight = $hdr.find('div#menu').outerHeight(true);;
    }
    for (var i = 0; i < $tDivs.length; ++i){
        var $block = $($tDivs[i].parentNode);
        if ($block.css('position') == 'fixed') continue;    //  ignore header block triggers

        // var ppBlockUrl = $($tDivs[i].parentNode.parentNode).data('jnxBlock');
        var $columns = $block.closest('div[data-jnx-block="columns"]');
        if ($columns.length > 0){
            $block = $columns;
        }

        var pTop = parseInt($block.css('paddingTop'));      //  padding at top of block (ie. header)
        var bTop = $block.offset().top + pTop;              //  position of block on page
        var bHeight = $block.height();                          //  height of block
        var wH = window.innerHeight;                            //  window height
        // if (1==1 || ppBlockUrl == 'main.html'){

        if (bTop - sTop > wH) {                             //  trigger is below screen
            // if (i == 1) console.log('  method 1');
            var newTTop = 0;                                //  no adjustment
        }else if (bTop + bHeight - sTop < pTop) {           //  bottom of block is above screen
            // if (i == 1) console.log('  method 2');
            var newTTop = 0;
        }else if (bTop - sTop > pTop){                      //  top of block is still on screen
            // if (i == 1) console.log('  method 3');
            var newTTop = 0;
        }else{
            // if (i == 1) console.log('  method 4');
            if ($columns.length > 0){
                newTTop = 0;
            }else{
                var newTTop = sTop + pTop;
                if (sTop < hdrHeight - navHeight){
                    newTTop -= sTop;
                }else if (sTop < bHeight + pTop){
                    newTTop -= hdrHeight - navHeight;
                }else{
                    newTTop -= hdrHeight - navHeight + bHeight + pTop - sTop;
                }
            }
        }
        // if (i == 1) console.log(`newTTop=${newTTop} bTop=${bTop} sTop=${sTop} bHeight=${bHeight} pTop=${pTop} wH=${wH} `
        //     + `hdrHeight=${hdrHeight} navHeight=${navHeight} columns=${$columns.length}`);
        $($tDivs[i]).css({top: newTTop + 'px'});


            // }
        // }else{
        //     var pTop = parseInt($columns.css('paddingTop'));
        //     var bTop = $block.offset().top;                     //  position of block on page
        //     var bHeight = $block.height();                          //  height of block
        //     var wH = window.innerHeight;                            //  window height
        //     if (bTop - sTop > wH) {                             //  trigger is below screen
        //         var newTTop = 0;                                //  no adjustment
        //     }else if (bTop + bHeight - sTop < pTop) {           //  bottom of block is above screen
        //         var newTTop = 0;
        //     }else if (bTop - sTop > pTop){                      //  top of block is still on screen
        //         var newTTop = 0;
        //     }else{
        //         var newTTop = sTop + pTop;
        //     }
        //     if (i == 1) console.log(`newTTop=${newTTop} bTop=${bTop} sTop=${sTop} bHeight=${bHeight} pTop=${pTop} wH=${wH}`);
        //     $($tDivs[i]).css({top: newTTop + 'px'});
        // }
    }
}

//  setup admin popups for article, block, page
//  opts.isRefresh          only content was replaced
//  - this = curPanel.pageV.block[xxx]
//  - is run when main.html block is created but before inside blocks
module.exports.onCreatedAdmin = function(opts){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    // console.log('onCreatedAdmin this.id=' + this.id);
    var block = this;
    block.MainAdmin = MainAdmin;

    keydownFnSet(true);

    if (jnx.detect.isTouch()){
        var triggerEvent = 'touchstart';
    }else{
        var triggerEvent = 'click'
    }
    block.jqm.on(triggerEvent, 'div[data-jnx-trigger]', function(event){     //  create feedcat-block-page popups  mouseenter
        // if (!debuggerCalled) {debuggerCalled = true;debugger;}
        if (!jnx.siteMisc.adminTriggersOn) return;

        var triggerId = $(event.target).data('jnxTrigger');
        if (MainAdmin.isInAdminPopup && event.type != 'click'){
            return;
        }
        closePop();

        if (triggerId == 'article'){
            MainAdmin.articleDiv = $(event.target).closest('[data-jnx-article-id]')[0];
            createArticlePop();
        }else if (triggerId == 'feedcat'){
            MainAdmin.feedcatDiv = $(event.target).closest('[data-jnx-feedcat-id]')[0];
            createFeedcatPop();
        }else if (triggerId == 'block'){
            MainAdmin.blockDiv = $(event.target).closest('[data-jnx-block]')[0];
            createBlockPop();
        }else if (triggerId == 'page'){
            MainAdmin.pageDiv = this.parentNode;
            createPagePop();
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
    });

    jnx.draggable('div.jnxAdminPopup');

};

//  called when form (pop or overlay) is closed
//  - called from jnx.back
module.exports.onFormClose = function(){
    if (jnx.siteMisc.adminTriggersOn && !MainAdmin.isInAdminPopup){                            //  re-display triggers
        block.jqm.find('div[data-jnx-trigger]').show();
    }
};

function createPagePop(){                              //  create and display page admin popup
    $('body').append(`
<div id="jnx-page-admin" class="boxShadowPop jnxAdminPopup" 
    style="position:fixed;top:6px;left:6px;background-color: #fff;padding:16px 16px 12px 16px;" 
    >
<el-form ref="form" :model="form" label-width="250px" label-position="left" size="mini">

  <el-form-item style="margin-bottom:0px;">
    <template slot="label"> 
        <span>
        Save changes <i class="fal fa-info-circle hastip " :title="saveText"></i>
        </span> 
    </template>
    <el-button type="primary" :disabled="saveDisabled" @click="save">
        <i class="fal fa-save"></i>
    </el-button>
  </el-form-item>

  <el-form-item v-show="resetRedisDisplay" style="margin-bottom:0px;">
    <template slot="label"> 
        <span>
        Remove my changes <i class="fal fa-info-circle hastip " :title="resetRedisText"></i>
        </span> 
    </template>
    <el-button type="danger" icon="el-icon-refresh-right" :disabled="resetRedisDisabled" @click="resetRedis"></el-button>
  </el-form-item>

  <el-form-item v-show="resetDefaultDisplay" style="margin-bottom:0px;">
    <template slot="label"> 
        <span>
        Reset site to default settings <i class="fal fa-info-circle hastip " :title="resetDefaultText"></i>
        </span> 
    </template>
    <el-button type="danger" icon="el-icon-refresh-right" :disabled="resetDefaultDisabled" @click="resetDefault"></el-button>
  </el-form-item>

  <el-form-item label="Reload page" style="margin-bottom:0px;">
    <el-button type="primary" icon="el-icon-refresh" @click="reloadBlock"></el-button>
  </el-form-item>

  <el-form-item label="Section headers background" style="margin-bottom:0px;">
    <el-color-picker v-model="SHBgColor" show-alpha @change="setSHBgColor"></el-color-picker>
  </el-form-item>

  <el-form-item label="Secondary section color" style="margin-bottom:0px;">
    <el-color-picker v-model="SScolor" show-alpha @change="setSScolor"></el-color-picker>
  </el-form-item>

  <el-form-item label="Navigator background" style="margin-bottom:0px;">
    <el-color-picker v-model="NavBgcolor" show-alpha @change="setNavBgColor"></el-color-picker>
  </el-form-item>

</el-form>       
</div>
    `);

    MainAdmin.pagePopVue = new Vue({
        el: $('body').find('div#jnx-page-admin')[0],
        data: function(){
            return {
                saveDisabled: false,
                saveText: 'No changes to save',
                resetRedisDisplay: true,
                resetRedisDisabled: false,
                resetRedisText: 'No changes',
                resetDefaultDisplay: true,
                resetDefaultDisabled: false,
                resetDefaultText: 'No changes',
                SHBgColor: jnx.prop({prop: 'css.children[".grayHeaders"].attributes["background-color"]'}),
                SScolor: jnx.prop({prop: 'css.children[".secColor"].attributes["color"]'}),
                NavBgcolor: jnx.prop({prop: 'navigator.backgroundColor'}),
                form: {}
            }
        },
        methods: {
            save(event){
                var pbfa = getPBFA(MainAdmin.pageDiv);
                jnx.sendBA('save', {block: pbfa.block, isAdmin: true});
            },
            resetRedis(){
                var pbfa = getPBFA(MainAdmin.pageDiv);
                jnx.sendBA('reset', {block: pbfa.block, isAdmin: true});
                // doReset(pbfa.block);
                // function doReset(block){
                //     for (var i = 0; i < block.childBlocks.length; ++i){    //  call reset fn in all blocks
                //         doReset(block.childBlocks[i]);
                //     }
                //     if (block.reset) {
                //         block.reset();
                //     }
                // }
            },
            resetDefault(){
                var pbfa = getPBFA(MainAdmin.pageDiv);
                jnx.sendBA('reset', {block: pbfa.block, isAdmin: true, opts: {resetToBase: true}});
            },
            reloadBlock(event){
                reloadPage();
            },
            setSHBgColor(color){
                // if (!debuggerCalled) {debuggerCalled = true;debugger;}
                var color = color || 'rgba(84, 92, 100, 0.73)';
                this.SHBgColor = color;
                var key = 'css.children[".grayHeaders"].attributes["background-color"]';
                jnx.sendSU({key: key, value: color}, null);
                return;
            },
            setSScolor(color){
                // if (!debuggerCalled) {debuggerCalled = true;debugger;}
                var color = color || 'rgba(246, 143, 68, 1)';
                this.SScolor = color;
                var props = [];
                var key = 'css.children[".secColor"].attributes["color"]';
                props.push({key: key, value: color});
                key = 'css.children[".secColorBg"].attributes["background-color"]';
                props.push({key: key, value: color});
                jnx.sendSU(props, null);
                return;
            },
            setNavBgColor(color){
                // if (!debuggerCalled) {debuggerCalled = true;debugger;}
                var color = color || 'rgba(84, 92, 100, 1)';
                this.NavBgColor = color;
                var key = 'navigator.backgroundColor';
                jnx.sendSU({key: key, value: color}, block.panel.pageV.blocks['header'], {refreshBlock: true});
                // jnx.siteMisc.modified
                return;
            },

            onChange(){
                this.calcButtons();
            },
            calcButtons(){     //  set colors and hide buttons
                removeTooltips(this.$el);
                _.defer(function(el){
                    setTooltips(el);
                }, this.$el);
                if (!jnx.siteMisc.modified){
                    this.resetDefaultDisabled = true;
                    this.resetDefaultText = 'No changes have been saved, the default template is being used.';
                }else{
                    this.resetDefaultDisabled = false;
                    this.resetDefaultText = 'Delete saved changes and revert to the default template.';
                }
                if (!jnx.siteMisc.nUnsaved){
                    this.saveDisabled = true;
                    this.saveText = 'There are no changes to save';
                    this.resetRedisDisabled = true;
                    this.resetRedisText = 'There are no changes to remove';
                }else{
                    this.saveDisabled = false;
                    this.resetRedisDisabled = false;
                    if (jnx.siteMisc.nUnsaved == 1){
                        this.saveRedisText = jnx.siteMisc.nUnsaved + ' Change will be saved';
                        this.resetRedisText = jnx.siteMisc.nUnsaved + ' Change will be removed';
                    }else{
                        this.saveRedisText = jnx.siteMisc.nUnsaved + ' Changes will be saved';
                        this.resetRedisText = jnx.siteMisc.nUnsaved + ' Changes will be removed';
                    }
                }
                this.SHBgColor = jnx.prop({prop: 'css.children[".grayHeaders"].attributes["background-color"]'});
                this.SScolor = jnx.prop({prop: 'css.children[".secColor"].attributes["color"]'});
                this.NavBgcolor = jnx.prop({prop: 'navigator.backgroundColor'});
            },
        },
        mounted(){
            MainAdmin.isInAdminPopup = true;
            for (var sel in MainAdmin.css){
                $(this.$el).find(sel).css(MainAdmin.css[sel]);
            }
            $(this.$el).find('div.el-color-picker__trigger').css({width: '87px'});
            this.calcButtons();
            positionPopup(this.$el);
            shadeItem(true, MainAdmin.pageDiv);
            jnx.siteMisc.adminPopupVue = this;
        },
        // updated(){},
        // watch: {}
        beforeDestroy(){
            removeTooltips(this.$el);
        }
    });
}
function createBlockPop(){                              //  create and display section admin popup
    $('body').append(`
<div id="jnx-block-admin" class="boxShadowPop jnxAdminPopup" 
    style="position:fixed;top:6px;left:6px;background-color: #fff;padding:16px 16px 12px 16px;" 
    >
<el-form ref="form" :model="form" label-width="200px" label-position="left" size="mini">

  <el-form-item style="margin-bottom:0px;" v-show="resetDisplay">
    <template slot="label"> 
        <span>
        Reset to default settings <i class="fal fa-info-circle hastip " 
            title="This will remove all settings related to this block, including settings on contained folders and articles."></i>        
        </span> 
    </template>
    <el-button type="danger" :disabled="resetDisabled" @click="reset" icon="el-icon-refresh-right"></el-button>
  </el-form-item>

  <el-form-item label="Reload block" style="margin-bottom:0px;">
    <el-button type="primary" icon="el-icon-refresh" @click="reloadBlock"></el-button>
  </el-form-item>

</el-form>       
</div>
    `);

    MainAdmin.blockPopVue = new Vue({
        el: $('body').find('div#jnx-block-admin')[0],
        data: function(){
            return {
                resetDisplay: true,
                resetDisabled: false,
                form: {}
            }
        },
        methods: {
            editArticle(event){
                var articleId = $(MainAdmin.articleDiv).data('jnxArticleId');
                closePop();
                jnx.siteMisc.adminTriggersOn = false;
                jnx.loadPage('/pages/blog/article.html?mode=edit&articleId=' + articleId);
            },
            reset(){
                var pbfa = getPBFA(MainAdmin.blockDiv);
                if (pbfa.block.reset){
                    pbfa.block.reset();
                }else{
                    console.log('ERROR - reset function not defined for block ' + pbfa.block.id);
                }
            },
            reloadBlock(event){
                // closeBlockPop();
                jnx.refreshHTMLblock(MainAdmin.blockDiv, {saveScroll: true});
            },
            onChange(){
                this.calcButtons();
            },
            calcButtons(){     //  set colors and hide buttons
                removeTooltips(this.$el)
                var pbfa = getPBFA(MainAdmin.blockDiv);
                this.resetDisplay = pbfa.block.reset ? true : false;
                _.defer(function(el){
                    setTooltips(el);
                }, this.$el);
            },
        },
        mounted(){
            MainAdmin.isInAdminPopup = true;
            for (var sel in MainAdmin.css){
                $(this.$el).find(sel).css(MainAdmin.css[sel]);
            }
            this.calcButtons();
            positionPopup(this.$el);
            shadeItem(true, MainAdmin.blockDiv);
            jnx.siteMisc.adminPopupVue = this;
        },
        // updated(){},
        // watch: {}
        beforeDestroy(){
            removeTooltips(this.$el);
        }
    });
}
function createFeedcatPop(){                              //  create and display section admin popup
    $('body').append(`
<div id="jnx-feedcat-admin" class="boxShadowPop jnxAdminPopup" 
    style="position:fixed;top:6px;left:6px;background-color: #fff;padding:16px 16px 12px 16px;" 
    >
<el-form ref="form" :model="form" label-width="200px" label-position="left" size="mini">
  </el-form-item>

  <el-form-item label="Place folder at top" v-show="moveDisplay" style="margin-bottom:0px;text-align: center;">
    <el-switch v-model="atTopSet" :disabled="atTopSetDisabled" @change="moveToTop"></el-switch>
  </el-form-item>

  <el-form-item :label="moveText" v-show="moveDisplay" style="margin-bottom:0px;">
    <el-button-group>
      <el-button icon="el-icon-arrow-up" :type="moveUpType" @click="moveUp"></el-button>
      <el-button icon="el-icon-arrow-down" :type="moveDownType" @click="moveDown"></el-button>
    </el-button-group>
  </el-form-item>

  <el-form-item v-show="mergeShow" style="margin-bottom:0px;">
    <template slot="label"> 
        <span>
        Merge to parent folder  <i class="fal fa-info-circle hastip " :title="mergeTipText"></i>
        </span> 
    </template>
    <el-button type="primary" @click="merge">
        <i class="el-icon-arrow-up"></i>
    </el-button>
  </el-form-item>

  <el-form-item v-show="mergeableShow" style="margin-bottom:0px;">
    <template slot="label"> 
        <span>
        Merge sub-folders <i class="fal fa-info-circle hastip " title="If enabled, the drop down lists all sub-folders that have can be merged to this folder."></i>
        </span> 
    </template>
    <el-dropdown trigger="click" @command="mergeCommand" :hide-on-click="false" style="width: 100%;">
      <el-button type="primary" :disabled="mergeableDisabled" ref="pmergeButton" style="width: 100%;">
        <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown" >
        <el-dropdown-item v-for="item in mergeableItems" :command="item.id" :key="item.id">
            <i class="el-icon-circle-plus-outline"></i>  {{ item.title + ' (' + item.nItems + ')' }}
        </el-dropdown-item>        
      </el-dropdown-menu>
    </el-dropdown>  
  </el-form-item>

  <el-form-item v-show="unmergeShow" style="margin-bottom:0px;">
    <template slot="label"> 
        <span>
        Unmerge sub-folders <i class="fal fa-info-circle hastip " title="If enabled, the drop down lists all sub-folders that have been merged to this folder."></i>
        </span> 
    </template>
    <el-dropdown trigger="click" @command="unmergeCommand" :hide-on-click="false" style="width: 100%;">
      <el-button type="primary" :disabled="unmergeDisabled" ref="unmergeButton" style="width: 100%;">
        <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown" >
        <el-dropdown-item v-for="item in unmergeItems" :command="item.id" :key="item.id">
            <i class="el-icon-remove-outline"></i>  {{ item.title + ' (' + item.nItems + ')' }}
        </el-dropdown-item>        
      </el-dropdown-menu>
    </el-dropdown>  
  </el-form-item>

  <el-form-item style="margin-bottom:0px;">
    <template slot="label"> 
        <span>
        Reset to default settings <i class="fal fa-info-circle hastip " 
            title="If any changed have been made, this will remove all settings related to this folder, including settings on contained articles."></i>        
        </span> 
    </template>
    <el-button type="danger" :disabled="resetDisabled" @click="reset" icon="el-icon-refresh-right"></el-button>
  </el-form-item>

  <el-form-item label="Edit folder" style="margin-bottom:0px;">
    <el-button type="primary" icon="el-icon-edit" @click="editFolder"></el-button>
  </el-form-item>

</el-form>       
</div>
    `);

    MainAdmin.feedcatPopVue = new Vue({
        el: $('body').find('div#jnx-feedcat-admin')[0],
        data: function(){
            var pbfa = getPBFA(MainAdmin.feedcatDiv);
            return {
                moveDisplay: true,
                atTopSet: false,
                atTopSetDisabled: false,
                moveText: 'Move folder by steps',
                moveUpType: 'primary',
                moveDownType: 'primary',
                mergeShow: false,
                mergeTipText: '',
                mergeableShow: false,
                mergeableDisabled: true,
                mergeableItems: pbfa.feedcat.mergeableFeedcatItems,
                unmergeShow: false,
                unmergeDisabled: true,
                unmergeItems: pbfa.feedcat.mergedFeedcatItems,
                resetDisabled: false,
                form: {}
            }
        },
        methods: {
            moveToTop(event){
                var pbfa = getPBFA(MainAdmin.feedcatDiv);
                var fc = pbfa.feedcat;
                var vars = block.panel.pageV.vars;

                if (fc.index == 0 && fc.sort == fc.sortOriginal){                           //  already at top
                    jnx.errorMessagePop('Folder is already at top');
                    return;
                }

                if (fc.index == 0 && fc.sort != fc.sortOriginal){                           //  remove from top
                    var key = 'section.' + pbfa.feedcatId + '.sort.$unset';
                    var val = {};
                    val[vars.pageCode] = true;
                    // sendSU({key: key, value: val}, {refreshBlock: true});
                    jnx.sendSU({key: key, value: val}, pbfa.block, {refreshBlock: true});
                    return;
                }

                var sort = Math.round(pbfa.feedcats[0].sort / 2 * 1000000) / 1000000;   //  send msg to put folder at top
                var key = 'section.' + pbfa.feedcatId + '.sort.' + vars.pageCode;
                // sendSU({key: key, value: sort}, {refreshBlock: true});
                jnx.sendSU({key: key, value: sort}, pbfa.block, {refreshBlock: true});
            },
            moveUp(event){
                var pbfa = getPBFA(MainAdmin.feedcatDiv);
                var fc = pbfa.feedcat;
                var vars = block.panel.pageV.vars;
                if (fc.index == 0){
                    jnx.errorMessagePop('Folder is already at top');
                    return;
                }
                if (fc.nSteps == -1) {                                                       //  back to original place
                    var key = 'section.' + pbfa.feedcatId + '.sort.$unset';
                    var val = {};
                    val[vars.pageCode] = true;
                }else if (pbfa.feedcat.index == 1){
                    var sort = (pbfa.feedcats[pbfa.feedcat.index - 1].sort) / 2;
                    sort = Math.round(sort * 1000000) / 1000000;                        //  send msg to move up
                    var key = 'section.' + pbfa.feedcatId + '.sort.' + vars.pageCode;
                }else{
                    var sort = (pbfa.feedcats[pbfa.feedcat.index - 1].sort + pbfa.feedcats[pbfa.feedcat.index - 2].sort) / 2;
                    sort = Math.round(sort * 1000000) / 1000000;                        //  send msg to move up
                    var key = 'section.' + pbfa.feedcatId + '.sort.' + vars.pageCode;
                }
                jnx.sendSU({key: key, value: sort}, pbfa.block, {refreshBlock: true});
            },
            moveDown(event){
                var pbfa = getPBFA(MainAdmin.feedcatDiv);
                var fc = pbfa.feedcat;
                var vars = block.panel.pageV.vars;
                if (pbfa.feedcat.index == pbfa.feedcats.length - 1){
                    jnx.errorMessagePop('Folder is already at the bottom');
                    return;
                }
                if (fc.nSteps == 1) {                                                        //  back to original place
                    var key = 'section.' + pbfa.feedcatId + '.sort.$unset';
                    var sort = {};
                    sort[vars.pageCode] = true;
                }else if (pbfa.feedcat.index == pbfa.feedcats.length - 2){
                    var key = 'section.' + pbfa.feedcatId + '.sort.' + vars.pageCode;
                    var sort = pbfa.feedcats[pbfa.feedcat.index - 2].sort + 1000;
                    sort = Math.round(sort * 1000000) / 1000000;                        //  send msg to move down
                }else{
                    var key = 'section.' + pbfa.feedcatId + '.sort.' + vars.pageCode;
                    var sort = (pbfa.feedcats[pbfa.feedcat.index + 1].sort + pbfa.feedcats[pbfa.feedcat.index + 2].sort) / 2;
                    sort = Math.round(sort * 1000000) / 1000000;                        //  send msg to move down
                }
                jnx.sendSU({key: key, value: sort}, pbfa.block, {refreshBlock: true});
            },
            merge(event){
                var pbfa = getPBFA(MainAdmin.feedcatDiv);
                closePop();
                var key = 'section.' + pbfa.feedcatId + '.mergeToParent';
                jnx.sendSU({key: key, value: true}, pbfa.block, {refreshBlock: true});
            },
            mergeCommand(command){
                var pbfa = getPBFA(MainAdmin.feedcatDiv);
                pbfa.feedcat.mergeableFeedcatItems = _.filter(pbfa.feedcat.mergeableFeedcatItems, v => v.id != command);
                this.mergeableItems = _.filter(this.mergeableItems, v => v.id != command);
                this.calcButtons();
                var key = 'section.' + command + '.mergeToParent';
                jnx.sendSU({key: key, value: true}, pbfa.block, {refreshBlock: true});
            },
            unmergeCommand(command){
                var pbfa = getPBFA(MainAdmin.feedcatDiv);
                pbfa.feedcat.mergedFeedcatItems = _.filter(pbfa.feedcat.mergedFeedcatItems, v => v.id != command);
                this.unmergeItems = _.filter(this.unmergeItems, v => v.id != command);
                this.calcButtons();
                var key = 'section.' + command + '.$unset';
                jnx.sendSU({key: key, value: {mergeToParent: true}}, pbfa.block, {refreshBlock: true});
            },
            reset(){
                var pbfa = getPBFA(MainAdmin.feedcatDiv);
                var props = [];
                var key = 'section.$unset';                                     //  delete section object
                var val = {};
                val[pbfa.feedcatId] = true;
                props.push({key: key, value: val});
                var key = 'refreshBlocks.$unset';                               //  delete refreshBlocks
                var val = {};
                val.$where = {                                                  //  only ones that apply to this block
                    args: {
                        pageIdV: pbfa.pageIdV,
                        blockUrl: pbfa.blockUrl
                    },
                    function: {
                        pageId: pbfa.pageId,
                        blockId: pbfa.block.id,
                        name: 'resetRefreshBlocks'
                    }
                };
                props.push({key: key, value: val});
                jnx.sendSU(props, pbfa.block, {refreshBlock: true});
            },
            editFolder(event){
                var pbfa = getPBFA(MainAdmin.feedcatDiv);
                closePop();
                jnx.siteMisc.adminTriggersOn = false;
                var qs = jnx.singleChannelId + '&feedId=' + pbfa.feedId;
                if (!pbfa.categoryId){
                    jnx.loadPage('feed.html?mode=edit&channelId=' + qs);
                }else{
                    qs += '&categoryId=' + pbfa.categoryId;
                    jnx.loadPage('category.html?mode=edit&channelId=' + qs);
                }
                // jnx.loadPage('/pages/blog/article.html?mode=edit&articleId=' + articleId);
            },
            onChange(){
                this.calcButtons();
            },
            calcButtons() {     //  set colors and hide buttons
                removeTooltips(this.$el)
                var pbfa = getPBFA(MainAdmin.feedcatDiv);
                if (pbfa.feedcat.index == 0 && pbfa.feedcat.sort != pbfa.feedcat.sortOriginal) {   //  is set as top
                    this.atTopSet = true;
                    this.atTopSetDisabled = false;
                } else if (pbfa.feedcat.index == 0) {
                    this.atTopSet = false;
                    this.atTopSetDisabled = true;
                } else {
                    this.atTopSet = false;
                    this.atTopSetDisabled = false;
                }
                this.moveDisplay = true;

                this.moveText = 'Move folder by steps';                             //  move text (ie. +1)
                if (pbfa.feedcat.nSteps > 0) {
                    this.moveText += ' (+' + pbfa.feedcat.nSteps + ')';
                } else if (pbfa.feedcat.nSteps < 0) {
                    this.moveText += ' (-' + -pbfa.feedcat.nSteps + ')';
                }

                if (pbfa.feedcat.index == 0) {                                      //  moveUp
                    this.moveUpType = 'info';
                } else {
                    this.moveUpType = 'primary';
                }
                if (pbfa.feedcat.index == pbfa.feedcat.length - 1) {                //  moveDown
                    this.moveDownType = 'info';
                } else {
                    this.moveDownType = 'primary';
                }

                if (pbfa.feedcat.parentFolder){                                     //  merge (from subfolder)
                    this.mergeShow = true;
                    this.unmergeShow = false;
                    this.mergeTipText = 'Parent folder is \'' + pbfa.feedcat.parentFolder.title + '\'.';
                    // this.mergeTipText = 'Parent folder is ' + pbfa.feedcat.parentFolder.title + '.';
                }else{
                    this.mergeShow = false;
                    this.unmergeShow = true;
                }
                if (pbfa.feedcat.mergeableFeedcatItems.length > 0){                 //  merge (from parent folder)
                    this.mergeableShow = true;
                    this.mergeableDisabled = false;
                }else{
                    this.mergeableDisabled = true;
                }

                if (pbfa.feedcat.mergedFeedcatItems.length > 0){                    //  unmerge
                    this.unmergeDisabled = false;
                }else{
                    this.unmergeDisabled = true;
                }

                if (pbfa.feedcat.isAdjusted                                         //  reset button
                    || _.filter(pbfa.items, v => v.isAdjusted).length > 0
                ) {
                    this.resetDisabled = false;
                } else {
                    this.resetDisabled = true;
                }

                _.defer(function(el){
                    setTooltips(el);
                }, this.$el);
            }
        },
        mounted(){
            MainAdmin.isInAdminPopup = true;
            for (var sel in MainAdmin.css){
                $(this.$el).find(sel).css(MainAdmin.css[sel]);
            }
            shadeItem(true, MainAdmin.feedcatDiv);
            this.calcButtons();
            var popEl = this.$el;
            Vue.nextTick(function(){
                positionPopup(popEl);
            });
            jnx.siteMisc.adminPopupVue = this;
        },
        // updated(){},
        // watch: {},
        beforeDestroy(){
            removeTooltips(this.$el);
        }
    });
}
function createArticlePop(){                                       //  create and display article admin popup
    $('body').append(`
<div id="jnx-article-admin" class="boxShadowPop jnxAdminPopup" 
    style="position:fixed;top:6px;left:6px;background-color: #fff;padding:16px 16px 12px 16px;" 
    >
<el-form ref="form" :model="form" label-width="200px" label-position="left" size="mini">

  <el-form-item label="Place article at top" v-show="moveDisplay" style="margin-bottom:0px;text-align: center;">
    <el-switch v-model="atTopSet" :disabled="atTopSetDisabled" @change="moveToTop"></el-switch>
  </el-form-item>

  <el-form-item :label="moveText" v-show="moveDisplay" style="margin-bottom:0px;">
    <el-button-group>
      <el-button icon="el-icon-arrow-up" :type="moveUpType" @click="moveUp"></el-button>
      <el-button icon="el-icon-arrow-down" :type="moveDownType" @click="moveDown"></el-button>
    </el-button-group>
  </el-form-item>

  <el-form-item label="Set as feature" style="margin-bottom:0px;text-align: center;">
    <el-switch v-model="setAsFeature" :disabled="toggleFeatureDisabled" @change="toggleFeature"></el-switch>
  </el-form-item>

  <el-form-item label="Reset to default settings" style="margin-bottom:0px;">
    <el-button type="danger" :disabled="resetDisabled" @click="reset" icon="el-icon-refresh-right"></el-button>
  </el-form-item>

  <el-form-item label="Edit article" style="margin-bottom:0px;">
    <el-button type="primary" icon="el-icon-edit" @click="editArticle"></el-button>
  </el-form-item>

</el-form>
</div>
    `);

    MainAdmin.articlePopVue = new Vue({
        el: $('body').find('div#jnx-article-admin')[0],
        data: function(){
            return {
                moveDisplay: true,
                atTopSet: false,
                atTopSetDisabled: false,
                moveText: 'Move article by steps',
                moveUpType: 'primary',
                moveDownType: 'primary',
                setAsFeature: false,
                toggleFeatureDisabled: false,
                resetDisabled: true,
                form: {}
            }
        },
        methods: {
            moveToTop(event){

                var articleId = $(MainAdmin.articleDiv).data('jnxArticleId').toString();
                var pbfa = getPBFA(MainAdmin.articleDiv);
                var item = pbfa.item;

                if (pbfa.index == 0 && item.pubDate == item.pubDateOriginal){                //  already at top
                    jnx.errorMessagePop('Article is already at top');
                    return;
                }

                if (pbfa.index == 0 && item.pubDate != item.pubDateOriginal){               //  remove from top
                    var key = 'section.' + pbfa.feedcatId + '.article.' + pbfa.articleId + '.$unset';
                    var topDtS = {pubDate: true};
                    jnx.sendSU({key: key, value: topDtS}, pbfa.block, {refreshBlock: true});
                    return;
                }

                var topDt = new Date(new Date(pbfa.items[0].pubDate) + 1000);         //  send msg to put article at top
                var topDtS = topDt.toISOString();
                var key = 'section.' + pbfa.feedcatId + '.article.' + pbfa.articleId + '.pubDate';
                jnx.sendSU({key: key, value: topDtS}, pbfa.block, {refreshBlock: true});

            },
            moveUp(event){
                var pbfa = getPBFA(MainAdmin.articleDiv);
                if (pbfa.index == 0){
                    jnx.errorMessagePop('Article is already at top');
                    return;
                }
                if (pbfa.item.nSteps == 1){    //  negative means up
                    var key = 'section.' + pbfa.feedcatId + '.article.' + pbfa.articleId + '.$unset';
                    var topDtS = {pubDate: true};
                }else{
                    var key = 'section.' + pbfa.feedcatId + '.article.' + pbfa.articleId + '.pubDate';
                    if (pbfa.index == 1){
                        var topDt = new Date(pbfa.items[0].pubDate) + 1000 * 1000;
                    }else{
                        var dt1 = new Date(pbfa.items[pbfa.index - 1].pubDate).valueOf();
                        var dt2 = new Date(pbfa.items[pbfa.index - 2].pubDate).valueOf();
                        var topDt = (dt1 + dt2) / 2;
                    }
                    var topDt = new Date(topDt);
                    var topDtS = topDt.toISOString();
                }
                jnx.sendSU({key: key, value: topDtS}, pbfa.block, {refreshBlock: true});
            },
            moveDown(event){
                var pbfa = getPBFA(MainAdmin.articleDiv);
                if (pbfa.index == pbfa.items.length - 1){
                    jnx.errorMessagePop('Article is already at bottom');
                    return;
                }
                if (pbfa.item.nSteps == -1){
                    var topDtS = {pubDate: true};
                    var key = 'section.' + pbfa.feedcatId + '.article.' + pbfa.articleId + '.$unset';
                }else{
                    if (pbfa.index == pbfa.items.length - 2){
                        var topDt = new Date(pbfa.items[pbfa.index + 1].pubDate).valueOf() - 1000 * 1000;
                    }else{
                        var dt1 = new Date(pbfa.items[pbfa.index + 1].pubDate).valueOf();
                        var dt2 = new Date(pbfa.items[pbfa.index + 2].pubDate).valueOf();
                        var topDt = (dt1 + dt2) / 2;
                    }
                    var topDt = new Date(topDt);
                    var topDtS = topDt.toISOString();
                    var key = 'section.' + pbfa.feedcatId + '.article.' + pbfa.articleId + '.pubDate';
                }
                jnx.sendSU({key: key, value: topDtS}, pbfa.block, {refreshBlock: true});
            },
            toggleFeature(){
                var articleId = $(MainAdmin.articleDiv).data('jnxArticleId').toString();
                var pbfa = getPBFA(MainAdmin.articleDiv);
                if (this.setAsFeature){
                    var key = 'section.' + pbfa.feedcatId + '.featureArticleId';
                    var val = articleId;
                }else{
                    var key = 'section.' + pbfa.feedcatId + '.$unset';
                    var val = {featureArticleId: true};
                }
                jnx.sendSU({key: key, value: val}, pbfa.block, {refreshBlock: true});
            },
            editArticle(event){
                var articleId = $(MainAdmin.articleDiv).data('jnxArticleId').toString();
                closePop();
                // jnx.siteMisc.adminTriggersOn = false;
                jnx.loadPage('/pages/blog/article.html?mode=edit&articleId=' + articleId);
            },
            reset(){
                var pbfa = getPBFA(MainAdmin.articleDiv);
                var props = [];
                var key = 'section.' + pbfa.feedcatId + '.article.$unset';
                var val = {};
                val[pbfa.articleId] = true;
                props.push({key: key, value: val});
                if (jnx.siteSettings.section
                    && jnx.siteSettings.section[pbfa.feedcatId]
                    && jnx.siteSettings.section[pbfa.feedcatId].featureArticleId == pbfa.articleId
                ){
                    props.push({
                        key: 'section.' + pbfa.feedcatId + '.$unset',
                        value: {featureArticleId: true}
                    });
                }
                jnx.sendSU(props, pbfa.block, {refreshBlock: true});
            },
            onChange(){
                this.calcButtons();
            },
            calcButtons(){     //  set colors and hide buttons
                removeTooltips(this.$el)
                var articleId = $(MainAdmin.articleDiv).data('jnxArticleId').toString();
                var pbfa = getPBFA(MainAdmin.articleDiv);
                var resData = pbfa.resData;
                var feedcat = pbfa.feedcat;
                var items = pbfa.items;
                var item = pbfa.item;

                if (item.isFeature){
                    if (item.setAsFeature) this.moveDisplay = false;
                    this.toggleFeatureDisabled = false;
                    this.setAsFeature = item.setAsFeature;
                }else{
                    if (pbfa.index == 0 && item.pubDate != item.pubDateOriginal) {   //  is set as top
                        this.atTopSet = true;
                        this.atTopSetDisabled = false;
                    }else if (pbfa.index == 0){
                        this.atTopSet = false;
                        this.atTopSetDisabled = true;
                    }else{
                        this.atTopSet = false;
                        this.atTopSetDisabled = false;
                    }
                    this.moveDisplay = true;

                    this.moveText = 'Move article by steps';                        //  move text (ie. +1)
                    if (item.nSteps > 0){
                        this.moveText += ' (-' + -item.nSteps + ')';
                    }else if (item.nSteps < 0){
                        this.moveText += ' (+' + item.nSteps + ')';
                    }

                    if (pbfa.index == 0){                                           //  moveUp
                        this.moveUpType = 'info';
                    }else{
                        this.moveUpType = 'primary';
                    }
                    if (pbfa.index == pbfa.items.length - 1){                       //  moveDown
                        this.moveDownType = 'info';
                    }else{
                        this.moveDownType = 'primary';
                    }

                    if (item.imageUrl){                                             //  set as feature toggle
                        this.toggleFeatureDisabled = false;
                    }else{
                        this.toggleFeatureDisabled = true;
                    }
                    // if (pbfa.index == 0 && item.pubDate == item.pubDateOriginal) {  //  naturally is feature
                    //     this.toggleFeatureDisabled = true;
                    // }
                }
                if (item.isAdjusted){                                               //  reset button
                    this.resetDisabled = false;
                }else{
                    this.resetDisabled = true;
                }
                _.defer(function(el){
                    setTooltips(el);
                }, this.$el);

            },
        },
        mounted(){
            MainAdmin.isInAdminPopup = true;
            for (var sel in MainAdmin.css){
                $(this.$el).find(sel).css(MainAdmin.css[sel]);
            }
            this.calcButtons();
            positionPopup(this.$el);
            shadeItem(true, MainAdmin.articleDiv);
            jnx.siteMisc.adminPopupVue = this;
        },
        // updated(){},
        // watch: {}
        beforeDestroy(){
            removeTooltips(this.$el);
        }
    });
}

function closePagePop(){
    // clearTimeout(MainAdmin.pageAdminCloseTimer);
    if (!MainAdmin.pagePopVue) return;
    shadeItem(false);
    MainAdmin.pagePopVue.$destroy();
    delete MainAdmin.pagePopVue;
    $('div#jnx-page-admin').remove();
    delete MainAdmin.pageDiv;
    delete jnx.siteMisc.adminPopupVue;
};
function closeBlockPop(){
    // clearTimeout(MainAdmin.blockAdminCloseTimer);
    if (!MainAdmin.blockPopVue) return;
    shadeItem(false);
    MainAdmin.blockPopVue.$destroy();
    delete MainAdmin.blockPopVue;
    $('div#jnx-block-admin').remove();
    delete MainAdmin.blockDiv;
    jnx.siteMisc.adminPopupVue = null;
};
function closeFeedcatPop(){
    // clearTimeout(MainAdmin.feedcatAdminCloseTimer);
    if (!MainAdmin.feedcatPopVue) return;
    shadeItem(false);
    MainAdmin.feedcatPopVue.$destroy();
    delete MainAdmin.feedcatPopVue;
    $('div#jnx-feedcat-admin').remove();
    delete MainAdmin.feedcatDiv;
    jnx.siteMisc.adminPopupVue = null;
};
function closeArticlePop(){
    // clearTimeout(MainAdmin.articleAdminCloseTimer);
    if (!MainAdmin.articlePopVue) return;
    // $(MainAdmin.articleDiv).css({border: ''});
    shadeItem(false);
    MainAdmin.articlePopVue.$destroy();
    $('div#jnx-article-admin').remove();
    delete MainAdmin.articleDiv;
    delete MainAdmin.articlePopVue;
    jnx.siteMisc.adminPopupVue = null;
}

//  close any popup
function closePop(){
    closePagePop();
    closeBlockPop();
    closeFeedcatPop();
    closeArticlePop();
    delete MainAdmin.isInAdminPopup;
    $('div.jnx-admin-screen').remove();
}

//  position popup on screen
//  popDiv              the admin popup
//  opts.positionTo     the el that the popDiv is being aligned to
//  opts.position       where to position in relation to positionTo (ie. 'side' 'center' default=side)
function positionPopup(popDiv, opts){
    var left, top, contentDic;
    var opts = opts || {};
    var positionTo = opts.positionTo;
    var position = opts.position;

    if (popDiv.id == 'jnx-article-admin'){                                          //  article
        contentDiv = MainAdmin.articleDiv;
        if (!positionTo) positionTo = MainAdmin.articleDiv;
        if (!position) position = 'side';
    }else if (popDiv.id == 'jnx-feedcat-admin'){                                    //  feedcat
        contentDiv = MainAdmin.feedcatDiv;
        if (!positionTo) positionTo = MainAdmin.feedcatDiv;
        if ($(popDiv).outerWidth() < $(contentDiv).outerWidth() + 24){
            if (!position) position = 'center';
        }else{
            if (!position) position = 'side';
        }
    }else if (popDiv.id == 'jnx-block-admin'){                                      //  block
        // if (!positionTo) positionTo = $(MainAdmin.blockDiv).find('div[data-jnx-trigger="block"]')[0];
        contentDiv = MainAdmin.blockDiv;
        if (!positionTo) positionTo = MainAdmin.blockDiv;
        if (!position) position = 'center';
    }else if (popDiv.id == 'jnx-page-admin'){                                       //  page
        contentDiv = MainAdmin.pageDiv;
        if (!positionTo) positionTo = $(MainAdmin.pageDiv).find('div[data-jnx-trigger="page"]')[0];
        if (!position) position = 'side';
    }

    var topAdj = 0;
    var wP = popDiv.clientWidth;
    var hP = popDiv.clientHeight;
    var wT = positionTo.clientWidth;
    var hT = positionTo.clientHeight;
    var offsetT = $(positionTo).offset();
    if (position == 'side'){
        left = offsetT.left - wP - 6;                                               //  popup to left of div
        if (left < 0){                                                              //  popup to right of div
            left = offsetT.left + wT + 6;
        }
        if (left + wP > window.innerWidth){                                         //  adj popup in center of div
            left = Math.round(window.innerWidth / 2 - wP / 2);
        }
        top = offsetT.top;
    }else if (position == 'center'){                                                //  popup in center of div
        left = Math.round(offsetT.left + (wT - wP) / 2);
        top = Math.round(offsetT.top + (hT - hP) / 2);
    }

    var scrollTop = $('html')[0].scrollTop;
    if (position == 'center'){                                                      //  center of visible part of contentDiv
        var block = jnx.getBlock(contentDiv);
        var headerJQM = block.panel.pageV.blocks['header'] ? block.panel.pageV.blocks['header'].jqm : null;
        var headerH = 0;
        if (headerJQM && headerJQM.css('position') == 'fixed'){
            headerH = headerJQM.outerHeight(true);
        }
        var visibleWH = window.innerHeight - headerH;                               //  visible part of window height
        if (offsetT.top + hT > scrollTop + window.innerHeight){                     //  get content bottom offset
            var cBot = scrollTop + window.innerHeight;                              //  content past bottom of window
        }else{
            var cBot = offsetT.top + hT;
        }
        if (offsetT.top < scrollTop + headerH){                                     //  content top is hidden
            var cTop = scrollTop + headerH;
        }else{
            var cTop = offsetT.top;
        }
        var visibleCH = cBot - cTop;                                                // visible content height
        top = cTop + Math.round((visibleCH - hP) / 2);                           //  popup in middle of visible content
    }
    if (top + hP + 20 > scrollTop + window.innerHeight){                            //  past bottom of screen
        top = scrollTop + window.innerHeight - hP - 20;
    }

    // top = Math.round((window.innerHeight - $(popDiv).outerHeight()) / 2);    //  start in middle
    // if (top + hP < offsetT.top){                                                   //  too high
    //     top += offsetT.top - topP + hP;
    // }
    // if (top > offsetT.top){                                                        //  too low
    //     top = offsetT.top;
    // }

    if (top < 20) top = 20;
    offsetT.top = top;
    offsetT.left = left;
    $(popDiv).offset(offsetT);

}

//  shade given div by creating a sibling div (div only needed if show=true)
//  opts.screenOnly         true to set up screen only, do not shade div
//  - also sets up screen and event to turn on triggers when screen clicked
function shadeItem(show, div, opts){
    var opts = opts || {};
    if (show == true){                                                                  //  turn on shade
        MainAdmin.shadeDiv = div;

        if (!opts.screenOnly){
            var mTop = parseInt($(div).css('marginTop'));
            var pTop = parseInt($(div).css('paddingTop'));
            var divS = '<div class="jnx-admin-shade" style="width:100%;height:100%;position:absolute;'
                + 'margin-top: ' + (mTop+pTop) + 'px; '
                + 'top:0; left: 0;background-color: rgba(0, 0, 0, 0.08);"></div>';
            if ($(MainAdmin.shadeDiv).css('position') == 'static'){
                $(MainAdmin.shadeDiv).css({position: 'relative'});
            }
        }

        // $(MainAdmin.shadeDiv).append(divS);
        $(MainAdmin.shadeDiv).find('> div[data-jnx-trigger]').before(divS);

        var divScreen = '<div class="jnx-admin-screen" style="width:100%;height:100%;position:fixed;'
            + 'top:0; left: 0;"></div>';
        $('div.jnxAdminPopup').before(divScreen);
        $('div.jnx-admin-screen').on('click', function(){
            // $(div).find('div[data-jnx-trigger]').show();
            block.jqm.find('div[data-jnx-trigger]').show();
            $(div).closest('[data-role="page"]').find('div[data-jnx-trigger]').show();
            closePop();
        });
        // $(div).find('div[data-jnx-trigger]').hide();
        $(div).closest('[data-role="page"]').find('div[data-jnx-trigger]').hide();
    }else if (show == false) {                                                          //  turn off shade
        // $(MainAdmin.shadeDiv).css({border: ''});
        $(MainAdmin.shadeDiv).find('div.jnx-admin-shade').remove();
        delete MainAdmin.shadeDiv;
    }else{                                                                              //  re-shade if found

        if (MainAdmin.shadeDiv){



        }

    }
}

//  for given el return object with PageId, block, blockId, feedcatId, feedId, categoryId, articleId, parentBlockId
//  resData items index item flags feedcat feature sections section
function getPBFA(el){
    var obj = {};
    if (!el){
        console.log('ERROR in getPBFA - el is falsey');
        return;
    }
    obj.block = jnx.getBlock(el);
    obj.blockUrl = $(el).data('jnxBlock') || $(el).closest('[data-jnx-block]').data('jnxBlock') || null;
    obj.pageId = obj.block.panel.page.id;
    obj.pageIdV = obj.block.panel.page.idV;
    obj.parentBlockId = obj.block.parentBlock ? obj.block.parentBlock.id : null;

    obj.flags = [];
    var flagDiv = $(el).closest('[data-jnx-flags]');
    flagDiv = flagDiv.length > 0 ? flagDiv[0] : null;
    while (flagDiv){
        var addFlags = $(flagDiv).data('jnxFlags');
        if (addFlags){
            addFlags = _.isArray(addFlags) ? addFlags : [addFlags];
            obj.flags = obj.flags.concat(addFlags);
        }
        flagDiv = $(flagDiv.parentNode).closest('[data-jnx-flags]');
        flagDiv = flagDiv.length > 0 ? flagDiv[0] : null;
    }

    obj.resData = obj.block.resData || {};

    //  feedcat block
    obj.feedcats = obj.resData.feedcats;                //  create feedcats array and set indexes and current feedcat
    if (obj.feedcats){
        for (var i = 0; i < obj.feedcats.length; ++i){
            obj.feedcats[i].index = i;
        }
        if ($(el).closest('[data-jnx-feedcat-id]').length > 0){
            obj.feedcatId = $(el).data('jnxFeedcatId') || $(el).closest('[data-jnx-feedcat-id]').data('jnxFeedcatId') || null;
            obj.feedId = null;
            obj.categoryId = null;
            if (obj.feedcatId) {
                var fc = obj.feedcatId.split('-');
                obj.feedId = fc[0];
                if (fc.length > 0) obj.categoryId = fc[1];
            }
            for (var i = 0; i < obj.feedcats.length; ++i){
                if (obj.feedcats[i].id == obj.feedcatId){
                    obj.feedcat = obj.feedcats[i];
                }
            }
            obj.items = obj.feedcat.items;
            if (obj.feedcat.feature){
                obj.feature = obj.feedcat.feature;
            }
        }
    }

    //  article block
    if ($(el).closest('[data-jnx-article-id]').length > 0){
        obj.articleId = $(el).data('jnxArticleId') || $(el).closest('[data-jnx-article-id]').data('jnxArticleId').toString() || null;
        obj.index = null;
        obj.item = null;
        if (obj.articleId){
            if (obj.feature && obj.articleId == obj.feature._id){
                obj.item = obj.feature;
            }else{
                for (var i = 0; i < obj.items.length; ++i){
                    if (obj.items[i]._id == obj.articleId){
                        obj.index = i;
                        obj.item = obj.items[i];
                        break;
                    }
                }
            }
        }
    }

    return obj;
}

function setTooltips(el){
    $(el).find('.hastip').tooltipsy({                          //  initialize tool tips
        css: {
            'width': 'auto'
        },
        delay: 300,
        // hideEvent: 'click'
    });
}
function removeTooltips(el){
    var tips = $(el).find('.hastip').data('tooltipsy');
    if (tips){
        $(el).find('.hastip').data('tooltipsy').destroy();
        $('body').find('div[id^="tooltipsy"]').remove();
    }
}
function keydownFnSet(set){         //  set=true to enable detection
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    if (set){
        document.addEventListener('keydown', keydownFn, false);
        // if ((jnx.detect.tablet() || jnx.detect.mobile()) && jnx.detect.android()){
        if (jnx.detect.tablet() || jnx.detect.mobile()){
            block.jqm.on('touchstart touchmove touchend', function(event){
                jnx.sdClick2(event, null, function(){
                    setTimeout(function(){
                        if (!jnx.lastTouch.pointerIsDown){      //  do not execute if still down (is a copyPaste touch)
                            keydownFn(event);
                        }
                    }, 1000)}, 300)
            });
            // if (jnx.detect.ios()){
            //     block.jqm.on('touchstart touchmove touchend', function(event){
            //         jnx.sdClick2(event, null, keydownFn, 300)
            //     });
            // }else{
            //     block.jqm.on('contextmenu', keydownFn);
            // }
        }
    }else{      //  this is not used anywhere
        document.removeEventListener('keydown', keydownFn);
        // if ((jnx.detect.tablet() || jnx.detect.mobile()) && jnx.detect.android()){
        if ((jnx.detect.tablet() || jnx.detect.mobile()) && jnx.detect.android()){
            // if (jnx.detect.ios()){
            //
            // }else{
            //     block.jqm.off('contextmenu', keydownFn);
            // }
        }
    }
}
function keydownFn(event){
    // if (!debuggerCalled) {debuggerCalled = true;debugger;}
    if (event.key == 'Escape'
        || jnx.siteMisc.adminTriggersOn && event.type == 'contextmenu'
    ){
        closePop();
        block.jqm.find('div[data-jnx-trigger]').show();
    }
    if (event.key != 'Alt' && event.type != 'contextmenu' && event.type != 'touchstart') return;
    jnx.siteMisc.adminTriggersOn = !jnx.siteMisc.adminTriggersOn;
    if (jnx.siteMisc.adminTriggersOn){                                                    //  turn on triggers
        block.jqm.find('div[data-jnx-trigger]').show();
        moveTriggers();
    }else{                                                                      //  turn off triggers
        block.jqm.find('div[data-jnx-trigger]').hide();
        closeArticlePop();
        closeFeedcatPop();
        closeBlockPop();
        closePagePop();
    }
    // event.preventDefault();
    // event.stopImmediatePropagation();
    // event.stopPropagation();
}

function reloadPage(){
    // closeBlockPop();
    // keydownFnSet(false);
    // jnx.refreshHTMLblock(this);
    // jnx.getHTMLblocks(this, {innerOnly: true})
    jnx.getHTMLblocks(block, {innerOnly: true});
    // closePop();
}
module.exports.reloadPage = reloadPage;
