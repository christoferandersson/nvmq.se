(function($) {

    $.fn.insertFromUrl = function(options) {
        var opts = $.extend({}, $.fn.insertFromUrl.settings, options || {})
        this.find('[data-url]').each(function() {
            var $this = $(this)
            var url = $this.data('url')
            var escape = $this.data('escape') !== undefined ? $this.data('escape') : opts.escape
            var callback = function(data) {
                if (escape) $this.text(data)
                else        $this.html(data)
                $this.parent().removeClass('prettyprinted')
                prettyPrint($this.get(0))
            }
            if ($this.data('cors')) {
                if (opts.stripProtocol)
                    url = url.replace(/^https?:\/\//, '')
                $.get(opts.corsProxy.replace('%url%', url), callback)
            }
            else
                $.get(url, callback)
        });
        return this
    }

    $.fn.insertFromUrl.settings = {
        corsProxy: 'http://www.corsproxy.com/%url%',
        stripProtocolForProxy: true, // corsproxy.com wants it this way.
        escape: true
    }

})(jQuery);
