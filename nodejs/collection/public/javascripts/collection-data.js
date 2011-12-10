{
  "collection" : {
    "href" : "http://localhost:3000/collection",

     "links" : [
        {"prompt" : "Hypermedia", "href" : "http://amundsen.com/hypermedia/", "rel" : "http://amundsen.com/relations/hypermedia"},
        {"prompt" : "Media Types", "href" : "http://amundsen.com/media-types/", "rel" : "http://amundsen.com/relations/media-types"}
     ],
    
    "items" : [
      {
        "href" : "http://localhost:3000/collection/1",
        "data" : [
          {"name" : "title", "value" : "first task"},
          {"name" : "completed", "value" : "false"},
          {"name" : "date-created", "value" : "2011-04-26"},
          {"name" : "date-due", "value" : "2011-05-01"}
         ],
         "links" : [
          {"name" : "blog-url", "prompt" : "Blog", "href" : "http://amundsen.com/blog/", "rel" : "http://amundsen.com/relations/blog"},
          {"name" : "foaf-url", "prompt" : "FOAF", "href" : "http://mamund.com/foaf#me", "rel" : "http://amundsen.com/relations/foaf"}
         ]
      },
      
      {
        "href" : "http://localhost:3000/collection/2",
        "data" : [
          {"name" : "title", "value" : "second task"},
          {"name" : "completed", "value" : "true"},
          {"name" : "date-created", "value" : "2011-04-26"},
          {"name" : "date-due", "value" : "2011-04-30"}
         ],
         "links" : [
          {"name" : "blog-url", "prompt" : "Blog", "href" : "http://amundsen.com/blog/", "rel" : "http://amundsen.com/relations/blog"},
          {"name" : "foaf-url", "prompt" : "FOAF", "href" : "http://mamund.com/foaf#me", "rel" : "http://amundsen.com/relations/foaf"}
       ]
      }
    ]
  },
  
  "queries" : [
    {"prompt" : "Open Items", "href" : "http://localhost:3000/collection/queries/open", "rel" : "http://amundsen.com/relations/open"},
    {"prompt" : "Closed Items", "href" : "http://localhost:3000/collection/queries/closed", "rel" : "http://amundsen.com/relations/closed"},
    {"prompt" : "Search By Date-Range", "href" : "http://localhost:3000/collection/queries/date-range", "rel" : "http://amundsen.com/relations/date-range", 
      "data" : [
        {"name" : "date-start", "value" : ""},
        {"name" : "date-stop", "value" : ""}
      ]
    } 
  ],
 
  "template" : {
    "data" : [
      {"name" : "title", "value" : "", "prompt" : "Title"},
      {"name" : "completed", "value" : "", "prompt" : "Completed (Y/n)"},      
      {"name" : "date-due", "value" : "", "prompt" : "Date Due"},
      {"name" : "blog-url", "value" : "", "prompt" : "Blog"},      
      {"name" : "foaf-url", "value" : "", "prompt" : "FOAF"}      
    ]
  }
}

