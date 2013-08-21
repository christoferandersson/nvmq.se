var CodeView = Backbone.View.extend({
    template:
        '<div id="code">' +
        '  <div class="toggler"></div>' +
        '  <div class="innerwrap">' +
        '    <div class="content"></div>' +
        '  </div>' +
        '</div>',
    toggling: 'off',
    initialize: function() {
        this.$el = $(this.template)
        $('#widgets').append(this.$el)
        // Make element draggable.
        this.$el.draggable({handle: '#code .toggler',
                            scroll: false,
                            containment: 'window',
                            stack: '#widgets > div',
                            start: function(event) {
                                $(this).find('.toggler').addClass('noclick')
                            }
                           })
        // Set up the CodeMirror editor.
        this.cm = CodeMirror(this.$el.find('.content').get(0), {
            mode: 'htmlmixed',
            autoCloseTags: true,
            value: 'If you see this text something is wrong.. :)',
            lineWrapping: true,
            lineNumbers: true
        })
        // Set up event listeners.
        this.listenTo(this.model, 'change:body', function() {
            this.cm.setValue(this.model.get('body'))
        })
        this.listenTo(this.model, 'change:format', function() {
            var format = this.model.get('format')
            if (format === 'html')
                var mode = 'htmlmixed'
            else if (format === 'md')
                var mode = 'markdown'
            this.cm.setOption('mode', mode)
        })
    },
    events: {
        'click .toggler': 'toggle'
    },
    toggle: function(event) {
        var toggler = $(event.target)
        if (toggler.hasClass('noclick'))
            toggler.removeClass('noclick')
        else {
            this.$el.find('.innerwrap').stop().animate({height:'toggle', width:'toggle'})
            this.refreshCm()
            this.toggleColor(toggler)
            this.toggling = this.toggling === 'on' ? 'off' : 'on'
        }
    },
    toggleColor: function(toggler) {
        if (this.toggling === 'off')
            toggler.stop().animate({'background-color': 'red'})
        else
            toggler.stop().animate({'background-color': 'rgba(0,0,0,0)'})
    },
    refreshCm: function() {
        if (this.$el.css('display') !== 'none') {
            this.cm.refresh()
            this.model.set('body', this.cm.getValue())
        }
    }
})
