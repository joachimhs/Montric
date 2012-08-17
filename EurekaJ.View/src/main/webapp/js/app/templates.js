Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '{{outlet}}' +
    '{{outlet header}}' +
    '{{outlet main}}'
);

Ember.TEMPLATES['login-page'] = Ember.Handlebars.compile('' +
    '<div class="loginBox well">' +
        '<h1>Login Page</h1> ' +
        'Username: <br />' +
        '{{view Ember.TextField elementId="usernameInput" value=""}}<br />' +
        'Password: <br />' +
        '{{view Ember.TextField elementId="passwordInput" value=""}}<br />' +
        '{{view Ember.Checkbox elementId="remeberCheck" }} Remember me<br />' +
        '<button {{action doLogin}} class="tenPxMarginTop">Login</button>' +
    '</div>'
);

Ember.TEMPLATES['chart'] = Ember.Handlebars.compile('' +
    '<h1>{{name}}</h1>'
    //'<svg> </svg>'
);

Ember.TEMPLATES['header'] = Ember.Handlebars.compile('' +
    '<div class="navbar-inner">' +
        '<div class="container">' +
            '<span class="navbar-text">EurekaJ:Live</span>' +
            '<span class="divider-vertical"></span>' +

            '{{view EurekaJ.BootstrapButton classNames="btn-info btn-mini pull-right" content="Administration" iconName="icon-cog"}}' +
            '{{view EurekaJ.BootstrapButton classNames="btn-info btn-mini pull-right" content="Chart Options"}}' +

        '</div>' +
    '</div>'
);

Ember.TEMPLATES['main'] = Ember.Handlebars.compile('' +
    '{{#each controller}}' +
        '{{view EurekaJ.ChartView contentBinding="this"}}<br />' +
    '{{/each}}'
);

Ember.TEMPLATES['main-menu'] = Ember.Handlebars.compile('' +
        '<h1>Main Menu</h1>' +
        '{{#each controller}}' +
            '{{view EurekaJ.NodeView contentBinding="this"}}' +
        '{{/each}}' +
    '</ul>'
);

/** Tree Menu Templates **/
Ember.TEMPLATES['tree-node'] = Ember.Handlebars.compile('' +
        '{{view EurekaJ.NodeContentView contentBinding="node"}}' +

        '{{#if this.isExpanded}}' +
            '<div style="width: 500px;">' +
            '{{#each this.children}}' +
                '<div style="margin-left: 22px;">{{view EurekaJ.NodeView contentBinding="this"}}</div>' +
            '{{/each}}' +
            '</div>' +
        '{{/if}}'
);

Ember.TEMPLATES['tree-node-text'] = Ember.Handlebars.compile('' +
    '{{name}}'
);

Ember.TEMPLATES['tree-node-content'] = Ember.Handlebars.compile('' +
    '{{#unless hasChildren}}' +
        '<span style="margin-right: 7px;">&nbsp;</span>' +
        '{{view Ember.Checkbox checkedBinding="isSelected"}}' +
    '{{/unless}}' +

    '{{view EurekaJ.NodeArrowView contentBinding="this"}}' +
    '{{view EurekaJ.NodeTextView contentBinding="this" classNames="treeMenuText"}}'
);

Ember.TEMPLATES['tree-node-arrow'] = Ember.Handlebars.compile('' +
    '{{#if hasChildren}}' +
        '{{#if isExpanded}}' +
            '<span class="downarrow"></span>' +
        '{{else}}' +
            '<span class="rightarrow"></span>' +
        '{{/if}}' +
    '{{/if}}'
);
/** //Tree Menu Templates **/