# Smart E-Waste Platform - React Frontend

A modern, classy React.js frontend for the Smart E-Waste to Renewable Platform. This application provides a seamless user experience for managing e-waste pickups, tracking deliveries, and earning bonus points.

## 🚀 Features

### For Users
- **Modern Dashboard**: Clean, intuitive interface with real-time updates
- **E-Waste Booking**: Easy pickup scheduling with address management
- **Points System**: Earn and redeem bonus points for completed pickups
- **Real-time Tracking**: Live status updates for all bookings
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### For Administrators
- **Comprehensive Dashboard**: Overview of all system metrics
- **Route Management**: Automated route scheduling and optimization
- **Pickup Management**: Monitor and assign all pickup requests
- **Delivery Assignment**: Assign delivery partners to specific pickups
- **Real-time Monitoring**: Live updates on all system activities

### For Delivery Partners
- **Assignment Tracking**: View all assigned deliveries
- **Status Updates**: Update delivery status in real-time
- **Map Integration**: Ready for GPS navigation integration
- **Progress Tracking**: Visual progress indicators for each delivery

## 🎨 Design Features

- **Modern UI/UX**: Built with Material-UI for a professional look
- **Gradient Backgrounds**: Beautiful color schemes throughout
- **Smooth Animations**: Fade-in effects and smooth transitions
- **Glass Morphism**: Modern glass-like card effects
- **Responsive Layout**: Adapts to all screen sizes
- **Accessibility**: WCAG compliant with proper contrast and navigation

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components and theming
- **React Router** for navigation
- **Axios** for API communication
- **Framer Motion** for animations
- **React Hook Form** for form management

## 📦 Installation

1. Navigate to the React frontend directory:
   ```bash
   cd react-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🔧 Configuration

The application is configured to connect to the FastAPI backend running on `http://localhost:8000`. Make sure the backend server is running before starting the React application.

## 👥 Demo Credentials

- **Admin**: `admin` / `admin123`
- **Delivery**: `delivery1` / `delivery123`
- **User**: `user1` / `user123`

## 🎯 Key Components

### Pages
- **Login**: Authentication with role-based access
- **User Dashboard**: Booking management and points tracking
- **Admin Dashboard**: System management and monitoring
- **Delivery Dashboard**: Assignment tracking and status updates
- **Points Page**: Points history and redemption

### Features
- **Real-time Updates**: Auto-refresh every 3-5 seconds
- **Role-based Routing**: Automatic redirection based on user role
- **Form Validation**: Client-side validation with error handling
- **Responsive Design**: Mobile-first approach
- **Modern Animations**: Smooth transitions and loading states

## 🚀 Getting Started

1. **Start the Backend**: Ensure the FastAPI backend is running on port 8000
2. **Start the Frontend**: Run `npm start` in the react-frontend directory
3. **Login**: Use the demo credentials to test different user roles
4. **Explore**: Navigate through the different dashboards and features

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices with:
- Touch-friendly interface
- Swipe gestures support
- Optimized layouts for small screens
- Fast loading times

## 🎨 Customization

The application uses a centralized theme system that can be easily customized:
- Color schemes in `App.tsx`
- Component styles in individual files
- Global styles in `App.css`
- Material-UI theme overrides

## 🔒 Security

- JWT token-based authentication
- Role-based access control
- Secure API communication
- Input validation and sanitization

## 📈 Performance

- Lazy loading for better performance
- Optimized bundle size
- Efficient state management
- Minimal re-renders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Smart E-Waste Platform and follows the same licensing terms.