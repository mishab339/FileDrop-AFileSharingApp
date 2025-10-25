# FileShare - Secure File Sharing Application

<div align="center">
  <img src="client/public/Upload-PNG-HD-Image.png" alt="FileShare Logo" width="200"/>
  <p><strong>Share Moments, Not Just Files</strong></p>
  <p>A modern, secure, and blazing-fast file-sharing platform with Google Drive-like interface</p>
</div>

## ✨ Overview

FileShare is a full-stack file-sharing application that combines security, speed, and simplicity. Built with React 18, Node.js, Express, and MongoDB, it offers a seamless experience for uploading, organizing, and sharing files with advanced features like folder management, password protection, expiration control, and comprehensive analytics.

## 🚀 Features

### 📁 File & Folder Management
- **Folder Organization**: Create nested folders with custom colors (Google Drive-like interface)
- **Drag & Drop Upload**: Intuitive file upload with real-time progress tracking
- **File Preview**: In-app preview for images, videos, and documents
- **Search & Filter**: Advanced search with file type filters and sorting options
- **Grid/List View**: Toggle between different view modes
- **Breadcrumb Navigation**: Easy navigation through folder hierarchy
- **Bulk Operations**: Upload and manage multiple files at once

### 🔐 Security & Privacy
- **JWT Authentication**: Secure login/signup with email verification
- **Password Protection**: Optional password protection for shared files
- **File Expiration**: Set automatic expiration dates for shared links
- **Role-Based Access**: User and Admin roles with different permissions
- **Secure Storage**: Encrypted file storage with secure access control
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive sanitization and validation

### 📊 Analytics & Tracking
- **Download Tracking**: Monitor download counts and view statistics
- **Storage Metrics**: Track storage usage per user
- **Admin Analytics**: System-wide statistics and user activity monitoring
- **File Insights**: Public/private status, expiration info, and sharing stats

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Glass-morphism Effects**: Modern, beautiful UI with backdrop blur
- **Smooth Animations**: Fade-in, scale, and transition effects
- **Toast Notifications**: Real-time feedback with react-hot-toast
- **Icon Library**: Feather Icons (react-icons/fi) throughout the app
- **Accessible**: ARIA labels and keyboard navigation support

### 👨‍💼 Admin Panel
- **User Management**: View, activate/deactivate users, change roles
- **File Management**: View all files, soft delete, and permanent delete
- **System Analytics**: User growth, file statistics, storage metrics
- **Data Visualization**: Interactive charts with Recharts

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Lightning-fast build tool and development server
- **React Router v6** - Client-side routing with future flags (v7 ready)
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **React Dropzone** - Drag & drop file upload functionality
- **React Hot Toast** - Beautiful toast notifications
- **React Helmet Async** - Manage document head for SEO
- **Recharts** - Data visualization library for analytics
- **Axios** - Promise-based HTTP client
- **date-fns** - Modern date utility library
- **React Icons (Feather)** - Beautiful icon set

### Backend
- **Node.js (v16+)** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL document database
- **Mongoose** - Elegant MongoDB object modeling
- **JWT (jsonwebtoken)** - Secure authentication tokens
- **Bcrypt** - Password hashing and salting
- **Multer** - Multipart/form-data file upload handling
- **Nodemailer** - Email sending for verification and notifications
- **Sharp** - High-performance image processing
- **Express Validator** - Input validation and sanitization
- **Helmet** - Security middleware for HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

### Development Tools
- **Nodemon** - Auto-restart server on file changes
- **Concurrently** - Run multiple npm scripts simultaneously
- **ESLint** - JavaScript linting
- **PostCSS** - CSS transformations
- **Autoprefixer** - Add vendor prefixes automatically

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
cd "file sharing app"
```

### 2. Install All Dependencies

```bash
# Install all dependencies (root, client, and server) with one command
npm run install-all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:

```bash
# Copy the example file (if available)
cp server/env.example server/.env
```

Add the following configuration to `server/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/filesharing

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# File Upload Settings
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads

# Frontend URL
CLIENT_URL=http://localhost:3000
```

**Important Notes:**
- `MAX_FILE_SIZE` must be in bytes (104857600 = 100MB)
- For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833)
- Change `JWT_SECRET` to a strong random string in production

### 4. Start MongoDB

Ensure MongoDB is running:

```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux (Ubuntu/Debian)
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud) - update MONGODB_URI accordingly
```

### 5. Create Admin User (Optional)

```bash
cd server
node createAdmin.js
```

Follow the prompts to create an admin account.

### 6. Run the Application

```bash
# From root directory - runs both client and server concurrently
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Server (port 5000)
cd server
npm run dev

# Terminal 2 - Client (port 3000)
cd client
npm run dev
```

### 7. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin) (requires admin account)

## 📁 Project Structure

```
file-sharing-app/
├── client/                     # React frontend (Vite)
│   ├── public/                # Static assets
│   │   ├── Upload-PNG-HD-Image.png  # Favicon/logo
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── DropdownMenu.jsx   # Custom dropdown component
│   │   │   ├── FileIcon.jsx       # File type icon renderer
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   └── ProtectedRoute.jsx # Auth route wrapper
│   │   ├── context/           # React Context providers
│   │   │   └── AuthContext.jsx    # Authentication state
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── FolderView.jsx     # Main file manager (Google Drive-like)
│   │   │   ├── Upload.jsx         # File upload page
│   │   │   ├── FilePreview.jsx    # File details and preview
│   │   │   ├── SharedFile.jsx     # Public file sharing page
│   │   │   ├── Profile.jsx        # User profile
│   │   │   ├── AdminDashboard.jsx # Admin panel
│   │   │   ├── VerifyEmail.jsx    # Email verification
│   │   │   └── ResetPassword.jsx  # Password reset
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles (Tailwind)
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS config
│   └── package.json           # Client dependencies
│
├── server/                    # Node.js backend
│   ├── config/                # Configuration files
│   │   └── multer.js          # File upload configuration
│   ├── middleware/            # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   └── validation.js      # Input validation
│   ├── models/                # Mongoose schemas
│   │   ├── User.js            # User model
│   │   ├── File.js            # File model
│   │   └── Folder.js          # Folder model
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── files.js           # File management routes
│   │   ├── folders.js         # Folder management routes
│   │   └── admin.js           # Admin routes
│   ├── utils/                 # Utility functions
│   │   └── sendEmail.js       # Email sending utility
│   ├── uploads/               # File storage directory (auto-created)
│   ├── index.js               # Server entry point
│   ├── createAdmin.js         # Admin user creation script
│   ├── .env                   # Environment variables (create this)
│   └── package.json           # Server dependencies
│
├── package.json               # Root package.json (scripts)
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
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

### Available NPM Scripts

**Root Directory:**
```bash
npm run dev           # Run both client and server concurrently
npm run install-all   # Install all dependencies (root, client, server)
npm run build         # Build client for production
```

**Client Directory:**
```bash
npm run dev    # Start Vite dev server (port 3000)
npm run build  # Build for production
npm run preview # Preview production build
```

**Server Directory:**
```bash
npm run dev   # Start server with nodemon (port 5000)
npm start     # Start server in production mode
```

### User Workflow

1. **Registration & Login**
   - Register with email and password
   - Verify email address via verification link
   - Login with JWT-based authentication
   - Password reset via email if forgotten

2. **Folder Management**
   - Create folders with custom names and colors
   - Navigate through nested folder structure
   - Organize files within folders
   - Breadcrumb navigation for easy traversal

3. **File Upload**
   - Drag & drop files or click to browse
   - Upload to specific folders
   - Support for all file types (images, videos, documents, etc.)
   - Real-time upload progress tracking
   - File size validation (max 100MB per file)

4. **File Management**
   - View files in grid or list view
   - Search files by name, description, or tags
   - Filter by file type (images, videos, documents, etc.)
   - Sort by name, date, or size
   - Edit file metadata (public/private, password, expiration, tags)
   - Delete files with confirmation

5. **File Sharing**
   - Generate unique shareable links
   - Optional password protection
   - Set expiration dates for links
   - Copy share links to clipboard
   - Track download and view counts
   - Public/private file visibility

6. **File Preview**
   - View file details (name, size, type, upload date)
   - Preview images and videos in-app
   - Download files securely
   - View file statistics

### Admin Workflow

1. **Dashboard Analytics**
   - View system statistics (total users, files, storage)
   - Monitor user growth trends
   - Track file upload activity
   - Analyze storage usage

2. **User Management**
   - View all registered users
   - Activate/deactivate user accounts
   - Change user roles (user/admin)
   - Monitor individual storage usage
   - Search and filter users

3. **File Management**
   - View all files in the system
   - Soft delete (deactivate) files
   - Permanently delete files (with storage cleanup)
   - Monitor file statistics
   - Search and filter files

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
# Server Configuration
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas recommended for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/filesharing?retryWrites=true&w=majority

# JWT Configuration (Use strong secret in production)
JWT_SECRET=your_super_strong_production_secret_at_least_32_chars_long
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload (100MB = 104857600 bytes)
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads

# Frontend URL (Your deployed domain)
CLIENT_URL=https://your-domain.com
```

### Build for Production

```bash
# 1. Build the client
cd client
npm run build
# Built files will be in client/dist/

# 2. The server will serve the built files in production
# No build step needed for server (Node.js runs directly)
```

### Deployment Options

#### 1. **Vercel (Recommended for Frontend)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

#### 2. **Render (Full-Stack)**

- Create a new Web Service for the backend
- Connect your GitHub repository
- Set build command: `cd server && npm install`
- Set start command: `cd server && npm start`
- Add environment variables from the dashboard

#### 3. **Heroku**

```bash
# Install Heroku CLI
# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# ... set other env variables

# Deploy
git push heroku main
```

#### 4. **DigitalOcean App Platform**

- Connect GitHub repository
- Configure build and run commands
- Add environment variables
- Deploy automatically on git push

#### 5. **VPS (Ubuntu Server)**

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
# Follow MongoDB installation guide for Ubuntu

# Clone repository
git clone your-repo-url
cd file-sharing-app

# Install dependencies
npm run install-all

# Build client
cd client && npm run build && cd ..

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Start server with PM2
cd server
pm2 start index.js --name "fileshare-api"
pm2 save
pm2 startup

# Setup Nginx as reverse proxy
sudo apt install nginx
# Configure Nginx to proxy port 80 to port 5000
```

### Post-Deployment Checklist

- [ ] Set strong `JWT_SECRET` (at least 32 characters)
- [ ] Configure MongoDB Atlas with IP whitelist
- [ ] Set up email service (Gmail App Password or SendGrid)
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up database backups
- [ ] Configure file upload limits
- [ ] Test all features in production
- [ ] Monitor error logs
- [ ] Set up application monitoring (optional)

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

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| GET | `/me` | Get current user | Yes |
| POST | `/verify-email` | Verify email address | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| PUT | `/update-profile` | Update user profile | Yes |
| PUT | `/change-password` | Change user password | Yes |

### File Endpoints (`/api/files`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload files | Yes |
| GET | `/my-files` | Get user's files | Yes |
| GET | `/:id` | Get file details | Yes |
| PUT | `/:id` | Update file settings | Yes |
| DELETE | `/:id` | Delete file | Yes |
| POST | `/download/:id` | Download file | Yes |
| GET | `/shared/:shareId` | Get shared file info | No |
| POST | `/shared/:shareId/download` | Download shared file | No |

### Folder Endpoints (`/api/folders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get folders and files | Yes |
| POST | `/` | Create new folder | Yes |
| GET | `/:id` | Get folder details | Yes |
| PUT | `/:id` | Update folder | Yes |
| DELETE | `/:id` | Delete folder | Yes |

### Admin Endpoints (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Get system statistics | Admin |
| GET | `/users` | Get all users | Admin |
| GET | `/files` | Get all files | Admin |
| PUT | `/users/:id` | Update user (role/status) | Admin |
| PUT | `/files/:id/soft-delete` | Soft delete file | Admin |
| DELETE | `/files/:id/permanent` | Permanently delete file | Admin |
| GET | `/analytics` | Get analytics data | Admin |

### Request & Response Examples

**Register User:**
```json
// POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "success": true,
  "message": "Registration successful. Please check your email.",
  "token": "eyJhbGciOiJIUzI1..."
}
```

**Upload File:**
```bash
# POST /api/files/upload
# Content-Type: multipart/form-data
# Authorization: Bearer <token>

FormData:
  files: [File, File, ...]
  folderId: "optional-folder-id"
```

**Create Folder:**
```json
// POST /api/folders
{
  "name": "My Documents",
  "parentFolder": null,  // or parent folder ID
  "color": "#3b82f6"
}
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB is running:
  ```bash
  # Windows
  net start MongoDB
  
  # macOS
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  ```
- Check connection string in `.env`
- Verify MongoDB is listening on port 27017
- For MongoDB Atlas, check IP whitelist

#### 2. File Upload Fails

**Error:** `File too large` or `Upload failed`

**Solutions:**
- Check `MAX_FILE_SIZE` in `.env` (must be in bytes: 104857600 = 100MB)
- Verify `uploads` directory exists and has write permissions:
  ```bash
  cd server
  mkdir -p uploads
  chmod 755 uploads
  ```
- Check available disk space
- Ensure file MIME type is allowed in `multer.js`

#### 3. Email Not Sending

**Error:** `Email sending failed` or `Invalid credentials`

**Solutions:**
- For Gmail:
  - Enable 2-factor authentication
  - Generate App Password: https://myaccount.google.com/apppasswords
  - Use App Password in `EMAIL_PASS`
- Check SMTP settings match your email provider
- Test with a different email service (SendGrid, Mailgun)
- Verify firewall isn't blocking port 587

#### 4. Build Errors

**Error:** `Module not found` or `Dependency errors`

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json
npm run install-all

# Or manually
cd client && npm install && cd ..
cd server && npm install && cd ..
npm install
```

#### 5. Port Already in Use

**Error:** `Port 3000/5000 is already in use`

**Solutions:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

#### 6. CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Update `CLIENT_URL` in server `.env`
- Check CORS configuration in `server/index.js`
- Ensure frontend is accessing correct backend URL

#### 7. JWT Token Errors

**Error:** `Invalid token` or `Token expired`

**Solutions:**
- Clear browser localStorage and cookies
- Ensure `JWT_SECRET` matches between server and env file
- Check token expiration in `JWT_EXPIRE`
- Re-login to get new token

#### 8. React Router Warnings

**Warning:** `React Router Future Flag Warning`

**Solution:** Already fixed! The app uses:
```javascript
<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

### Debug Mode

Enable detailed logging:

```env
# In server/.env
NODE_ENV=development
DEBUG=true
```

Check logs:
```bash
# Server logs
cd server
npm run dev  # Watch console output

# MongoDB logs (if local)
tail -f /usr/local/var/log/mongodb/mongo.log  # macOS
sudo tail -f /var/log/mongodb/mongod.log      # Linux
```

### Getting Help

- Check existing GitHub issues
- Create a new issue with:
  - Error message (full stack trace)
  - Steps to reproduce
  - Environment (OS, Node version, MongoDB version)
  - Relevant code snippets

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📸 Screenshots

### Landing Page
*Modern, gradient-based landing page with clear call-to-action*

### File Manager
*Google Drive-like interface with folder organization, grid/list views, and search functionality*

### File Upload
*Drag & drop interface with real-time progress tracking*

### Admin Dashboard
*Comprehensive analytics with user management and file oversight*

### Mobile Responsive
*Fully responsive design optimized for mobile devices*

## ✨ Key Highlights

- 🚀 **Blazing Fast**: Built with Vite for lightning-fast development and builds
- 🔐 **Secure**: JWT authentication, password hashing, and encrypted storage
- 📱 **Mobile-First**: Responsive design that works perfectly on all devices
- 🎨 **Beautiful UI**: Modern glass-morphism design with smooth animations
- 📁 **Organized**: Folder system for better file management
- 📊 **Analytics**: Track downloads, views, and storage usage
- 👨‍💼 **Admin Panel**: Comprehensive system management tools
- ⚡ **Real-time**: Live upload progress and instant notifications

## 🛠️ Built With Love Using

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Node.js](https://nodejs.org/) - Runtime environment
- [Express](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [React Router](https://reactrouter.com/) - Routing
- [Recharts](https://recharts.org/) - Charts

## 👏 Acknowledgments

- React team for the amazing library
- Vite team for the incredible build tool
- Tailwind CSS for the utility-first framework
- MongoDB team for the flexible database
- All open-source contributors and maintainers

## 📞 Support & Contact

For questions, issues, or suggestions:

- Create an issue in the repository
- Email: support@fileshare.com (if applicable)
- Documentation: Check this README and inline code comments

## 🚀 Future Enhancements

- [ ] Cloud storage integration (AWS S3, Google Cloud Storage)
- [ ] Real-time collaboration features
- [ ] Advanced file preview (PDFs, Office documents)
- [ ] Bulk download as ZIP
- [ ] File versioning and history
- [ ] Two-factor authentication
- [ ] Social media integration
- [ ] Mobile apps (React Native)
- [ ] File encryption at rest
- [ ] Advanced search with filters

---

<div align="center">
  <strong>Happy File Sharing! 🚀</strong>
  <br>
  <sub>Built with ❤️ by developers, for developers</sub>
  <br><br>
  <a href="#fileshare---secure-file-sharing-application">Back to Top ⬆️</a>
</div>
