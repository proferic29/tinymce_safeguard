tinymce.PluginManager.add('lineheight', function(ed, url) {
    //Register the format, we are using a wildcard so we only need to register it once
    ed.on('init', function(e) {
        ed.formatter.register('lh', {selector : 'span', styles : {lineHeight : '%value'}});
    });

    //Generate the menu items with its values
    var lhvalues = [];
    var previousValues = '';
    for (var h = 50; h <= 200; h += 10) {
        lhvalues.push({
            text:h + ' %',
            value: h + '%',
            onclick: function() {
                setStyle('lh', this.value());
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

    ed.addButton( 'lineheight', {
        type: 'listbox',
        title: 'Line Height',
        text: 'Line Height',
        fixedWidth: true,
        values: lhvalues,
        onPostRender: function() {
            var self = this;
            var items = lhvalues;
            var formatName = 'lineheight';

            ed.on('nodeChange', function(e) {
                var formatter = ed.formatter;
                var value = null;

                each(e.parents, function(node) {

                    /*if (node.nodeName != 'SPAN')
                    {
                        return false;
                    }*/

                    if (node.style.lineHeight != null)
                    {
                        each(items, function(item)
                        {
                            if (node.style.lineHeight == item.value)
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
                    value = "120%";
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