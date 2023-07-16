require('dotenv').config();
const express = require("express");
//const https = require("https");
const bodyParser = require("body-parser");


const mongoose = require("mongoose");
const _= require("lodash");
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect
mongoose.connect("mongodb+srv://athibharath237:Test123@cluster0.eqpgeeq.mongodb.net/todolistDB");

//schema
const itemsSchema = {
    name: String
}

//model
const Item = mongoose.model("item",itemsSchema);
 
//creating documents
const item1 = new Item({
    name: "Welcome to your todoList!"
})

const item2 = new Item({
    name: "Hit the + button to add a new item."
})

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/",function (req,res)
{ 
    Item.find({})
        .then(foundItems => {
            if(foundItems.length === 0){
                //insert
                Item.insertMany(defaultItems)
                      .then(function () {
                        console.log("Successfully saved defult items to DB");
                      })
                      .catch(function (err) {
                        console.log(err);
                      });
                      res.redirect("/");
            } else {
                res.render("list",{listTitle: "Today", newListItems: foundItems});        
            }
        
    })
    .catch(err => {
        console.log(err);
    })
});
app.post("/",function(req,res)
{
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    
    if (listName === "Today") {
        item.save();
        res.redirect("/");    
    } else {
        List.findOne({name: listName})
            .then(foundList => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+ listName)
            })
            .catch(function (err) {
                console.log(err);
              });
    }

    
    
});
app.post("/delete", function(req,res){
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItem)
        .then(function(){
            console.log("Succesfully deleted");
            res.redirect("/");
        })
        .catch(function (err) {
            console.log(err);
        });    
    }
    else {
        List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: checkedItem}}})
        .then(foundList => {
            res.redirect("/"+listName);
        })
        .catch(function (err){
            console.log(err);
        });
    }

    
})

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
    .then(foundList => {
        if(!foundList){
            //create a new list
            const list = new List(
                {
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/"+ customListName);
        } else {
            //show an existing list
            res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
        }
    })
    .catch(function (err){
        console.log(err);
    });
    
})

app.get("/work",function(req,res){
    res.render("list",{listTitle: "work List",newListItems: workItems});
});
app.get("/about",function(req,res){
    res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
 port = 3000;
}
app.listen(port, function() {
 console.log("Server started successfully");
});

