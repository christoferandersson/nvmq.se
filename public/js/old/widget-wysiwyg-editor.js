var WysiwygView = Backbone.View.extend({
    template:
        '<div id="wysiwyg">' +
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
        this.$el.draggable({handle: '#wysiwyg .toggler',
                            scroll: false,
                            containment: 'window',
                            stack: '#widgets > div',
                            start: function(event) {
                                $(this).find('.toggler').addClass('noclick')
                            }
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
            this.toggleWysiwyg(event)
            this.toggleColor(toggler)
            this.toggling = this.toggling === 'off' ? 'on' : 'off'
        }
    },
    toggleWysiwyg: function(event) {
        var elem = $('#content').get(0)
        if (this.toggling === 'off') {
            elem.contentEditable = 'true'
            $('#content').html(this.model.get('body'))
        } else {
            elem.contentEditable = 'false'
            this.model.set('body', $('#content').html(), { silent: true })
            this.model.trigger('change:body')
        }
    },
    toggleColor: function(toggler) {
        if (this.toggling === 'off')
            toggler.stop().animate({'background-color': 'green'})
        else
            toggler.stop().animate({'background-color': 'rgba(0,0,0,0)'})
    }
})
