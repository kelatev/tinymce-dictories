/*global tinymce:true */

tinymce.PluginManager.add('dictories', function (editor) {
    var attachState = {};

    function isDictories(elm) {
        return elm && elm.nodeName === 'dictories' && elm.href;
    }

    function hasDictories(elements) {
        return tinymce.util.Tools.grep(elements, isDictories).length > 0;
    }

    function createDicList(callback) {
        return function () {
            var dicList = editor.settings.dic_list;

            if (typeof dicList == "string") {
                tinymce.util.XHR.send({
                    url: dicList,
                    success: function (text) {
                        callback(tinymce.util.JSON.parse(text));
                    }
                });
            } else if (typeof dicList == "function") {
                dicList(callback);
            } else {
                callback(dicList);
            }
        };
    }

    function buildDicItems(inputList, itemCallback, startItems) {
        function appendItems(values, output) {
            output = output || [];

            tinymce.each(values, function (item) {
                var menuItem = {text: item.text || item.title};

                if (item.menu) {
                    menuItem.menu = appendItems(item.menu);
                } else {
                    menuItem.value = item.value;

                    if (itemCallback) {
                        itemCallback(menuItem);
                    }
                }

                output.push(menuItem);
            });

            return output;
        }

        return appendItems(inputList, startItems || []);
    }

    function showDialog(dicList) {
        var data = {},
            selection = editor.selection,
            dom = editor.dom,
            selectedElm, anchorElm;
        var win, textListCtrl, dicListCtrl, countListCtrl, value;

        function dicListChangeHandler(e) {
            data.value = e.control.value();
        }

        selectedElm = selection.getNode();
        anchorElm = dom.getParent(selectedElm, 'dictories[type]');

        data.value = anchorElm ? dom.getAttrib(anchorElm, 'type') : '';
        data.count = anchorElm ? Number(dom.getAttrib(anchorElm, 'count')) : 0;

        if (dicList) {
            dicListCtrl = {
                name: 'type',
                type: 'listbox',
                label: 'Link list',
                values: buildDicItems(dicList),
                onselect: dicListChangeHandler,
                value: data.value,
                onPostRender: function () {
                    /*eslint consistent-this:0*/
                    dicListCtrl = this;
                }
            };
            countListCtrl = {
                name: 'count',
                type: 'listbox',
                label: 'Items',
                values: buildDicItems([{text: '10', value: 10}, {text: '30', value: 30}, {text: 'All', value: 0}]),
                value: data.count,
                onPostRender: function () {
                    /*eslint consistent-this:0*/
                    dicListCtrl = this;
                }
            };

            win = editor.windowManager.open({
                title: 'Insert dictories',
                data: data,
                body: [
                    dicListCtrl,
                    countListCtrl
                ],
                onSubmit: function (e) {
                    data = tinymce.extend(data, e.data);

                    function createLink() {
                        var linkAttrs = {
                            value: data.value ? data.value : null,
                            count: data.count != 0 ? data.count : null
                        };

                        /*if (href === attachState.href) {
                         attachState.attach();
                         attachState = {};
                         }*/

                        if (anchorElm) {
                            editor.focus();

                            if (onlyText && data.text != initialText) {
                                if ("innerText" in anchorElm) {
                                    anchorElm.innerText = data.text;
                                } else {
                                    anchorElm.textContent = data.text;
                                }
                            }

                            dom.setAttribs(anchorElm, linkAttrs);

                            selection.select(anchorElm);
                            editor.undoManager.add();
                        } else {
                            editor.insertContent(dom.createHTML('dictories', linkAttrs));
                        }
                    }

                    function insertLink() {
                        editor.undoManager.transact(createLink);
                    }

                    insertLink();
                }
            });
        }

    }

    /*editor.on('preInit', function() {
     function hasImageClass(node) {
     var className = node.attr('class');
     return className && /\bimage\b/.test(className);
     }

     function toggleContentEditableState(state) {
     return function(nodes) {
     var i = nodes.length, node;

     function toggleContentEditable(node) {
     node.attr('contenteditable', state ? 'true' : null);
     }

     while (i--) {
     node = nodes[i];

     if (hasImageClass(node)) {
     node.attr('contenteditable', state ? 'false' : null);
     tinymce.each(node.getAll('figcaption'), toggleContentEditable);
     }
     }
     };
     }

     editor.parser.addNodeFilter('figure', toggleContentEditableState(true));
     editor.serializer.addNodeFilter('figure', toggleContentEditableState(false));
     });*/

    editor.addButton('dictories', {
        text: 'dic',
        icon: false,
        tooltip: 'Insert/edit dictories',
        onclick: createDicList(showDialog),
        stateSelector: 'dictories[type]'
    });

    /*editor.addMenuItem('image', {
     icon: 'image',
     text: 'Image',
     onclick: createImageList(showDialog),
     context: 'insert',
     prependToContext: true
     });

     editor.addCommand('mceImage', createImageList(showDialog));*/
});
