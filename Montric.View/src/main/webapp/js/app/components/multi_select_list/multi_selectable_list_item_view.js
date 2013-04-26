EurekaJ.MultiSelectableListItemView = Ember.View.extend({
    classNameBindings: 'isSelected',
    
    isSelected: function() {
        var isSelected = false;
        var id = this.get('listItem.id');
        
        this.get('parentView.selectedItems').forEach(function(selectedItem) {
            if (selectedItem === id) {
                isSelected = true;
            }
        });
        
        return isSelected;
    }.property('parentView.selectedItems.length'),
    
    template: Ember.Handlebars.compile('' + 
       '{{listItem.id}}'
   ),
   
   click: function(event) {
       var clickedId = this.get('listItem.id');
       var selectedItems = this.get('parentView.selectedItems');
       var alreadyIsSelected = false;
       
       selectedItems.forEach(function(selectedItem) {
           if (selectedItem === clickedId) {
               alreadyIsSelected = true;
           }
       });
       
       if (alreadyIsSelected) {
           selectedItems.removeObject(this.get('listItem.id'));
       } else {
           console.log('pushing object: ' + this.get('listItem.id'));
           console.log('into: ' + this.get('parentView.selectedItems'));
           selectedItems.pushObject(this.get('listItem.id'));
       }
   }
   
   
});