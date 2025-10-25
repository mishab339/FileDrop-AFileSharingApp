# FileShare - Secure File Sharing Application

A modern, secure, and fast file-sharing web application built with React, Node.js, Express, and MongoDB. Users can upload, share, and manage files with advanced security features including password protection, expiration dates, and download tracking.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based login/signup with email verification
- **File Upload**: Drag & drop upload with progress tracking
- **Secure Sharing**: Generate unique shareable links with password protection
- **File Management**: View, organize, and delete uploaded files
- **Download Tracking**: Monitor download counts and views
- **Expiration Control**: Set automatic expiration dates for shared files
- **File Preview**: Preview images and documents before download
- **Admin Panel**: Manage users, files, and system analytics

### Security Features
- Password-protected file sharing
- File expiration dates
- Secure file storage with encryption
- Rate limiting and security headers
- Input validation and sanitization

### UI/UX Features
- Modern, responsive design with Tailwind CSS
- Drag & drop file upload interface
- Real-time upload progress
- Mobile-friendly interface
- Dark/light theme support
- Intuitive navigation

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Dropzone** - Drag & drop file upload
- **React Hot Toast** - Beautiful notifications
- **Recharts** - Data visualization for admin panel
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email sending
- **Sharp** - Image processing

### Development Tools
- **Vite** - Fast build tool and dev server
- **Nodemon** - Auto-restart server
- **Concurrently** - Run multiple commands
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd file-sharing-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create environment files for the server:

```bash
# Copy the example environment file
cp server/env.example server/.env
```

Edit `server/.env` with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/filesharing
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File upload settings
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the Application

```bash
# From the root directory
npm run dev
```

This will start both the server (port 5000) and client (port 3000) concurrently.

Alternatively, you can run them separately:

```bash
# Terminal 1 - Start the server
cd server
npm run dev

# Terminal 2 - Start the client (Vite)
cd client
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin (admin access required)

## 📁 Project Structure

```
file-sharing-app/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── uploads/          # File storage directory
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 Configuration

### Database Configuration

The application uses MongoDB for data storage. Make sure to:

1. Install MongoDB locally or use MongoDB Atlas (cloud)
2. Update the `MONGODB_URI` in your `.env` file
3. The application will automatically create the necessary collections

### Email Configuration

For email functionality (password reset, email verification):

1. **Gmail Setup**:
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password in `EMAIL_PASS`

2. **Other Email Providers**:
   - Update `EMAIL_HOST` and `EMAIL_PORT` accordingly
   - Configure authentication credentials

### File Storage

- **Local Storage**: Files are stored in `server/uploads/` directory
- **Cloud Storage**: Can be configured to use AWS S3, Cloudinary, etc.
- **File Limits**: Maximum 100MB per file (configurable)

## 🎯 Usage

### User Features

1. **Registration & Login**
   - Create an account with email verification
   - Secure login with JWT tokens
   - Password reset functionality

2. **File Upload**
   - Drag & drop files or click to browse
   - Support for multiple file types
   - Real-time upload progress
   - File size validation

3. **File Management**
   - View all uploaded files
   - Search and filter files
   - Delete unwanted files
   - Storage usage tracking

4. **File Sharing**
   - Generate shareable links
   - Set password protection
   - Configure expiration dates
   - Track download statistics

### Admin Features

1. **User Management**
   - View all users
   - Activate/deactivate accounts
   - Change user roles
   - Monitor storage usage

2. **File Management**
   - View all files
   - Delete inappropriate content
   - Monitor file statistics

3. **Analytics Dashboard**
   - User registration trends
   - File upload statistics
   - Storage usage analytics
   - System performance metrics

## 🔒 Security Features

- **Authentication**: JWT-based with secure token handling
- **Authorization**: Role-based access control
- **File Security**: Secure file storage and access
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security headers
- **Password Security**: Bcrypt hashing with salt rounds

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/filesharing
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_app_password
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads
CLIENT_URL=https://your-domain.com
```

### Build for Production

```bash
# Build the client (Vite)
cd client
npm run build

# The built files will be in client/dist/
```

### Deployment Options

1. **Heroku**: Easy deployment with buildpacks
2. **Vercel**: Great for frontend deployment
3. **DigitalOcean**: Full-stack deployment
4. **AWS**: Scalable cloud deployment

## 🧪 Testing

### Running Tests

```bash
# Run client tests
cd client
npm test

# Run server tests (if implemented)
cd server
npm test
```

### Test Coverage

- Unit tests for components
- Integration tests for API endpoints
- End-to-end tests for user workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### File Endpoints

- `POST /api/files/upload` - Upload files
- `GET /api/files/my-files` - Get user's files
- `GET /api/files/:id` - Get file details
- `GET /api/files/download/:id` - Download file
- `GET /api/files/shared/:shareId` - Get shared file
- `POST /api/files/shared/:shareId/download` - Download shared file
- `PUT /api/files/:id` - Update file settings
- `DELETE /api/files/:id` - Delete file

### Admin Endpoints

- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/files` - Get all files
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/files/:id` - Delete file (admin)
- `GET /api/admin/analytics` - Get analytics data

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access

2. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure sufficient disk space

3. **Email Not Sending**
   - Verify email credentials
   - Check SMTP settings
   - Test with different email provider

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=app:*
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- Tailwind CSS for the utility-first styling
- All the open-source contributors

## 📞 Support

For support, email support@fileshare.com or create an issue in the repository.

---

**Happy File Sharing! 🚀**
