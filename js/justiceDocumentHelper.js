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
    this.$el.find("input").prop('checked', this.model.get("isSelected"));
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
  render: function(filterMails) {
    this.$el.html(this.template(this.model.toJSON()));
    var $links = this.$el.find(".list-group"); 
    $links.empty();
    this.collection.each(function(model) {
      if(filterMails && !model.get("mail")) 
      {
        return;
      }
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
    this.subviews = [];
    var that = this;
    this.collection.each(function(group) {
      var nlcDocumentGroup = new Views.NLCDocumentGroup({
        model: group
      });
      that.subviews.push(nlcDocumentGroup);
    });
    this.mode = "email"; 
    this.render();
  },
  render: function() {
    var $main = this.$el.find("#main");
    $main.empty();
    var that = this;
    if(this.mode == "email")
    {
      this.$el.find("#mailButton").removeClass("active");
      this.$el.find("#emailButton").addClass("active");
      this.$el.find("#mailForm").hide("");
      this.$el.find("#emailForm").show("");
    }
    else 
    {
      this.$el.find("#emailButton").removeClass("active");
      this.$el.find("#mailButton").addClass("active");
      this.$el.find("#emailForm").hide("");
      this.$el.find("#mailForm").show("");
    }
    _.each(this.subviews, function(view)
    {
      $main.append(view.render(that.mode == "mail").el);
    });
  },
  events:
  {
    "click #emailButton": "emailMode", 
    "click #mailButton": "mailMode",
    "click #send": "send" 
  },
  emailMode: function() {
    this.mode = "email";
    this.render();
  },
  mailMode: function() {
    this.mode = "mail";
    this.render();
  },
  send: function() {
    var sendables =  [];
    var that = this;
    _.each(this.subviews, function(view) {
      sendables.push(new Collections.NLCDocuments(view.collection.where({isSelected: true})).toJSON());
    });
    console.log(_.flatten(sendables));
  },
  getLinksFromCSV : function() {
    //Where we parse the csv and then return the Array of JSON

    var arr1;

    // ------------- LIVE DATA --------------
    $.ajax({ //my ajax request
            url: "../NLCMap.csv",
            type: "GET",
            dataType: "text",
            async: false,
            success : function(response){
             response = forceUnicodeEncoding(response);
             console.log("ajax response: "+response);
             arr1 = csvToArray(response);
             console.log("arr1 "+arr1);
            }
    });
    // ------------- LIVE DATA --------------

    // ------------- LOCAL DATA -------------
    // var str1 = "Document Title,Document Category,Link,Available to receive by mail\r\n" +
    //       "Client Intake Form - English,ADMINISTRATION,http://www.kcba.org/pbs/pdf/NLClinks/intakesheet.pdf,FALSE\r\nClient Intake Form—Spanish,ADMINISTRATION,http://www.kcba.org/pbs/pdf/NLClinks/IntakeSheet-Spanish.pdf,FALSE\r\nClient Intake Form—Spanish,CATEGORY,http://www.kcba.org/pbs/pdf/NLClinks/IntakeSheet-Spanish.pdf,FALSE\r\nClient Intake Form—English,CATEGORY2,http://www.kcba.org/pbs/pdf/NLClinks/IntakeSheet-Spanish.pdf,FALSE\r\nClient Intake Form—English,CATEGORY,http://www.kcba.org/pbs/pdf/NLClinks/IntakeSheet-English.pdf,FALSE";
    // console.log(str1);
    // arr1 = csvToArray(str1);
    // console.log(arr1);
    // ------------- LOCAL DATA -------------

    var links = arrToJson(arr1);
    console.log("Links: "+links);

    function forceUnicodeEncoding(string){
      return unescape(encodeURIComponent(string));
    }

    //convert array to json
    function arrToJson(arr){
      console.log(arr);
      var arr2 = {};
      for(var i=1; i<arr.length; i++){
        var obj1 = {};
        if(!arr2[arr[i][1]]){
          arr2[arr[i][1]] = {};
        }
        arr2[arr[i][1]]["groupName"] = arr[i][1];
        if(!arr2[arr[i][1]]["links"]){
          arr2[arr[i][1]]["links"] = [];
        }

        obj1["linkName"] = arr[i][0];
        obj1["linkURL"] = arr[i][2];
        obj1["mail"] = Boolean.valueOf(arr[i][3])();
        arr2[arr[i][1]]["links"].push(obj1);
      }
      var arr3 = [];
      for(var i in arr2){
        arr3.push(arr2[i]);
      }
      arr3.pop();
      return arr3;
    }

    //Convert CSV to Array
    function csvToArray (strData, strDelimiter){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ) {
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);
            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }

        // Return the parsed data.
        return (arrData);
    }; //Convert CSV to Array

    return links;
  }
});


$(function() {
  var documentGroup = new Views.NLC({
    el: $("body")
  });
});
