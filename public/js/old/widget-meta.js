var MetaView = Backbone.View.extend({
    template:
        '<div id="meta">' +
        '  <div class="toggler"></div>' +
        '  <div class="innerwrap">' +
        '    <div class="content">' +
        '      <p>Last update: <span class="updated">2061-09-27 14:25</span></p>' +
        '      <hr>' +
        '      <p>Authors (last edit)</p>' +
        '      <ul class="authors"></ul>' +
        '    </div>' +
        '  </div>' +
        '</div>',
    toggling: 'off',
    initialize: function() {
        this.$el = $(this.template)
        $('#widgets').append(this.$el)
        // Make element draggable.
        this.$el.draggable({handle: '#meta .toggler',
                            scroll: false,
                            containment: 'window',
                            stack: '#widgets > div',
                            start: function(event) {
                                $(this).find('.toggler').addClass('noclick')
                            }
                           })
        this.listenTo(this.model, 'change', this.update)
        this.listenTo(this.model, 'change:authors', this.updateAuthors)
    },
    events: {
        'click .toggler': 'toggle'
    },
    update: function() {
        this.$el.find('.updated').text(this.model.get('updated') || 'unspecified')
        this.$el.find('.urn').text(this.model.get('urn'))
        this.$el.find('.title').text(this.model.get('title'))
        this.$el.find('.format').val(this.model.get('format'))
    },
    updateAuthors: function() {
        // Todo: Do this smarter with _ templates.
        var authorsElem = this.$el.find('.authors').get(0)
        authorsElem.innerHTML = ''
        var authorIDs = this.model.get('authors')
        for (var i = 0; i < authorIDs.length; i++) {
            $.getJSON('http://graph.facebook.com/' + authorIDs[i], function(data) {
                authorsElem.innerHTML += '<li>' + data.name + '</li>'
            }).error(function(authorID) {
                return function() {
                    authorsElem.innerHTML += '<li>id: ' + authorID + '</li>'
                }
            }(authorIDs[i]))
        }
    },
    toggle: function(event) {
        var toggler = $(event.target)
        if (toggler.hasClass('noclick'))
            toggler.removeClass('noclick')
        else {
            this.$el.find('.innerwrap').stop().animate({height:'toggle', width:'toggle'})
            this.toggleColor(toggler)
            this.toggling = this.toggling === 'off' ? 'on' : 'off'
        }
    },
    toggleColor: function(toggler) {
        if (this.toggling === 'off')
            toggler.stop().animate({'background-color': 'blue'})
        else
            toggler.stop().animate({'background-color': 'rgba(0,0,0,0)'})
    }
})
