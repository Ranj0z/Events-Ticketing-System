import express, { Request, Response, NextFunction } from 'express';
import UserRoutes from './AllTables/auth/auth.routes';
import paymentRoutes from './AllTables/payments/payment.routes';
import rsvpRoutes from './AllTables/rsvp/reservation.route';
import EventRoutes from './AllTables/events/events.route';
import VenueRoutes from './AllTables/venues/venue.route';
import TicketRoutes from './AllTables/tickets/ticket.route';
import UploadRoutes from './AllTables/uploads/upload.routes';
import TicketTypeRoutes from './AllTables/ticket_type/ticket-type.routes';

const app = express();
import cors from "cors";
import { logger } from './middleware/logger';

// captures the raw body as req.rawBody — needed to verify the gateway
// webhook's HMAC signature, which is computed over the raw bytes, not a
// re-serialized JSON object.
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));

app.use(logger);

  app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  })); // 👈 Enables cross-origin requests

// Routes
UserRoutes(app);
paymentRoutes(app);
rsvpRoutes(app);
EventRoutes(app);
VenueRoutes(app);
TicketRoutes(app);
UploadRoutes(app);
TicketTypeRoutes(app);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// ✅ Catch-all error handler (must be after express.json and routes)
app.use(((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({ message: 'Invalid JSON format' });
  }

  // multer file-type/size rejections (e.g. from upload.middleware.ts)
  if (
    err &&
    typeof err === 'object' &&
    'name' in err &&
    (err as { name?: unknown }).name === 'MulterError'
  ) {
    const message =
      'message' in err && typeof (err as { message?: unknown }).message === 'string'
        ? (err as { message: string }).message
        : 'Invalid file upload';
    return res.status(400).json({ message });
  }

  // any other error reaching here previously fell through silently
  // (bare next() with no error = request hangs). Respond instead.
  if (err) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  next();
}) as express.ErrorRequestHandler);

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