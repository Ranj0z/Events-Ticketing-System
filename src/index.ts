import express, { Request, Response, NextFunction } from 'express';
import UserRoutes from './AllTables/auth/auth.routes';
import paymentRoutes from './AllTables/payments/payment.routes';
import rsvpRoutes from './AllTables/rsvp/reservation.route';
import EventRoutes from './AllTables/events/events.route';
import VenueRoutes from './AllTables/venues/venue.route';
import TicketRoutes from './AllTables/tickets/ticket.route';

const app = express();

app.use(express.json()); // Parse JSON bodies

// Routes
UserRoutes(app);
paymentRoutes(app);
rsvpRoutes(app);
EventRoutes(app);
VenueRoutes(app);
TicketRoutes(app);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// ✅ JSON syntax error handler (must be after express.json and routes)
app.use(((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({ message: 'Invalid JSON format' });
  }
  next();
}) as express.ErrorRequestHandler); // 👈 This is the key line!

app.listen(8081, () => {
  console.log('Server is running on http://localhost:8081');
});

export default app;
