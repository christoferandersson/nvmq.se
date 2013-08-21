var StatusView = Backbone.View.extend({
    template:
        '<div id="status">' +
        '  <p class="user"></p>' +
        '  <hr>' +
        '  <p data-tooltip="' +
        '    The colored boxes provide extra functionality.' +
        '    <ul>' +
        '      <li>The <span style=\'background:blue;\'>blue</span> box shows metadata and allows it to be modified.</li>' +
        '      <li>The <span style=\'background:green;\'>green</span> box enables the WYSIWYG editor.</li>' +
        '      <li>The <span style=\'background:red;\'>red</span> box pops up the code editor.</li>' +
        '    </ul>">' +
        '    What is this?</p>' +
        '  <div class="status"></div>' +
        '</div>',
    initialize: function() {
        this.$el = $(this.template)
        $('body').append(this.$el)
        this.userStatus = this.$el.find('.user').get(0)
        $.getJSON('/auth/user', function(data) {
            if (data.name)
                this.userStatus.innerHTML = 'Signed in as: <a href="/auth/user">' + data.name + '</a>'
            else
                this.userStatus.innerHTML = '<a href="/auth/facebook" target="_blank" class="login">Log in</a>'
        }.bind(this))
    },
    events: {
        'click .login':         'loginPending',
        'click .login-refresh': 'loginRefresh'
    },
    loginPending: function() {
        this.userStatus.innerHTML += ' (<a id="login-refresh">refresh</a>)'
    },
    loginRefresh: function() {
        $.getJSON('/auth/user', function(data) {
            if (data.name)
                this.userStatus.innerHTML = 'Signed in as: <a href="/auth/user">' + data.name + '</a>'
        }.bind(this))
    }
})
