Ext.define("PartKeepr.Importer.ImporterOneToManyConfiguration", {
    extend: "Ext.form.Panel",
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    scrollable: 'y',
    importerField: null,
    xtype: 'importerOneToManyConfiguration',
    model: null,
    defaultListenerScope: true,
    defaultConfig: {
        importBehaviour: "ignore",
        updateBehaviour: "dontUpdate",
        notFoundBehaviour: "stopImport",
        notFoundSetToEntity: "",
        matchers: [],
    },
    items: [
        {
            xtype: 'radio',
            boxLabel: i18n("Don't import this sub-entity"),
            name: 'importBehaviour',
            inputValue: 'ignore',
            checked: true,
            itemId: 'ignore',
            listeners: {
                change: "onChange"
            }
        },
        {
            xtype: 'radio',
            boxLabel: i18n("Match import data with existing data using:"),
            name: 'importBehaviour',
            checked: false,
            inputValue: 'matchData',
            itemId: 'matchData',
            listeners: {
                change: "onChange"
            }
        },
        {
            xtype: 'fieldcontainer',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            margin: {
                left: 20,
            },
            items: [
                {
                    disabled: true,
                    xtype: 'importFieldMatcherGrid',
                    itemId: 'importFieldMatcherGrid',
                    height: 100,
                    listeners: {
                        change: "onChange"
                    }
                },
                {
                    xtype: 'fieldset',
                    title: i18n("Behaviour when item exists"),
                    items: [
                        {

                            xtype: 'radio',
                            boxLabel: i18n("Don't update data if an item exists"),
                            disabled: true,
                            inputValue: 'dontUpdate',
                            itemId: 'dontUpdateData',
                            name: 'updateBehaviour',
                            listeners: {
                                change: "onChange"
                            }
                        },
                        {
                            xtype: 'radio',
                            boxLabel: i18n("Update data if an item exists"),
                            disabled: true,
                            checked: true,
                            inputValue: 'update',
                            itemId: 'updateData',
                            name: 'updateBehaviour',
                            listeners: {
                                change: "onChange"
                            }


                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    title: i18n("Behaviour when item does not exist"),
                    items: [
                        {
                            xtype: 'radio',
                            boxLabel: i18n("Stop import"),
                            disabled: true,
                            inputValue: 'stopImport',
                            itemId: 'stopImport',
                            checked: true,
                            name: 'notFoundBehaviour',
                            listeners: {
                                change: "onChange"
                            }
                        },
                        {
                            xtype: 'radio',
                            boxLabel: i18n("Create new entity"),
                            disabled: true,
                            inputValue: 'createEntity',
                            itemId: 'createEntity',
                            checked: false,
                            name: 'notFoundBehaviour',
                            listeners: {
                                change: "onChange"
                            }
                        },
                        {
                            xtype: 'fieldcontainer',
                            layout: {
                                type: 'hbox'
                            },
                            items: [
                                {
                                    xtype: 'radio',
                                    boxLabel: i18n("Set to:"),
                                    name: 'notFoundBehaviour',
                                    inputValue: 'setToEntity',
                                    disabled: true,
                                    checked: false,
                                    itemId: 'setTo',
                                    listeners: {
                                        change: "onChange"
                                    }
                                }, {
                                    xtype: 'textfield',
                                    itemId: 'notFoundSetToEntity',
                                    name: 'notFoundSetToEntity',
                                    disabled: true,
                                    readOnly: true,
                                    listeners: {
                                        change: "onChange"
                                    }
                                }, {
                                    xtype: 'button',
                                    text: i18n("Select entity…"),
                                    disabled: true,
                                    itemId: 'notFoundSelectEntity'
                                }
                            ]
                        },
                    ]
                }

            ]
        }
    ],
    initComponent: function ()
    {
        this.callParent(arguments);

        var importBehaviourChangeListeners = ["#matchData", "#dontUpdateData", "#updateData", "#setTo", "#stopImport"];

        for (var i = 0; i < importBehaviourChangeListeners.length; i++) {
            this.down(importBehaviourChangeListeners[i]).on("change", this.onImportBehaviourChange, this, {delay: 50});
        }

        this.down("#notFoundSelectEntity").on("click", this.onEntitySelectClick, this);

    },
    onEntitySelectClick: function ()
    {
        this.entitySelector = Ext.create("Ext.window.Window", {
            items: Ext.create("PartKeepr.Widgets.EntityPicker", {
                model: this.model,
                listeners: {
                    entityselect: this.onEntitySelect,
                    scope: this
                },
                ittemId: "entitySelectorPanel"
            }),
            title: i18n("Select entity"),
            width: "80%",
            height: "80%",
            modal: true,
            layout: 'fit',
            maximizable: true,
            closeAction: 'destroy'
        });

        this.entitySelector.show();
    },
    onEntitySelect: function (entity)
    {

        this.down("#notFoundSetToEntity").setValue(entity.getId());
        this.entitySelector.destroy();
    },
    onChange: function ()
    {
        this.onImportBehaviourChange();
        this.fireEvent("configChanged");

        if (!this.loading) {
            Ext.apply(this.importerConfig, this.getImporterConfig());
        }
    },
    onImportBehaviourChange: function ()
    {
        var fieldValues = this.getForm().getFieldValues();

        if (fieldValues.importBehaviour === "matchData") {
            this.down("#importFieldMatcherGrid").enable();
            this.down("#dontUpdateData").enable();
            this.down("#updateData").enable();
            this.down("#stopImport").enable();
            this.down("#createEntity").enable();
            this.down("#setTo").enable();

            if (fieldValues.notFoundBehaviour === "setToEntity") {
                this.down("#notFoundSetToEntity").enable();
                this.down("#notFoundSelectEntity").enable();
            } else {
                this.down("#notFoundSetToEntity").disable();
                this.down("#notFoundSelectEntity").disable();
            }
        } else {
            this.down("#createEntity").disable();
            this.down("#importFieldMatcherGrid").disable();
            this.down("#dontUpdateData").disable();
            this.down("#updateData").disable();
            this.down("#setTo").disable();
            this.down("#stopImport").disable();
        }
    },
    setModel: function (model, ignoreModel)
    {
        var ignoreModelName = null;
        if (ignoreModel !== undefined) {
            ignoreModelName = ignoreModel.getName();
        }

        this.down("#importFieldMatcherGrid").setModel(model, ignoreModelName);
        this.model = model;

    },
    getImporterConfig: function ()
    {
        var config = this.getForm().getFieldValues();

        config.matchers = this.down("#importFieldMatcherGrid").getImporterConfig();
        return config;
    },
    reconfigureColumns: function (columnsStore)
    {
        this.down("#importFieldMatcherGrid").reconfigureColumns(columnsStore);
    },
    setImporterConfig: function (config)
    {
        this.importerConfig = config;
        Ext.applyIf(this.importerConfig, this.defaultConfig);

        this.loading = true;
        this.getForm().setValues(this.importerConfig);

        if (this.importerConfig.hasOwnProperty("matchers")) {
            this.down("#importFieldMatcherGrid").setImporterConfig(this.importerConfig.matchers);
        } else {
            this.down("#importFieldMatcherGrid").setImporterConfig({});
        }

        this.loading = false;
    }

});
