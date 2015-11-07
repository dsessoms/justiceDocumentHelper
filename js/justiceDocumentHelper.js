window.Models = {};
window.Collections = {};
window.Views = {};

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

Models.NLCDocumentGroup = Backbone.Model.extend({
  initialize: function() {}
});

Models.NLCDocument = Backbone.Model.extend({
  initialize: function() {}
});

Collections.NLCDocuments = Backbone.Collection.extend({
  model: Models.NLCDocument,
  initialize: function() {}
});

Collections.NLCDocumentGroups = Backbone.Collection.extend({
  model: Models.NLCDocumentGroup,
  initialize: function() {}
});

Views.NLCDocument = Backbone.View.extend({
  model: Models.NLCDocument,
  template: null,
  initialize: function() {
    this.template = _.template($('#link').html());
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  events: 
  {
    "click .list-group-item" : "toggleSelected"
  },
  toggleSelected: function() {
    if(this.model.get("isSelected")){
      this.model.set("isSelected", false);
      this.$el.find("input").prop('checked', false);
    } else {
      this.model.set("isSelected", true);
      this.$el.find("input").prop('checked', true);
    }
  }
});

Views.NLCDocumentGroup = Backbone.View.extend({
  model: Models.NLCDocumentGroup,
  template: null,
  initialize: function() {
    this.template = _.template($('#docGroup').html());
    this.collection = new Collections.NLCDocuments(this.model.get("links"));
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    var $links = this.$el.find(".list-group"); 
    $links.empty();
    this.collection.each(function(model) {
      var nlcDocument = new Views.NLCDocument({
        model: model
      });
      $links.append(nlcDocument.render().el);
    });
    return this;
  },
  events:
  {
    "click .panel-heading" : "toggleList"
  },
  toggleList: function(){
    this.$el.find(".list-group").slideToggle();
  }
});


$(function() {
  var documentGroup = new Views.NLCDocumentGroup({
    model: new Models.NLCDocumentGroup(
    {
      groupName: "First Group",
      links: [
        { linkName: "Test Document 1"},
        { linkName: "Test Document 2"},
        { linkName: "Test Document 3"}
      ]
    })
  });
  $("body").append(documentGroup.render().el);
});
