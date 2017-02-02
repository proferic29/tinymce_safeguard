/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */
/*eslint consistent-this:0 */

tinymce.PluginManager.add('textcolor', function(editor) {
	var cols, rows, customCols;

	rows = editor.settings.textcolor_rows || 5;
	cols = editor.settings.textcolor_cols || 8;
	customCols = 2;

	function getCurrentColor(format) {
		var color;

		editor.dom.getParents(editor.selection.getStart(), function(elm) {
			var value;

			if ((value = elm.style[format == 'forecolor' ? 'color' : 'background-color'])) {
				color = value;
			}
		});

		return color;
	}

	function mapColors() {
		var i, colors = [], colorMap;

		colorMap = editor.settings.textcolor_map || [
			"000000", "Black",
			"993300", "Burnt orange",
			"333300", "Dark olive",
			"003300", "Dark green",
			"003366", "Dark azure",
			"000080", "Navy Blue",
			"333399", "Indigo",
			"333333", "Very dark gray",
			"800000", "Maroon",
			"FF6600", "Orange",
			"808000", "Olive",
			"008000", "Green",
			"008080", "Teal",
			"0000FF", "Blue",
			"666699", "Grayish blue",
			"808080", "Gray",
			"FF0000", "Red",
			"FF9900", "Amber",
			"99CC00", "Yellow green",
			"339966", "Sea green",
			"33CCCC", "Turquoise",
			"3366FF", "Royal blue",
			"800080", "Purple",
			"999999", "Medium gray",
			"FF00FF", "Magenta",
			"FFCC00", "Gold",
			"FFFF00", "Yellow",
			"00FF00", "Lime",
			"00FFFF", "Aqua",
			"00CCFF", "Sky blue",
			"993366", "Red violet",
			"FFFFFF", "White",
			"FF99CC", "Pink",
			"FFCC99", "Peach",
			"FFFF99", "Light yellow",
			"CCFFCC", "Pale green",
			"CCFFFF", "Pale cyan",
			"99CCFF", "Light sky blue",
			"CC99FF", "Plum"
		];

		for (i = 0; i < colorMap.length; i += 2) {
			colors.push({
				text: colorMap[i + 1],
				color: '#' + colorMap[i]
			});
		}

		return colors;
	}

	function renderColorPicker() {
		var ctrl = this, colors, color, html, last, x, y, i, id = ctrl._id, count = 0;

		function getColorCellHtml(color, title) {
			var isNoColor = color == 'transparent';

			return (
				'<td class="mce-grid-cell' + (isNoColor ? ' mce-colorbtn-trans' : '') + '">' +
					'<div id="' + id + '-' + (count++) + '"' +
						' data-mce-color="' + (color ? color : '') + '"' +
						' role="option"' +
						' tabIndex="-1"' +
						' style="' + (color ? 'background-color: ' + color : '') + '"' +
						' title="' + tinymce.translate(title) + '">' +
						(isNoColor ? '&#215;' : '') +
					'</div>' +
				'</td>'
			);
		}

		colors = mapColors();
		colors.push({
			text: tinymce.translate("No color"),
			color: "transparent"
		});

		html = '<table class="mce-grid mce-grid-border mce-colorbutton-grid" role="list" cellspacing="0"><tbody>';
		last = colors.length - 1;

		for (y = 0; y < rows; y++) {
			html += '<tr>';

			for (x = 0; x < cols; x++) {
				i = y * cols + x;

				if (i > last) {
					html += '<td></td>';
				} else {
					color = colors[i];
					html += getColorCellHtml(color.color, color.text);
				}
			}

			html += '</tr>';
		}

		if (editor.settings.color_picker_callback) {
			html += (
				'<tr>' +
					'<td colspan="' + cols + '" class="mce-custom-color-btn">' +
						'<div id="' + id + '-c" class="mce-widget mce-btn mce-btn-small mce-btn-flat" ' +
							'role="button" tabindex="-1" aria-labelledby="' + id + '-c" style="width: 100%">' +
							'<button type="button" role="presentation" tabindex="-1">' + tinymce.translate('Custom...') + '</button>' +
						'</div>' +
					'</td>' +
				'</tr>'
			);

			var customColor = mainToolsFunction.getTemporaryCustomColor();


			for (y = 0; y < 2; y++)
			{
				html += '<tr>';

				for (x = 0; x < cols; x++) {
					i = y * cols + x;

					if (i > customColor.length - 1)
					{
						html += getColorCellHtml('', 'Custom color');
					}
					else
					{
						html += getColorCellHtml(customColor[i], 'Custom color');
					}
				}

				html += '</tr>';
			}
		}

		html += '</tbody></table>';

		return html;
	}

	function applyFormat(format, value) {
		editor.undoManager.transact(function() {
			editor.focus();
			editor.formatter.apply(format, {value: value});
			editor.nodeChanged();
		});
	}

	function removeFormat(format) {
		editor.undoManager.transact(function() {
			editor.focus();
			editor.formatter.remove(format, {value: null}, null, true);
			editor.nodeChanged();
		});
	}

	function onMouseOverPanel(e)
	{

	}

	function onPanelClick(e) {
		var buttonCtrl = this.parent(), value;

		function selectColor(value) {
			buttonCtrl.hidePanel();
			buttonCtrl.color(value);
			applyFormat(buttonCtrl.settings.format, value);
		}

		function resetColor() {
			buttonCtrl.hidePanel();
			buttonCtrl.resetColor();
			removeFormat(buttonCtrl.settings.format);
		}

		function setDivColor(div, value) {
			div.style.background = value;
			div.setAttribute('data-mce-color', value);
		}

		if (tinymce.DOM.getParent(e.target, '.mce-custom-color-btn')) {
			buttonCtrl.hidePanel();

			editor.settings.color_picker_callback.call(editor, function(value) {
				var tableElm = buttonCtrl.panel.getEl().getElementsByTagName('table')[0];
				var customColorCells, customColorCells2, div, i, foundFirstRow, foundSecondRow, isNewCustomColor;

				isNewCustomColor = mainToolsFunction.addTemporaryCustomColorSelection(value);

				if (isNewCustomColor == true)
				{
					foundFirstRow = false;
					foundSecondRow = false;
					customColorCells = tinymce.map(tableElm.rows[tableElm.rows.length - 2].childNodes, function(elm) {
						return elm.firstChild;
					});

					customColorCells2 = tinymce.map(tableElm.rows[tableElm.rows.length - 1].childNodes, function(elm) {
						return elm.firstChild;
					});

					for (i = 0; i < customColorCells.length; i++) {
						div = customColorCells[i];
						if (!div.getAttribute('data-mce-color')) {
							foundFirstRow = true;
							break;
						}
					}

					if (foundFirstRow == false)
					{
						for (i = 0; i < customColorCells2.length; i++) {
							foundSecondRow = true;
							div = customColorCells2[i];
							if (!div.getAttribute('data-mce-color')) {
								break;
							}
						}
					}

					// Shift colors to the right
					// TODO: Might need to be the left on RTL
					if (i == cols) {
						for (i = 0; i < cols - 1; i++) {
							if (foundFirstRow == true)
							{
								setDivColor(customColorCells[i], customColorCells[i + 1].getAttribute('data-mce-color'));
							}
							else if (foundSecondRow == true)
							{
								setDivColor(customColorCells2[i], customColorCells2[i + 1].getAttribute('data-mce-color'));
							}
						}
					}

					//setDivColor(div, value);
				}

				selectColor(value);
			}, getCurrentColor(buttonCtrl.settings.format));
		}

		value = e.target.getAttribute('data-mce-color');
		if (value) {
			if (this.lastId) {
				document.getElementById(this.lastId).setAttribute('aria-selected', false);
			}

			e.target.setAttribute('aria-selected', true);
			this.lastId = e.target.id;

			if (value == 'transparent') {
				resetColor();
			} else {
				selectColor(value);
			}
		} else if (value !== null) {
			buttonCtrl.hidePanel();
		}
	}

	function onButtonClick() {
		var self = this;

		if (self._color) {
			applyFormat(self.settings.format, self._color);
		}
		/*else {
			removeFormat(self.settings.format);
		}*/
	}

	function onMouseDownClick()
	{
		var buttonCtrl = this, value;

		function setDivColor(div, value) {
			div.style.background = value;
			div.setAttribute('data-mce-color', value);
		}

		if (buttonCtrl.panel != undefined)
		{
			var tableElm = buttonCtrl.panel.getEl().getElementsByTagName('table')[0];
			var x, y, customColorCells, customColorCells2, div, i, foundFirstRow, foundSecondRow, isNewCustomColor;

			var customColor = mainToolsFunction.getTemporaryCustomColor();

			customColorCells = tinymce.map(tableElm.rows[tableElm.rows.length - 2].childNodes, function(elm) {
				return elm.firstChild;
			});

			customColorCells2 = tinymce.map(tableElm.rows[tableElm.rows.length - 1].childNodes, function(elm) {
				return elm.firstChild;
			});


			for (y = 0; y < 2; y++)
			{
				for (x = 0; x < cols; x++)
				{
					i = y * cols + x;

					if (y == 0)
					{
						setDivColor(customColorCells[x], customColor[i]);
					}
					else if (y == 1)
					{
						setDivColor(customColorCells2[x], customColor[i]);
					}
				}
			}
		}
	}

	editor.addButton('forecolor', {
		type: 'colorbutton',
		tooltip: 'Text color',
		format: 'forecolor',
		panel: {
			role: 'application',
			ariaRemember: true,
			html: renderColorPicker,
			onclick: onPanelClick
		},
		onclick: onButtonClick,
		onmousedown : onMouseDownClick
	});

	editor.addButton('backcolor', {
		type: 'colorbutton',
		tooltip: 'Background color',
		format: 'hilitecolor',
		panel: {
			role: 'application',
			ariaRemember: true,
			html: renderColorPicker,
			onclick: onPanelClick
		},
		onclick: onButtonClick,
		onmousedown : onMouseDownClick
	});
});
