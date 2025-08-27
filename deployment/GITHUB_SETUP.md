# GitHub Repository Setup Guide

This guide helps you set up your GitHub repository and prepare for deployment.

## Step 1: Create GitHub Repository

### Option A: GitHub CLI (Recommended)
```bash
# Navigate to deployment folder
cd deployment

# Initialize git repository
git init

# Create GitHub repository
gh repo create restaurant-management-system --public --description "A full-stack restaurant management application"

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Restaurant management system"

# Push to GitHub
git push -u origin main
```

### Option B: GitHub Web Interface
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `restaurant-management-system`
3. Description: `A full-stack restaurant management application`
4. Set as Public
5. Don't initialize with README (we have one)
6. Click "Create repository"

Then in your terminal:
```bash
cd deployment
git init
git add .
git commit -m "Initial commit: Restaurant management system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/restaurant-management-system.git
git push -u origin main
```

## Step 2: Repository Structure

Your GitHub repository will contain:

```
restaurant-management-system/
├── .github/workflows/          # GitHub Actions CI/CD
│   └── deploy.yml             # Automated deployment
├── .platform/                 # AWS Elastic Beanstalk config
│   ├── nginx/conf.d/          # Nginx configuration
│   └── hooks/postdeploy/      # Post-deployment scripts
├── .aws/                      # AWS ECS configuration
│   └── task-definition.json   # ECS task definition
├── .ebextensions/             # Elastic Beanstalk extensions
│   └── 01_node.config         # Node.js configuration
├── client/                    # React frontend
│   ├── src/                   # Source code
│   └── index.html             # HTML template
├── server/                    # Express backend
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API routes
│   └── storage.ts             # In-memory storage
├── shared/                    # Shared types and schemas
│   └── schema.ts              # TypeScript types
├── uploads/                   # Image uploads directory
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose setup
├── package.json               # Dependencies and scripts
├── README.md                  # Project documentation
├── DEPLOYMENT.md              # Deployment guide
└── LICENSE                    # MIT License
```

## Step 3: Configure Secrets (for AWS Deployment)

If you plan to use GitHub Actions for automated AWS deployment:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following repository secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `AWS_ACCESS_KEY_ID` | AWS access key | AWS IAM Console |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | AWS IAM Console |

### Creating AWS IAM User for GitHub Actions

1. **Go to AWS IAM Console**
2. **Create new user**: `github-actions-restaurant-app`
3. **Attach policies**:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonECS_FullAccess`
   - `AmazonElasticBeanstalkFullAccess`
4. **Create access key** and add to GitHub secrets

## Step 4: Local Development Setup

Anyone cloning your repository can start development with:

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/restaurant-management-system.git
cd restaurant-management-system

# Install dependencies
npm install

# Start development server
npm run dev

# Access application at http://localhost:5000
```

## Step 5: Deployment Options

### Immediate Deploy to AWS

**Elastic Beanstalk (Easiest):**
```bash
eb init
eb create restaurant-app-prod
eb deploy
```

**Docker on any platform:**
```bash
docker build -t restaurant-app .
docker run -p 5000:5000 restaurant-app
```

### Automated Deployment

The repository includes GitHub Actions workflow that automatically:
1. Tests the application on every push
2. Builds Docker image
3. Deploys to AWS ECS on main branch pushes

## Step 6: Update Documentation

### Customize README.md
Update these sections in your README.md:
- Replace `<your-repo-url>` with your actual repository URL
- Add your deployment URL
- Update contact information
- Add screenshots if desired

### Environment Variables
For production deployment, set:
```bash
# Critical: Change the default session secret
SESSION_SECRET=your-very-secure-random-secret-string

# Optional: Custom port
PORT=5000
```

## Step 7: Project Management

### Recommended Branch Strategy
- `main` - Production-ready code
- `develop` - Development integration
- `feature/*` - Individual features
- `hotfix/*` - Critical production fixes

### Issue Templates
Create `.github/ISSUE_TEMPLATE/` with:
- Bug report template
- Feature request template
- Question template

### Contributing Guidelines
Create `CONTRIBUTING.md` with:
- Development setup instructions
- Code style guidelines
- Pull request process
- Testing requirements

## Step 8: Monitoring Setup

### GitHub Insights
Enable in repository settings:
- Dependency graph
- Dependabot alerts
- Security advisories

### AWS Monitoring (Post-Deployment)
- CloudWatch alarms for application health
- Log aggregation and analysis
- Performance monitoring
- Cost tracking

## Example Commands After Setup

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run check           # TypeScript type checking

# Deployment
eb deploy               # Deploy to Elastic Beanstalk
docker-compose up       # Local Docker deployment

# Testing
curl http://localhost:5000/api/menu  # Test API
```

## Repository Features

Your GitHub repository will have:

✅ **Complete source code** with no database dependencies  
✅ **Docker support** for easy deployment anywhere  
✅ **AWS deployment configs** for multiple AWS services  
✅ **GitHub Actions** for automated testing and deployment  
✅ **Comprehensive documentation** for setup and deployment  
✅ **Production-ready configuration** with security best practices  
✅ **In-memory storage** for immediate functionality without database setup  

## Support and Maintenance

### Regular Updates
- Monitor for security vulnerabilities
- Update dependencies regularly
- Review and update documentation
- Backup uploaded images to cloud storage

### Community
- Encourage contributions through issues and PRs
- Maintain responsive issue resolution
- Document new features and changes
- Provide clear setup instructions

Your repository is now ready to be shared, deployed, and maintained professionally!