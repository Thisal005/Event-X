# Event-X - Real-Time Event Ticketing System

A comprehensive, full-stack event ticketing platform built with Spring Boot and React, featuring real-time ticket management, QR code generation, event live updates, and multi-role user management.

## 🌟 Features

### Core Ticketing System
- **Real-Time Ticket Management**: Multi-threaded ticket pool with synchronized vendor and customer operations
- **Dynamic Pricing**: Configurable price rules and promotional codes
- **QR Code Integration**: Automated ticket QR code generation and validation
- **Order Management**: Complete order processing with order history tracking
- **Waitlist System**: Automated waitlist management for sold-out events

### Event Management
- **Event Creation & Management**: Comprehensive event creation with image uploads
- **Live Event Updates**: Real-time event communication and photo sharing during events
- **Event Analytics**: Dashboard with ticket sales, revenue, and attendee metrics
- **Staff Management**: Role-based access for event organizers and gatekeepers

### User Roles & Security
- **Multi-Role System**: Admin, Organizer, Gatekeeper, and Attendee roles
- **OAuth2 Integration**: Google Sign-In support
- **JWT Authentication**: Secure token-based authentication
- **Password Management**: Email-based password reset functionality

### Advanced Features
- **WebSocket Support**: Real-time updates for ticket availability and event communications
- **Lost & Found**: Event-specific lost and found post management
- **Email Notifications**: Automated email notifications for bookings and updates
- **System Health Monitoring**: Actuator endpoints for system monitoring
- **Audit Logging**: Comprehensive activity logging with AOP

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.4.0
- **Language**: Java 22
- **Database**: MySQL (with JPA/Hibernate)
- **Security**: Spring Security, OAuth2, JWT
- **Real-time Communication**: WebSocket, STOMP
- **Build Tool**: Maven
- **Additional Libraries**:
  - ZXing (QR Code generation)
  - Gson & Jackson (JSON processing)
  - Spring Mail
  - Spring Actuator
  - Playwright (for testing)

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Key Libraries**:
  - Axios (API communication)
  - STOMP.js (WebSocket)
  - Recharts (Data visualization)
  - React QR Scanner
  - Lucide React (Icons)
  - html2canvas (Screenshots)

## 📋 Prerequisites

### Backend Requirements
- Java Development Kit (JDK) 22 or higher
- Maven 3.6+
- MySQL 8.0+
- IDE: IntelliJ IDEA or Eclipse (recommended)

### Frontend Requirements
- Node.js 16.x or higher
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Thisal005/Event-X.git
cd Event-X
```

### 2. Backend Setup

#### Navigate to Backend Directory
```bash
cd BACKEND/EventTicketingSystem
```

#### Configure Database
1. Create a MySQL database for the application:
```bash
mysql -u root -p
CREATE DATABASE YOUR_DATABASE_NAME;
```
2. Update `src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/YOUR_DATABASE_NAME
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
```

**Note:** The application uses `spring.jpa.hibernate.ddl-auto=update` which automatically creates and updates database tables based on your JPA entities. No manual schema setup is required.

#### Configure OAuth2 (Optional)
If you want to use Google Sign-In, update the following in `application.properties`:
```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

#### Configure Email Service (Optional)
For email notifications, update:
```properties
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_GMAIL_APP_PASSWORD
```

#### Build and Run
```bash
# Using Maven wrapper
./mvnw clean install
./mvnw spring-boot:run

# Or using Maven directly
mvn clean install
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd FRONTEND/ticketing-system
```

#### Install Dependencies
```bash
npm install
```

#### Configure API Endpoint (if needed)
Update the API base URL in your frontend configuration files if your backend runs on a different port.

#### Run Development Server
```bash
npm run dev
```

The frontend application will be available at `http://localhost:5173`

#### Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
Event-X/
├── BACKEND/
│   └── EventTicketingSystem/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/oop/EventTicketingSystem/
│       │   │   │   ├── aop/              # Aspect-Oriented Programming (Logging)
│       │   │   │   ├── config/           # Configuration classes
│       │   │   │   ├── controller/       # REST API endpoints
│       │   │   │   ├── model/            # Entity classes
│       │   │   │   ├── payload/          # Request/Response DTOs
│       │   │   │   ├── repository/       # Data access layer
│       │   │   │   ├── scheduler/        # Scheduled tasks
│       │   │   │   ├── security/         # Security & authentication
│       │   │   │   └── service/          # Business logic
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/                     # Unit and integration tests
│       └── pom.xml                       # Maven configuration
└── FRONTEND/
    └── ticketing-system/
        ├── src/
        │   ├── api/                      # API service modules
        │   ├── components/               # Reusable React components
        │   ├── pages/                    # Page components
        │   │   ├── admin/               # Admin dashboard
        │   │   └── organizer/           # Organizer dashboard
        │   └── WelcomePage.jsx          # Landing page
        ├── package.json
        └── vite.config.js
```

## 🔌 API Endpoints Overview

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request

### Events
- `GET /api/events` - List all events
- `GET /api/events/{id}` - Get event details
- `POST /api/events` - Create new event (Organizer)
- `PUT /api/events/{id}` - Update event (Organizer)
- `DELETE /api/events/{id}` - Cancel event (Organizer)

### Tickets
- `GET /api/tickets` - Get user's tickets
- `POST /api/orders` - Purchase tickets
- `GET /api/orders/{id}` - Get order details
- `POST /api/tickets/validate` - Validate ticket QR code (Gatekeeper)

### Event Live Features
- `POST /api/events/{id}/live/photos` - Upload live event photos
- `GET /api/events/{id}/live/photos` - Get event photos
- `POST /api/events/{id}/live/posts` - Create lost & found post
- `GET /api/events/{id}/live/communications` - Get event updates

### Admin
- `GET /api/admin/users` - Manage users
- `GET /api/admin/statistics` - System statistics
- `GET /api/admin/audit-logs` - View audit logs

### System
- `GET /api/system/health` - System health check
- `POST /api/system/control/start` - Start ticket pool
- `POST /api/system/control/stop` - Stop ticket pool

## 🎮 Running the Application

### CLI Mode (Backend Only)
The system includes a CLI mode for testing the ticket pool mechanism. The `TicketingSystemCLI` class implements `CommandLineRunner` and runs automatically when you start the Spring Boot application:
```bash
cd BACKEND/EventTicketingSystem
./mvnw spring-boot:run
```
**Note:** The CLI interface will appear in the console, allowing you to configure and test the multi-threaded ticket pool system. This is useful for development and testing the core ticketing logic without the web interface.

### Full Stack Mode
1. Start the backend server (port 8080)
2. Start the frontend development server (port 5173)
3. Access the application at `http://localhost:5173`

### Default User Roles
After initial setup, you may need to manually set user roles in the database or use the admin panel to manage user permissions.

## 🧪 Testing

### Backend Tests
```bash
cd BACKEND/EventTicketingSystem
./mvnw test
```

### Frontend Tests
```bash
cd FRONTEND/ticketing-system
npm run lint
```

## 🔐 Security Configuration

### JWT Token
- Default expiration: 24 hours (86400000 ms)
- Secret key configured in `application.properties`
- **⚠️ IMPORTANT**: Change the JWT secret key in production! 
  - HS256 requires at least 256 bits (32 characters)
  - HS512 requires at least 512 bits (64 characters)
  - Generate a secure key: `openssl rand -base64 64`
- Refresh token mechanism available

### CORS Configuration
- Default: `http://localhost:5173`
- Update in controller annotations for production

### QR Code Security
- Secure salt-based hashing for QR code generation
- Validation includes timestamp and event verification

## 📊 Key Features Breakdown

### Ticket Pool Management
- Thread-safe ticket pool implementation
- Configurable vendor release rate and customer retrieval rate
- Maximum capacity controls
- Real-time availability updates via WebSocket

### Event Lifecycle
1. **Creation**: Organizers create events with details and ticket types
2. **Ticket Sales**: Attendees browse and purchase tickets
3. **Live Management**: Real-time updates, photos, and communications during events
4. **Post-Event**: Analytics, feedback collection, and archival

### Role-Based Access Control
- **Admin**: Full system access, user management, system monitoring
- **Organizer**: Event creation, ticket management, analytics
- **Gatekeeper**: Ticket validation, attendee check-in
- **Attendee**: Browse events, purchase tickets, view order history

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Configuration Reference

### Key Configuration Parameters

**Ticket Pool Configuration:**
- `totalTickets`: Total number of tickets available
- `maxCapacity`: Maximum tickets in pool at once
- `customerRetrievalRate`: Interval for customer purchases (seconds)
- `vendorReleaseRate`: Interval for vendor releases (seconds)

**System Configuration:**
- Database pool size: Configurable via Spring properties
- File upload max size: 10MB (configurable)
- WebSocket message size: Default Spring limits

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
- Verify MySQL is running and accessible
- Check database credentials in `application.properties`
- Ensure Java 22 is installed: `java -version`

**Frontend build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`

**CORS errors:**
- Verify frontend URL matches CORS configuration in controllers
- Check browser console for specific CORS error messages

**WebSocket connection issues:**
- Ensure both frontend and backend are running
- Check browser WebSocket support
- Verify STOMP endpoint configuration

## 📄 License

This project is part of an academic assignment. Please check with the repository owner for usage rights.

## 👥 Authors

- **Thisal005** - [GitHub Profile](https://github.com/Thisal005)

## 🙏 Acknowledgments

- Spring Boot and React communities for excellent documentation
- Various open-source libraries that made this project possible

---

**Note:** This README provides comprehensive information about the Event-X ticketing system. For specific API documentation, please refer to the Swagger/OpenAPI documentation when the backend is running (if configured), or explore the controller files in the source code.
