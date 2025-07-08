import express from 'express';
import UserRoutes from './AllTables/auth/auth.routes';
import paymentRoutes from './AllTables/payments/payment.routes';
import rsvpRoutes from './AllTables/rsvp/reservation.route';
import EventRoutes from './AllTables/events/events.route';
import VenueRoutes from './AllTables/venues/venue.route';
import TicketRoutes from './AllTables/tickets/ticket.route';

const app = express();
app.use(express.json()); //used to parse JSON bodies

// routes
UserRoutes(app)
paymentRoutes(app)
rsvpRoutes(app)
EventRoutes(app)
VenueRoutes(app)
TicketRoutes(app)

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

app.listen(8081, () => {
    console.log('Server is running on http://localhost:8081');
}) 