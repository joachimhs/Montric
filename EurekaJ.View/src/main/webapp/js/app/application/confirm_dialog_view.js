EurekaJ.ConfirmDialogView = Ember.View.extend({
    templateName: 'confirmDialog',
    classNames: ['modal', 'hide']
});

Ember.TEMPLATES['confirmDialog'] = Ember.Handlebars.compile(
        '<div class="modal-header centerAlign">' +
            '<button type="button" class="close" data-dismiss="modal" class="floatRight">x</button>' +
            '<h1 class="centerAlign">{{view.header}}</h1>' +
        '</div>' +
        '<div class="modal-body">' +
            '{{view.message}}' +
        '</div>' +
        '<div class="modal-footer">' +
            '{{#if view.cancelAction}}' +
                '{{view EurekaJ.BootstrapButton contentBinding="view.cancelButtonLabel" actionBinding="view.cancelAction" targetBinding="view.target"}}' +
            '{{/if}}' +
            '{{#if view.okAction}}' +
                '{{view EurekaJ.BootstrapButton contentBinding="view.okButtonLabel" actionBinding="view.okAction" targetBinding="view.target"}}' +
            '{{/if}}' +
        '</div>'
        //'<div class="modal-footer">{{view EurekaJ.BootstrapButton content="Apply Changes" action="applyChartOptionsChanges" target="EurekaJ.router"}}</div>' +
    );