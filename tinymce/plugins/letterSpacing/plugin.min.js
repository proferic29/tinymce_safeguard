tinymce.PluginManager.add('letterSpacing', function(ed, url) {
    //Register the format, we are using a wildcard so we only need to register it once
    ed.on('init', function(e) {
        ed.formatter.register('cs', {inline : 'span', styles : {letterSpacing : '%value'}});
    });

    //Generate the menu items with its values
    var lsvalues = [];
    var previousValues = '';
    for (var h = -10; h <= 50; h += 1) {
        lsvalues.push({
            text:h + ' pt',
            value: h + 'pt',
            onclick: function() {
                setStyle('cs', this.value());
            }
        });
    }

    //the function that toggles the inline style
    function setStyle(format, v) {

        if (v != previousValues)
        {
            previousValues = v;
            ed.focus();
            ed.formatter.toggle(format, {value: v});
            ed.nodeChanged();
        }
    }

    ed.addButton( 'letterSpacing', {
        type: 'listbox',
        title: 'Letter Spacing',
        text: 'Letter Spacing',
        fixedWidth: true,
        values: lsvalues,
        onPostRender: function() {
            var self = this;
            var items = lsvalues;
            var formatName = 'letterSpacing';

            ed.on('nodeChange', function(e) {
                var formatter = ed.formatter;
                var value = null;

                each(e.parents, function(node) {

                    if (node.style.letterSpacing != null)
                    {
                        each(items, function(item)
                        {

                            if (node.style.letterSpacing == item.value)
                            {
                                value = item.value;
                            }

                            if (value) {
                                return false;
                            }
                        });
                    }

                    if (value) {
                        return false;
                    }
                });

                if (value == null)
                {
                    value = "0pt";
                }

                self.value(value);
                previousValues = value;
            });
        }
    });

});

function each(o, cb, s)
{
    var n, l;

    if (!o) {
        return 0;
    }

    s = s || o;

    if (o.length !== undefined) {
        // Indexed arrays, needed for Safari
        for (n = 0, l = o.length; n < l; n++) {
            if (cb.call(s, o[n], n, o) === false) {
                return 0;
            }
        }
    } else {
        // Hashtables
        for (n in o) {
            if (o.hasOwnProperty(n)) {
                if (cb.call(s, o[n], n, o) === false) {
                    return 0;
                }
            }
        }
    }

    return 1;
}