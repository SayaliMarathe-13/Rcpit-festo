const express = require("express");
const app = express();
const mongoose=require('mongoose');
const path = require("path");
const Event = require("./models/EventModel");
const { MongoClient, ObjectId } = require('mongodb'); 
const bodyParser = require('body-parser');
// const { MongoClient } = require('mongodb');
const Admin = require("./models/AdminModel");
const mongoURI = 'mongodb+srv://marathesayali2003:Sayali123@cluster1.mqlrftt.mongodb.net/';
const dbName = 'Rcpit-festo';
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Database connected');

        const db = client.db(dbName);
        cachedDb = db; 
        return cachedDb;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/home', (req, res) => {
    res.render("home");
});
app.get('/contact', (req, res) => {
    res.render("contact");
});
app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/upcomming', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const coll = db.collection('events');
        const arr = await coll.find({}).toArray(); 
        res.render("upcomming", { EventArr: arr }); 
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).send("Error fetching events");
    }
});

app.get('/login', (req, res) => {
    res.render("login");
});
app.get('/sign_up', (req, res) => {
    res.render("sign_up");
});
app.get('/contact', (req, res) => {
    res.render("contact");
});
app.get('/create_event', (req, res) => {
    res.render("Create_event");
});
app.get('/events', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const coll = db.collection('events');
        const arr = await coll.find({}).toArray(); 
        res.render("events", { EventArr: arr }); 
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).send("Error fetching events");
    }
});
app.post('/login', async (req, res) => {
    console.log(req.body);
    const { name, password } = req.body;
    console.log(name);
    console.log(password);
    
    try {
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Database connected");
        const db = client.db('Rcpit-festo');
        const users=db.collection('admin');
        const user = await users.findOne({ name, password });
        console.log("finded", name,password);
        if (user) {
            res.redirect('/events');
        } else {
            // User not found
            res.status(401).json({ success: false, message: 'User not found' });
        }

        client.close();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
    }
});
app.post('/sign_up', async (req, res) => {
    const { name,email, password } = req.body;
    try {
      const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
  
      const db = client.db('Rcpit-festo');
      const users=db.collection('admin');
      const newUser = new Admin( {
        name,
        email,
        password,
      });
      await users.insertOne(newUser);

    console.log('User data saved successfully:', newUser);
    res.redirect(`/login`);
    
    client.close();
  } catch (err) {
    console.error('Error saving user data:', err);
    res.status(500).json({ success: false, error: 'Error saving user data' });
  }
});

app.post('/create_event', async (req, res) => {
    const { eventName, eventDescription, clubName, scheduleDate } = req.body;

    try {
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db('Rcpit-festo');
        const events = db.collection('events');
        
        const newEvent = new Event({
            eventName: eventName,
            eventDescription: eventDescription,
            clubName: clubName,
            scheduleDate: scheduleDate,
        });

        await events.insertOne(newEvent);
        console.log('Event data saved successfully:', newEvent);
        res.redirect('/events');
        client.close();
    } catch (err) {
        console.error('Error saving event data:', err);
        res.status(500).json({ success: false, error: 'Error saving event data' });
    }
});


app.delete('/events/:eventId', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const coll = db.collection('events');

        const eventId = req.params.eventId;

        const deleteResult = await coll.deleteOne({ _id: new ObjectId(eventId) });

        if (deleteResult.deletedCount === 1) {
            console.log("Event deleted successfully");
            res.status(204).send();
        } else {
            console.log("Event not found");
            res.status(404).send("Event not found");
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).send("Internal Server Error");
    }
});




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
