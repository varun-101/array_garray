# MongoDB Database Setup Guide

## Overview
This backend now includes MongoDB integration for storing user data, issues, and pull requests. The database provides persistent storage and advanced querying capabilities.

## Environment Variables Required

Create a `.env` file in the backend directory with the following variables:

```env
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/codeissance_hackathon

# Server Configuration
PORT=3000
NODE_ENV=development
```

## MongoDB Connection Options

### 1. Local MongoDB Installation
```env
MONGODB_URI=mongodb://localhost:27017/codeissance_hackathon
```

### 2. MongoDB Atlas (Cloud)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codeissance_hackathon?retryWrites=true&w=majority
```

### 3. MongoDB with Authentication
```env
MONGODB_URI=mongodb://username:password@localhost:27017/codeissance_hackathon
```

## Database Models

### User Model
Stores GitHub user information and preferences:
- GitHub ID, username, email, name, avatar
- Access tokens and login history
- User preferences (theme, notifications)
- Repository list and statistics
- Activity stats (repos, issues, PRs)

### Issue Model
Tracks GitHub issues created through the app:
- Issue details (title, body, state, labels)
- Repository information
- Author and assignee details
- Comments, reactions, and milestones
- Creation metadata

### Pull Request Model
Tracks GitHub pull requests created through the app:
- PR details (title, body, state, draft status)
- Branch information (head/base)
- Author, assignees, and reviewers
- Merge information and statistics
- Creation metadata

## Database Service

The `DatabaseService` class provides methods for:
- User management (create, update, find)
- Repository synchronization
- Issue and PR tracking
- Statistics calculation
- Data cleanup operations

## API Endpoints

### User Management
- `GET /api/users/:githubId` - Get user profile
- `GET /api/users/:githubId/repos` - Get user repositories from DB
- `PUT /api/users/:githubId/repos` - Update user repositories
- `GET /api/users/:githubId/stats` - Get user statistics
- `PATCH /api/users/:githubId/preferences` - Update user preferences
- `GET /api/users/:githubId/issues` - Get user issues from DB
- `GET /api/users/:githubId/pull-requests` - Get user PRs from DB

### GitHub Integration (with DB tracking)
- All existing GitHub endpoints now save data to MongoDB
- Issues and PRs created through the API are tracked
- User data is automatically synchronized

## Database Features

### Automatic Data Synchronization
- User data is saved/updated on GitHub OAuth
- Repository information is cached locally
- Issues and PRs are tracked when created through the API

### Performance Optimizations
- Indexed fields for fast queries
- Efficient data structures
- Connection pooling and error handling

### Data Integrity
- Unique constraints on GitHub IDs
- Validation on required fields
- Automatic timestamp management

## Setup Instructions

1. **Install MongoDB** (if using local instance):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS with Homebrew
   brew install mongodb-community
   
   # Start MongoDB service
   sudo systemctl start mongod  # Linux
   brew services start mongodb-community  # macOS
   ```

2. **Set up MongoDB Atlas** (if using cloud):
   - Create account at https://cloud.mongodb.com
   - Create a new cluster
   - Get connection string
   - Update MONGODB_URI in .env file

3. **Configure Environment Variables**:
   - Copy the example above to `.env` file
   - Update with your actual values

4. **Start the Application**:
   ```bash
   npm start
   ```

## Database Connection

The application automatically connects to MongoDB on startup. You'll see:
```
✅ MongoDB Connected: localhost
```

## Data Flow

1. **User Authentication**:
   - GitHub OAuth → Save/update user in MongoDB
   - Return user data with database ID

2. **Repository Operations**:
   - Fetch from GitHub API → Cache in user's repository list
   - Update statistics and metadata

3. **Issue/PR Creation**:
   - Create via GitHub API → Save to MongoDB
   - Track creation metadata and app usage

4. **Data Retrieval**:
   - Fast queries from MongoDB cache
   - Fallback to GitHub API if needed

## Maintenance

### Cleanup Operations
The database service includes cleanup methods:
- Remove expired access tokens
- Archive old data
- Update statistics

### Monitoring
Monitor database performance:
- Connection status
- Query performance
- Storage usage
- Error rates

## Security Considerations

1. **Access Token Storage**: Tokens are stored securely in MongoDB
2. **Data Validation**: All inputs are validated before saving
3. **Connection Security**: Use SSL for production MongoDB connections
4. **Environment Variables**: Never commit .env files to version control

## Troubleshooting

### Connection Issues
- Check MongoDB service status
- Verify connection string format
- Ensure network connectivity
- Check authentication credentials

### Data Issues
- Verify GitHub API responses
- Check data validation rules
- Monitor error logs
- Use database service methods

## Production Considerations

1. **Use MongoDB Atlas** for production
2. **Enable SSL/TLS** connections
3. **Set up monitoring** and alerts
4. **Implement backup** strategies
5. **Use connection pooling**
6. **Monitor performance** metrics
