//
//  frontBody-admin.js
//

// debugger;

//  Reset siteSettings related to this block
//  - this = frontBody block
module.exports.reset = function(){
    var props = [];
    var key = '$unset';                                         //  delete all section objects
    var val = {};
    val['section'] = true;
    props.push({key: key, value: val});
    var key = 'refreshBlocks.$unset';                               //  delete refreshBlocks
    var val = {};
    val.$where = {                                                  //  only ones that apply to this block
        args: {
            pageIdV: this.panel.pageV.idV,
            blockUrl: this.id + '.html'
        },
        function: {
            pageId: this.panel.page.id,
            blockId: this.id,
            name: 'resetRefreshBlocks'
        }
    };
    props.push({key: key, value: val});
    jnx.sendSU(props, this, {refreshBlock: true});
};
