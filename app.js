import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB");


const itemsSchema = {
  name: "String"
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todolist!"
});

const item2 = new Item({
  name: "hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- hit this to delete an item "
});


const defaultItems = [item1, item2, item3];

app.get("/", async function(req, res) {
  try {
    const foundItems = await Item.find({});

    if (foundItems.length === 0) {
      await Item.insertMany(defaultItems);
      console.log("Successfully saved default items to database");

      return res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  } 
  catch (err) {
    console.error(err);
    // res.status(500).send("An error occurred");
  }
});

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if(err) {
          console.log(err);
        }
        else {
          console.log("successfully saved default items to database");
        }
      });
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});



app.post("/", function(req, res){
  
  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } 
  else {
    items.push(item);
    res.redirect("/");
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
