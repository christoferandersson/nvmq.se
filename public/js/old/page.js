// var Page = Backbone.Model.extend({
//     urlRoot: '/page',
//     idAttribute: 'urn'
// })

// var PageView = Backbone.View.extend({
//     initialize: function() {
//         this.listenTo(this.model, 'change:body', this.renderBody)
//         this.listenTo(this.model, 'change:title', this.renderTitle)
//     },
//     events: {
//         'click #save': 'save',
//     },
//     save: function() {
//         // Remember that this triggers a "change" event.
//         this.model.save({}, {
//             success: function(model, response, options) {
//                 console.log('Successfully saved ' + model.get('urn'))
//             },
//             error: function(model, xhr, options) {
//                 // console.log('Full dump of returned XHR error:')
//                 // console.log(xhr)
//                 alert("Failed to save '" + model.get('urn') + "' to server.\n\n" +
//                       xhr.status + ' (' + xhr.statusText + ')\n\n' + xhr.responseText)
//             }
//         })
//     },
//     renderBody: function() {
//         // Render content based on page format.
//         if (this.model.get('format') === 'md')
//             $('#content').html(md2html(this.model.get('body')))
//         else
//             $('#content').html(this.model.get('body'))
//         // Run MathJax on the entire document.
//         MathJax.Hub.Queue(['Typeset', MathJax.Hub])
//         // Run prettify on the entire document.
//         $('#content').find('pre code').parent().addClass('prettyprint')
//         prettyPrint($('#content').get(0))
//         // Set tooltips and insert conten from url.
//         $('#content').tooltip().insertFromUrl()
//     },
//     renderTitle: function() {
//         $(document).attr('title', this.model.get('title'))
//     }
//     // renderLive: function() {
//     //     $('#content').html(this.editor.get('value'))
//     //     MathJax.Hub.Queue(['Typeset', MathJax.Hub])
//     //     $(document).attr('title', this.model.get('title'))
//     // }
// })
