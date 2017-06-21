(function () {

    tinymce.PluginManager.requireLangPack('dictories');

    tinymce.create('tinymce.plugins.Dictories', {
        init: function (editor, url) {
            //}
            //tinymce.PluginManager.add('dictories', function (editor) {
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

                    if (typeof dicList === "string") {
                        tinymce.util.XHR.send({
                            url: dicList,
                            success: function (text) {
                                callback(tinymce.util.JSON.parse(text));
                            }
                        });
                    } else if (typeof dicList === "function") {
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
                    dicElm;
                var dicListCtrl, countListCtrl;

                var countList = [{text: '10', value: 10}, {text: '30', value: 30}, {text: 'All', value: 0}],
                    countDefault = 0;

                dicElm = selection.getNode();
                if (dicElm && (dicElm.nodeName !== 'DICTORIES')) {
                    dicElm = null;
                }

                data.value = dicElm ? dom.getAttrib(dicElm, 'type') : '';
                data.count = dicElm ? Number(dom.getAttrib(dicElm, 'count')) : countDefault;

                if (dicList) {
                    dicListCtrl = {
                        name: 'type',
                        type: 'listbox',
                        label: tinymce.i18n.translate('Link list'),
                        values: buildDicItems(dicList),
                        onSelect: function (e) {
                            data.type = e.control.value();
                        },
                        value: data.value
                    };
                    countListCtrl = {
                        name: 'count',
                        type: 'listbox',
                        label: tinymce.i18n.translate('Items'),
                        values: buildDicItems(countList),
                        value: data.count
                    };

                    editor.windowManager.open({
                        title: tinymce.i18n.translate('Insert dictories'),
                        data: data,
                        body: [
                            dicListCtrl,
                            countListCtrl
                        ],
                        onSubmit: function (e) {
                            data = tinymce.extend(data, e.data);

                            function createLink() {
                                var linkAttr = {
                                    type: data.type ? data.type : data.value,
                                    count: data.count ? data.count : countDefault
                                };

                                editor.focus();

                                if (dicElm) {
                                    dom.setAttribs(dicElm, linkAttr);
                                    editor.undoManager.add();
                                } else {
                                    editor.insertContent(dom.createHTML('dictories', linkAttr));
                                    editor.insertContent('&nbsp;');
                                }

                                editor.selection.select(dicElm);

                                editor.nodeChanged();
                            }

                            function insertLink() {
                                editor.undoManager.transact(createLink);
                            }

                            insertLink();
                        }
                    });
                }

            }

            editor.on('preInit', function (event) {
                //tinymce.activeEditor.settings.short_ended_elements += " dictories";
                //tinymce.activeEditor.schema.addCustomElements('dictories[*]');

                function toggleContentEditableState(state) {
                    return function (nodes) {
                        var i = nodes.length;

                        while (i--) {
                            nodes[i].attr('contenteditable', state ? 'false' : null);
                        }
                    };
                }

                editor.parser.addNodeFilter('dictories', toggleContentEditableState(true));
                editor.serializer.addNodeFilter('dictories', toggleContentEditableState(false));
            });

            editor.addButton('dictories', {
                icon: 'books',
                tooltip: tinymce.i18n.translate('Insert/edit dictories'),
                onclick: createDicList(showDialog),
                stateSelector: 'dictories[type][count]'
            });

            editor.addMenuItem('dictories', {
                text: tinymce.i18n.translate('Dictories'),
                icon: 'books',
                onclick: createDicList(showDialog),
                context: 'insert',
                prependToContext: true
            });

            //editor.addCommand('mceImage', createDicList(showDialog));
        },
        getInfo : function() {
            return {
                longname : 'Dictories Plugin',
                author: 'Kelatev,KPep',
                authorurl: 'http://mdoffice.com.ia/',
                version: "1.0"
            };
        }
    });

    tinymce.PluginManager.add('dictories', tinymce.plugins.Dictories);
})();