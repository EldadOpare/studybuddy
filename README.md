# StudyBuddy

StudyBuddy is a complete web application designed to make studying easier and more effective. It helps students create and organize notes, generate quizzes from their study materials, and track their learning progress all in one place.

## Live Demo

Check out the deployed application: [https://studybuddy-six-blush.vercel.app/](https://studybuddy-six-blush.vercel.app/)

## Features

- **Note Management**: Create, edit, and organize notes with a rich text editor
- **Folder Organization**: Group your notes into color-coded folders for easy access
- **AI-Powered Quiz Generation**: Create quizzes automatically from topics or uploaded PDF documents
- **Quiz Taking & Results**: Test your knowledge and track your performance over time
- **Study Planner**: Schedule study sessions and track upcoming assignments
- **AI Study Assistant (Buddy)**: Get help from an AI chatbot available on every page
- **User Dashboard**: See your statistics, recent materials, and upcoming events at a glance

## Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- PDF.js for PDF text extraction
- Responsive design for desktop and not fully one for mobile

### Backend
- Node.js with Express.js
- PostgreSQL database
- JWT authentication
- Bcrypt for password security

### AI Services
- Groq API (LLaMA 3.3 70B model) for quiz generation and chatbot

### Hosting
- Frontend: Vercel
- Backend: Railway
- Database: PostgreSQL on Railway

## Project Structure

```
studybuddy/
├── pages/              # HTML pages
├── css/                # Stylesheets
├── Js/                 # Frontend JavaScript
├── server/             # Backend code
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth & validation
│   ├── routes/         # API endpoints
│   └── database/       # Database setup
└── images/             # Static assets
```

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- A Groq API key (sign up at [https://console.groq.com](https://console.groq.com))

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studybuddy.git
   cd studybuddy
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set up your database**

   Create a PostgreSQL database and run the setup script:
   ```bash
   node database/setup.js
   ```

4. **Configure environment variables**

   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/studybuddy
   JWT_SECRET=your_random_secret_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

   Replace the values with your actual credentials:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A random string for JWT token encryption
   - `GROQ_API_KEY`: Your API key from Groq

5. **Create an admin user**

   Run the admin creation script and follow the prompts:
   ```bash
   node database/create_admin.js
   ```

   This will create an admin account with credentials you specify. Keep these credentials secure.

6. **Start the backend server**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`

7. **Update the API URL in the frontend**

   Open `Js/api.js` and update the API base URL:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

8. **Open the application**

   Open `pages/login.html` in your browser or use a local server like Live Server in VS Code.

## Deployment Guide

If you want to deploy your own instance of StudyBuddy, follow these steps:

### Deploy the Backend (Railway)

1. Create a [Railway](https://railway.app/) account
2. Create a new project and add a PostgreSQL database
3. Connect your GitHub repository or deploy from CLI
4. Add environment variables in Railway dashboard:
   - `PORT` (Railway provides this automatically)
   - `DATABASE_URL` (Railway provides this automatically)
   - `JWT_SECRET` (generate a secure random string)
   - `GROQ_API_KEY` (your Groq API key)
5. Railway will automatically deploy your backend
6. Note your backend URL (e.g., `https://backend-production-xxxx.up.railway.app`)

### Deploy the Frontend (Vercel)

1. Create a [Vercel](https://vercel.com/) account
2. Import your GitHub repository
3. Before deploying, update `Js/api.js` with your Railway backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.up.railway.app/api';
   ```
4. Configure build settings (Vercel should auto-detect)
5. Deploy the project
6. Your frontend will be live at `https://your-project.vercel.app`

### Post-Deployment Setup

1. Run the database setup script on your Railway database:
   ```bash
   railway run node server/database/setup.js
   ```

2. Create an admin user:
   ```bash
   railway run node server/database/create_admin.js
   ```

3. Test your deployment by visiting your Vercel URL and signing up for an account

## Usage

### For Students

1. **Sign up** for an account on the login page
2. **Create notes** using the rich text editor
3. **Organize notes** into folders by subject or topic
4. **Generate quizzes** from your notes or upload PDF study materials
5. **Take quizzes** to test your knowledge
6. **Review results** to identify areas that need more study
7. **Use Buddy** The AI assistant for quick study help

### For Administrators

Admins have access to additional features:
- View all registered users
- Monitor system activity
- Manage student accounts
- View platform statistics

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user information

### Notes
- `GET /api/notes` - Get all user notes
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Quizzes
- `GET /api/quizzes` - Get all user quizzes
- `GET /api/quizzes/:id` - Get a specific quiz
- `POST /api/quizzes` - Create a new quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/:id/results` - Get quiz results
- `DELETE /api/quizzes/:id` - Delete a quiz

### Folders
- `GET /api/folders` - Get all user folders
- `POST /api/folders` - Create a new folder
- `DELETE /api/folders/:id` - Delete a folder

### Groq AI
- `POST /api/groq/quiz-from-topic` - Generate quiz from a topic
- `POST /api/groq/quiz-from-content` - Generate quiz from document content
- `POST /api/groq/chat` - Chat with Buddy AI assistant

## Security Features

- Password hashing with bcrypt (cost factor: 10)
- JWT-based authentication with secure tokens
- SQL injection prevention through parameterized queries
- CORS configuration for API access control
- Environment variables for sensitive credentials
- SSL/TLS encryption in production

## Contributing

This project was created as an educational tool. If you'd like to contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Known Issues

- Quiz generation works best with well-formatted PDF documents
- The AI chatbot requires an active internet connection
- Large PDF files may take longer to process

## Future Enhancements

- Real-time collaboration on notes
- Mobile app version
- Advanced analytics dashboard
- Integration with more AI models
- Spaced repetition study system
- Export notes to PDF

## License

This project is available for educational purposes.

## Admin Access

To access admin features, you need to create an admin account:

**For Local Development:**
```bash
cd server
node database/create_admin.js
```

**For Deployed Version (Railway):**
```bash
railway run node server/database/create_admin.js
```

The script will prompt you to enter admin credentials. Once created, log in with these credentials to access:
- User management dashboard
- System statistics
- Student account administration
- Platform monitoring

**Note:** For security reasons, admin credentials are never included in the repository or documentation. Each deployment requires creating its own admin account.

## Support

If you encounter any issues or have questions:
- Check the deployment guide above
- Review the API documentation
- Ensure all environment variables are set correctly
- Verify your database connection is working
- Make sure you've created an admin user using the setup script

## Acknowledgments

- Built with Groq's LLaMA 3.3 70B model for AI capabilities
- Uses Mozilla's PDF.js for document processing
- Deployed on Railway and Vercel infrastructure
