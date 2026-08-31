import express, { Request, Response, NextFunction } from 'express';
import UserRoutes from './AllTables/auth/auth.routes';
import paymentRoutes from './AllTables/payments/payment.routes';
import rsvpRoutes from './AllTables/rsvp/reservation.route';
import EventRoutes from './AllTables/events/events.route';
import VenueRoutes from './AllTables/venues/venue.route';
import TicketRoutes from './AllTables/tickets/ticket.route';
import mpesaRoutes from "./mpesa/mpesa.router";

const app = express();
import cors from "cors";
import { logger } from './middleware/logger';

app.use(express.json()); // Parse JSON bodies
app.use("/api/mpesa", mpesaRoutes);

app.use(logger);

  app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  })); // 👈 Enables cross-origin requests
  app.use(express.json());
  
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

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.listen(8090, () => {
  console.log('Server is running on http://localhost:8090');
});

export default app;
