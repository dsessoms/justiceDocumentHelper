NLCDocumentGroup = Backbone.Model.extend({
  initialize: function() {}
});

NLCDocument = Backbone.Model.extend({
  initialize: function() {}
});

NLCDocuments = Backbone.Collection.extend({
  model: NLCDocument,
  initialize: function() {}
});

NLCDocumentGroups = Backbone.Collection.extend({
  model: NLCDocumentGroup,
  initialize: function() {}
});


$({
  var documents = new NLCDocumentGroups([]);
});
