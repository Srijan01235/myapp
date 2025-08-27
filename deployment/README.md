# Restaurant Management System

A full-stack restaurant management application with separate customer and admin interfaces. Built with React, Express.js, and in-memory storage for easy deployment.

## Features

### Admin Features
- **Secure Login**: Admin authentication with username `admin` and password `admin123`
- **Menu Management**: Add, edit, and delete menu items with image upload support
- **Order Management**: View and update order statuses in real-time
- **Dashboard**: Revenue tracking and order analytics
- **Image Upload**: Support for JPEG, PNG, GIF, WebP, and SVG formats

### Customer Features
- **Menu Browsing**: View categorized menu items with descriptions and images
- **Cart System**: Add items to cart with quantity management
- **Order Placement**: Place orders with table number and customer name
- **Order Tracking**: Track order status in real-time
- **Toast Notifications**: Get feedback when adding items to cart

## Technology Stack

- **Frontend**: React 18 with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript, session-based authentication
- **Storage**: In-memory storage (no database required)
- **File Upload**: Multer for image handling
- **Build**: Vite for frontend, esbuild for backend

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd restaurant-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```
   
   Access the application at `http://localhost:5000`

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Usage

### Admin Access
1. Go to `/auth` or `/admin`
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Manage menu items and orders from the dashboard

### Customer Access
1. Go to `/order`
2. Browse menu and add items to cart
3. Enter table number and name to place order
4. Track order status in real-time

## Deployment

### AWS Deployment Options

#### Option 1: AWS Elastic Beanstalk
1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize and deploy**
   ```bash
   eb init
   eb create restaurant-app
   eb deploy
   ```

3. **Set environment variables**
   ```bash
   eb setenv SESSION_SECRET=your-secure-session-secret
   ```

#### Option 2: AWS EC2 with Docker
1. **Build Docker image**
   ```bash
   docker build -t restaurant-app .
   ```

2. **Run container**
   ```bash
   docker run -p 5000:5000 -e SESSION_SECRET=your-secret restaurant-app
   ```

#### Option 3: AWS ECS/Fargate
1. Push image to ECR
2. Create ECS task definition using `docker-compose.yml`
3. Deploy with Application Load Balancer

### Environment Variables

- `NODE_ENV`: Set to `production` for production builds
- `PORT`: Server port (default: 5000)
- `SESSION_SECRET`: Secure session secret (required in production)

### File Structure

```
restaurant-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and configurations
│   │   ├── pages/        # Page components
│   │   └── App.tsx       # Main app component
│   └── index.html
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # In-memory storage
├── shared/               # Shared types and schemas
│   └── schema.ts
├── uploads/              # Uploaded images
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── aws-deploy.yml       # AWS deployment config
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/user` - Get current user (protected)

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (protected, with image upload)
- `PUT /api/menu/:id` - Update menu item (protected, with image upload)
- `DELETE /api/menu/:id` - Delete menu item (protected)

### Order Management
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status (protected)

## Default Data

The application comes with:
- **Admin user**: `admin` / `admin123`
- **Sample menu items**: Pizza, burgers, salads, beverages, and desserts
- **Order statuses**: pending, preparing, ready, delivered

## Security Features

- Session-based authentication
- Input validation with Zod schemas
- File upload restrictions (images only, 5MB limit)
- CSRF protection through session tokens
- Secure headers in production

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.