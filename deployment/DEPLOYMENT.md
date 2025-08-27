# Deployment Guide

This guide covers multiple deployment options for the Restaurant Management System.

## Prerequisites

- Node.js 18 or higher
- AWS CLI configured (for AWS deployments)
- Docker installed (for container deployments)

## Quick Deploy Options

### 1. AWS Elastic Beanstalk (Easiest)

**Step 1: Install EB CLI**
```bash
pip install awsebcli
```

**Step 2: Initialize and Deploy**
```bash
eb init
eb create restaurant-app
eb setenv SESSION_SECRET=your-secure-session-secret-here
eb deploy
```

**Step 3: Access your app**
```bash
eb open
```

### 2. Docker Deployment

**Step 1: Build and run locally**
```bash
docker build -t restaurant-app .
docker run -p 5000:5000 -e SESSION_SECRET=your-secret restaurant-app
```

**Step 2: Deploy with Docker Compose**
```bash
docker-compose up -d
```

### 3. AWS ECS/Fargate (Production)

**Step 1: Create ECR Repository**
```bash
aws ecr create-repository --repository-name restaurant-app
```

**Step 2: Build and push image**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker build -t restaurant-app .
docker tag restaurant-app:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/restaurant-app:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/restaurant-app:latest
```

**Step 3: Update task definition**
- Edit `.aws/task-definition.json`
- Replace `ACCOUNT_ID` and `REGION` with your values
- Create ECS cluster, service, and deploy

## Environment Configuration

### Required Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | Yes |
| `PORT` | Server port | 5000 | No |
| `SESSION_SECRET` | Session encryption key | - | Yes (production) |

### Setting Environment Variables

**Elastic Beanstalk:**
```bash
eb setenv SESSION_SECRET=your-secure-secret-here
```

**Docker:**
```bash
docker run -e SESSION_SECRET=your-secret restaurant-app
```

**Manual deployment:**
```bash
export SESSION_SECRET=your-secure-secret-here
npm start
```

## Post-Deployment Setup

### 1. Admin Access
- URL: `https://your-domain.com/auth`
- Username: `admin`
- Password: `admin123`

### 2. Customer Access
- URL: `https://your-domain.com/order`

### 3. Health Check
- URL: `https://your-domain.com/api/menu`
- Should return JSON with menu items

## Scaling Configuration

### Elastic Beanstalk Auto Scaling
```yaml
# In .ebextensions/01_node.config
option_settings:
  aws:autoscaling:asg:
    MinSize: 1
    MaxSize: 4
  aws:autoscaling:updatepolicy:rollingupdate:
    RollingUpdateEnabled: true
```

### ECS Auto Scaling
Configure in AWS Console:
- Target tracking scaling policies
- CPU utilization: 70%
- Memory utilization: 80%
- Min capacity: 2
- Max capacity: 10

## Security Considerations

### Production Checklist
- [ ] Change default admin password
- [ ] Set secure SESSION_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS headers  
- [ ] Set up WAF rules
- [ ] Enable CloudWatch logging
- [ ] Configure backup strategy

### SSL/HTTPS Setup

**Elastic Beanstalk:**
- Use Application Load Balancer
- Add SSL certificate via AWS Certificate Manager
- Configure security group for port 443

**Docker/EC2:**
- Use reverse proxy (Nginx)
- Configure Let's Encrypt certificates
- Set up automatic renewal

## Monitoring and Logging

### CloudWatch Integration
```bash
# Create log group
aws logs create-log-group --log-group-name /aws/elasticbeanstalk/restaurant-app/var/log/eb-docker/containers/eb-current-app
```

### Health Checks
- Endpoint: `/api/menu`
- Expected: HTTP 200
- Interval: 30 seconds
- Timeout: 5 seconds

## Troubleshooting

### Common Issues

**1. Upload directory permission errors**
```bash
mkdir -p uploads
chmod 755 uploads
```

**2. Session store errors**
- Verify SESSION_SECRET is set
- Check memory allocation
- Monitor memory usage

**3. Image upload failures**
- Verify upload directory exists
- Check file size limits (5MB)
- Ensure proper file permissions

**4. Database connection errors** 
- This version uses in-memory storage
- No database required
- Data resets on restart

### Log Locations

**Elastic Beanstalk:**
- `/var/log/eb-docker/containers/eb-current-app/`
- CloudWatch Logs

**Docker:**
```bash
docker logs container_name
```

**Manual deployment:**
- Console output
- Custom log files

## Backup and Recovery

### Data Backup
Since this uses in-memory storage:
- Menu items reset on restart
- Orders are temporary
- Consider database upgrade for persistence

### Application Backup
```bash
# Backup uploaded images
aws s3 sync uploads/ s3://your-backup-bucket/uploads/

# Backup application code  
git push origin main
```

## Performance Optimization

### Recommended Instance Types

**Elastic Beanstalk:**
- t3.micro (development)
- t3.small (light production)
- t3.medium (moderate traffic)

**ECS Fargate:**
- 0.25 vCPU, 0.5 GB (development)
- 0.5 vCPU, 1 GB (production)
- 1 vCPU, 2 GB (high traffic)

### CDN Setup
Configure CloudFront for:
- Static asset delivery
- Image optimization
- Global edge caching
- SSL termination

## Cost Optimization

### Estimated Monthly Costs (US East 1)

**Elastic Beanstalk:**
- t3.micro: ~$8-12/month
- t3.small: ~$16-25/month
- Load balancer: ~$20/month

**ECS Fargate:**
- 0.25 vCPU: ~$6-10/month  
- 0.5 vCPU: ~$12-18/month
- Application Load Balancer: ~$20/month

### Cost Savings Tips
- Use spot instances for non-production
- Enable auto-scaling to scale down during low traffic
- Use CloudWatch to monitor and optimize resources
- Consider reserved instances for predictable workloads