// Set up the url watcher.
var Router = Backbone.Router.extend({
    routes: {
        ':urn':   'openPage',
        '':       'openPageIndex',
        '*route': 'defaultRoute'
    },
    initialize: function(options) {
        this.model = options.model
    },
    openPage: function(urn) {
        console.log('openPage')
        this.model.set({urn: urn})
        this.model.fetch()
    },
    openPageIndex: function() {
        this.openPage('index')
    },
    defaultRoute: function(route) {
        // Redirect trailing slash to no trailing slash.
        var routeClean = route.slice(0,-1)
        if (route !== routeClean)
            this.navigate(routeClean, {trigger:true, replace:true})
        else
            console.log('No route: ' + route)
    }
});


// Set up the tooltip creator function.
(function($) {

    // Todo: make own, better style.
    Opentip.styles.dark.borderRadius = 5

    $.fn.tooltip = function(options) {
        var opts = $.extend({}, $.fn.tooltip.settings, options || {})
        this.find('[data-tooltip]').each(function() {
            var $this = $(this)
            var content = $this.data('tooltip')
            $this.opentip(content, opts)
        });
        return this
    }

    $.fn.tooltip.settings = {
        style: "dark",
        hideDelay: null,
        target: true,
        targetJoint: 'bottom',
        tipJoint: 'top'
    }

})(jQuery);


PageSlim = Backbone.Model.extend({
    urlRoot: '/page',
    idAttribute: 'urn',
    initialize: function() {
        var urn = window.location.pathname.substr(1)
        if (urn === '')
            urn = 'index'
        this.set('urn', urn)
        this.fetch()
    }
})

PageSlimView = Backbone.View.extend({
    firstUpdateBody: true,
    firstUpdateTitle: true,
    initialize: function() {
        this.listenTo(this.model, 'change:body', this.updateBody)
        this.listenTo(this.model, 'change:title', this.updateTitle)
        this.listenTo(this.model, 'change', this.onchange)
    },
    onchange: function() {
        window.onbeforeunload = function() { return 'You have unsaved changes.' }
    },
    updateBody: function() {
        if (this.firstUpdateBody) { this.firstUpdateBody = false; return }
        console.log('updated body')
        if (this.model.get('format') === 'md') {
            if (typeof(md2html) === 'undefined')
                md2html = (new Markdown.Converter()).makeHtml
            this.$el.html(md2html(this.model.get('body')))
        }
        else
            this.$el.html(this.model.get('body'))
        // Run MathJax on the entire document.
        MathJax.Hub.Queue(['Typeset', MathJax.Hub])
        // Run prettify on the entire document.
        this.$el.find('pre code').parent().addClass('prettyprint')
        prettyPrint(this.$el.get(0))
        // Set tooltips and insert conten from url.
        this.$el.tooltip().insertFromUrl()
    },
    updateTitle: function() {
        if (this.firstUpdateTitle) { this.firstUpdateTitle = false; return }
        console.log('updated title')
        $(document).attr('title', this.model.get('title'))
    }
})

FullEditorView = Backbone.View.extend({
    visible: false,
    initialize: function() {
        this.$el.css({
            'display': 'none',
            'padding-top': '1em'
        })
        $('body').append(this.$el)
        this.cm = CodeMirror(this.$el.get(0), {
            mode: 'md',
            value: 'fetching',
            lineWrapping: true,
        })
        this.listenTo(this.model, 'change:body', function() {
            this.cm.setValue(this.model.get('body'))
        })
        // Set up event listeners.
        this.listenTo(this.model, 'change:format', function() {
            var format = this.model.get('format')
            if (format === 'html')
                var mode = 'htmlmixed'
            else if (format === 'md')
                var mode = 'markdown'
            this.cm.setOption('mode', mode)
        })
    },
    toggle: function() {
        $('#content').toggle()
        this.$el.toggle()
        this.visible = !this.visible
        if (!this.visible)
            this.model.set('body', this.cm.getValue())
        else
            this.cm.refresh() // This seems to be needed to render the
                              // editor properly after it has been
                              // hidden. However, it causes the cursor
                              // to jump up to the top - find a workaround.
    }
});

// Initialize DOM-dependent code.
$(function() {
    // Set tooltips and insert conten from url.
    $('#content').tooltip().insertFromUrl()
    $('body').tooltip()
    // Code highlighting
    $('#content').find('pre code').parent().addClass('prettyprint')
    prettyPrint($('#content').get(0))

    $(document).keydown(function(e) {
        // Toggle editor.
        if ((e.which === 69) && e.ctrlKey) {
            e.preventDefault()
            if (typeof(pageSlim) === 'undefined')
                pageSlim = new PageSlim()
            if (typeof(pageSlimView) === 'undefined')
                pageSlimView = new PageSlimView({model:pageSlim, el:$('#content')})
            if (typeof(fullEditorView) === 'undefined')
                fullEditorView = new FullEditorView({model:pageSlim})
            fullEditorView.toggle()
        }
        // Save page.
        else if ((e.which === 83) && e.ctrlKey) {
            function save() {
                if (typeof(pageSlim) === 'undefined')
                    return
                pageSlim.save({}, {
                    success: function(model, response, options) {
                        window.onbeforeunload = null
                        alert("Successfully saved '" + model.get('urn') + "'.")
                    },
                    error: function(model, xhr, options) {
                        alert("Failed to save '" + model.get('urn') + "' to server.\n\n" +
                              xhr.status + ' (' + xhr.statusText + ')\n\n' + xhr.responseText)
                    }
                })
            }
            e.preventDefault()
            save()
        }
    })
})


function oldInit() {
    // Set up the markdown converter, the module being used is pagedown.
    md2html = (new Markdown.Converter()).makeHtml
    // Initialize page model.
    page = new Page()
    // Initialize router.
    appRouter = new Router({model: page})
    Backbone.history.start({pushState:true});
    // Initialize widgets.
    pageView    = new PageView   ({ model: page, el: $('body') })
    metaView    = new MetaView   ({ model: page })
    codeView    = new CodeView   ({ model: page })
    wysiwygView = new WysiwygView({ model: page })
    statusView  = new StatusView ({ model: page })
}

// Get last updates
// $(function() {
//     var lastUpdatesElem = $('#last-updates')
//     lastUpdatesElem.click(function() {
//         $.getJSON('/api/lastUpdates', function(data) {
//             var ul = $('<ul>')
//             $.each(data, function(key, val) {
//                 ul.append('<li><a href="/'+val.urn+'" title="'+val.date+'">'+val.urn+'</a>')
//             })
//             lastUpdatesElem.append(ul)
//         })
//         lastUpdatesElem.css({'cursor':'default'})
//     })
// })


$(function() {
    $('#toc').tocify({context: '#content', selectors: 'h1,h2,h3,h4', theme: 'none', hashGenerator: 'pretty'})
})
