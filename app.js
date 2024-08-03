import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

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

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



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


app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    await item.save();
    res.redirect("/");
  } 
  else {
    try {
      const foundList = await List.findOne({ name: listName });
      if (foundList) {
        foundList.items.push(item);
        await foundList.save();
      }
      res.redirect("/" + listName);
    } catch (err) {
      console.error(err);
      // res.status(500).send("An error occurred while saving the item.");
    }
  }
});


app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    try {
      await Item.findByIdAndDelete(checkedItemId);
      console.log("Successfully deleted the checked item from Today list");
      res.redirect('/');
    } 
    catch (err) {
      console.error("Error deleting item from Today list:", err);
      // res.status(500).send("Internal Server Error");
    }
  } 
  else {
    try {
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
     
      console.log(`Successfully deleted the checked item from ${listName} list`);
      res.redirect("/" + listName);
    } 
    catch (err) {
      console.error(`Error deleting item from ${listName} list:`, err);
      // res.status(500).send("Internal Server Error");
    }
  }

});



app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({ name: customListName });

    if (!foundList) {
      // Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      await list.save();
      res.redirect("/" + customListName);
    } 
    else { 
      // Show the existing list
      res.render("list.ejs", { listTitle: foundList.name, newListItems: foundList.items });
    }
  } 
  catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
  
});


app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
