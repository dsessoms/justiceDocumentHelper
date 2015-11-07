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
  },
  render: function(filterMails) {
    this.$el.html(this.template(this.model.toJSON()));
    var $links = this.$el.find(".list-group"); 
    $links.empty();
    
    this.collection = new Collections.NLCDocuments(this.model.get("links"));
    if(filterMails) {
      this.collection = new Collections.NLCDocuments(this.collection.where({mail: true}));
    }
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

Views.NLC = Backbone.View.extend({
  collection: null,
  initialize: function() {
    this.collection = new Collections.NLCDocumentGroups(this.getLinksFromCSV());
    this.mode = "email"; 
    this.render();
  },
  render: function() {
    var $main = this.$el.find("#main");
    $main.empty();
    var that = this;
    this.collection.each(function(group) {
      var nlcDocumentGroup = new Views.NLCDocumentGroup({
        model: group
      });
      $main.append(nlcDocumentGroup.render(that.mode == "mail").el);
    });
  },
  events:
  {
    "click #emailButton": "emailMode", 
    "click #mailButton": "mailMode", 
  },
  emailMode: function() {
    this.mode = "email";
    this.$el.find("#mailButton").removeClass("active");
    this.$el.find("#emailButton").addClass("active");
    this.render();
  },
  mailMode: function() {
    this.mode = "mail";
    this.$el.find("#emailButton").removeClass("active");
    this.$el.find("#mailButton").addClass("active");
    this.render();
  },
  getLinksFromCSV : function() {
    //Where we parse the csv and then return the Array of JSON
    var links = [
      {
        groupName: "First Group",
        links: [
          { linkName: "Test Document 1", mail: true},
          { linkName: "Test Document 2", mail: false},
          { linkName: "Test Document 3", mail: true}
        ]
      },
      {
        groupName: "Second Group",
        links: [
          { linkName: "Test Document 4", mail: false},
          { linkName: "Test Document 5", mail: true},
          { linkName: "Test Document 6", mail: true}
        ]
      }
    ];
    return links;
  }
});


$(function() {
  var documentGroup = new Views.NLC({
    el: $("body")
  });
});
