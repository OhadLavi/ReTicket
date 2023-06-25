# ReTicket

## Description
This project is a user-friendly platform designed to streamline the process of buying and selling second-hand concert e-tickets. It serves two main types of users: buyers and sellers. As a ticket buyer, you can effortlessly search for your desired concert by artist, city, date, or category. As a ticket seller, you can easily sell your unused tickets by uploading the ticket’s PDF file and setting your desired price.

## Features
- Search for tickets for upcoming concerts by any parameter such as event name, artist name, venue, or city.
- Voice search feature for ticket search using string similarity.
- Event's are added through a web crawler and scraper using headless browser.
- Event page with details like event poster, name, date and location (using Google places API).
- Mail intgeration for notifications.
- PayPal integration for payment and payout.

## Dependencies
### Frontend
- AngularJS
### Backend
- Node.js 
- Express.js
- MongoDB
- Google APIs: Maps, Speech To Text, Calander
- PayPal API
- Nodemailer API

## Getting Started
1. Clone the repository:
```
git clone https://github.com/OhadLavi/ReTicket.git
```
2. Install the dependencies for the backend:
```
cd backend
npm install
```
3. Install the dependencies for the frontend:
```
cd frontend
npm install
```
4. Run the app:
```
cd frontend
ng serve -o

cd backend
npm start
```
The website will be available at http://localhost:4200
make sure that the client server is running on port 5000