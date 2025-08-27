# AWS Deployment Files Guide

## 📁 ESSENTIAL FILES TO COPY (Required for AWS)

### Core Application Files
```
deployment/
├── client/                     # ✅ REQUIRED - React frontend
│   ├── src/                   # All source files needed
│   └── index.html             # Main HTML file
├── server/                     # ✅ REQUIRED - Express backend  
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   └── storage.ts            # Data management
├── shared/                     # ✅ REQUIRED - Shared types
│   └── schema.ts             # Data schemas
├── package.json               # ✅ REQUIRED - Dependencies
├── tsconfig.json             # ✅ REQUIRED - TypeScript config
├── vite.config.ts            # ✅ REQUIRED - Build config
├── tailwind.config.ts        # ✅ REQUIRED - Styling
├── postcss.config.js         # ✅ REQUIRED - CSS processing
└── components.json           # ✅ REQUIRED - UI components
```

### AWS Deployment Configurations (Choose One)
```
# For Docker deployment:
├── Dockerfile                # ✅ Multi-stage Docker build
├── docker-compose.yml        # ✅ Local testing
└── .dockerignore            # ✅ Optimize image size

# For Elastic Beanstalk:
├── buildspec.yml            # ✅ CodeBuild configuration
├── .platform/              # ✅ Platform hooks
└── .ebextensions/          # ✅ Environment setup

# For ECS/Fargate:
└── .aws/                   # ✅ Task definitions
    └── task-definition.json

# For CI/CD:
└── .github/                # ✅ GitHub Actions
    └── workflows/
        └── aws-deploy.yml
```

### Documentation (Recommended)
```
├── README.md               # ✅ Setup instructions
├── DEPLOYMENT.md          # ✅ AWS deployment guide
└── LICENSE                # ✅ License file
```

## 🚫 FILES TO EXCLUDE (Not Needed for AWS)

### Generated/Build Files
```
❌ dist/                    # Build output (will be regenerated)
❌ node_modules/           # Dependencies (npm install will handle)
❌ uploads/               # User uploads (create fresh on AWS)
```

### Documentation Files (Optional)
```
❌ AWS_READINESS_CHECKLIST.md
❌ PRODUCTION_TEST_RESULTS.md  
❌ COMPREHENSIVE_AWS_CHECK.md
❌ FINAL_VERIFICATION.md
❌ GITHUB_SETUP.md
```

### Environment Files
```
❌ .env                   # Don't copy - set in AWS console
❌ .env.local            # Local development only
```

## 🎯 QUICK COPY COMMANDS

### Copy Essential Files Only
```bash
# From your deployment folder, copy these to your AWS project:
cp -r client/ server/ shared/ /path/to/aws-project/
cp package.json tsconfig.json vite.config.ts tailwind.config.ts /path/to/aws-project/
cp postcss.config.js components.json /path/to/aws-project/
```

### Add Your Chosen Deployment Method
```bash
# For Docker:
cp Dockerfile docker-compose.yml .dockerignore /path/to/aws-project/

# For Elastic Beanstalk:
cp -r .platform/ .ebextensions/ buildspec.yml /path/to/aws-project/

# For ECS:
cp -r .aws/ /path/to/aws-project/

# For GitHub Actions:
cp -r .github/ /path/to/aws-project/
```

## 📋 FILE SIZE BREAKDOWN

### Essential Files (~50MB after npm install)
- **Source Code**: ~2MB (TypeScript + React)
- **Dependencies**: ~45MB (node_modules after install)
- **Build Output**: ~3MB (after npm run build)

### Total Upload Size: ~2-5MB
(AWS will run npm install and npm run build automatically)

## 🚀 DEPLOYMENT CHECKLIST

**Before Copying Files:**
1. ✅ Choose deployment method (Docker/Elastic Beanstalk/ECS)
2. ✅ Copy only essential files listed above
3. ✅ Set environment variables in AWS (not in files)
4. ✅ Verify package.json has correct start script

**Environment Variables to Set in AWS:**
```bash
NODE_ENV=production
PORT=5000
SESSION_SECRET=<your-secure-secret-key>
```

**After Deployment:**
- AWS will automatically run `npm install`
- AWS will automatically run `npm run build`
- Your app will be available on the assigned URL

## 💡 PRO TIPS

1. **Keep it minimal**: Only copy source files, let AWS handle building
2. **Use .gitignore**: Don't upload build artifacts or node_modules
3. **Environment variables**: Set secrets in AWS console, not in files
4. **Choose one method**: Pick Docker OR Elastic Beanstalk OR ECS, not all

---

**Summary**: Copy ~15-20 core files (2-5MB total) and let AWS handle the rest!