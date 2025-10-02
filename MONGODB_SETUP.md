# MongoDB Installation Guide

This guide will help you set up MongoDB for the AI-Powered Interview Assistant application.

## Option 1: MongoDB Atlas (Cloud) - Recommended

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update your `.env` file in the backend directory:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interview_assistant
   ```

## Option 2: Local MongoDB Installation

### Windows

1. Download MongoDB Community Server from [MongoDB Downloads](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. During installation, select "Install MongoDB as a Service"
4. Add MongoDB to your PATH environment variable
5. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

### macOS

Using Homebrew:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu/Debian)

```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create the list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Verify Installation

Test your MongoDB connection:
```bash
mongo --eval "db.adminCommand('ismaster')"
```

Or using mongosh (newer versions):
```bash
mongosh --eval "db.adminCommand('ismaster')"
```

## Configuration

Once MongoDB is running, the application will automatically connect using the default connection string:
```
mongodb://localhost:27017/interview_assistant
```

The application will create the database and collections automatically when you start using it.

## Troubleshooting

### Common Issues

1. **Port 27017 already in use**
   - Check if another MongoDB instance is running
   - Use `netstat -an | grep 27017` to check port usage

2. **Permission errors**
   - Ensure MongoDB has proper file permissions
   - Run with administrator/sudo privileges if needed

3. **Connection timeout**
   - Check firewall settings
   - Verify MongoDB service is running

### Development Mode

If you can't install MongoDB, the application will run in development mode with:
- Mock data for demonstration
- All API endpoints working with sample data
- Frontend fully functional
- Limited data persistence (data will be lost on restart)

## Need Help?

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Community Forums](https://developer.mongodb.com/community/forums/)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)