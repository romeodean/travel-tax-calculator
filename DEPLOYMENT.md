# Deploying to Vercel

## Quick Start

Your Travel Tax Calculator is ready to deploy! Follow these steps to get it live on Vercel.

## Prerequisites

1. A GitHub account (free)
2. A Vercel account (free) - sign up at https://vercel.com

## Step-by-Step Deployment

### 1. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Travel Tax Calculator"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `travel-tax-calculator`)
3. Do NOT initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/travel-tax-calculator.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### 4. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in (or sign up with your GitHub account)
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`travel-tax-calculator`)
4. Vercel will automatically detect Next.js settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click "Deploy"

Your app will be live in about 1-2 minutes!

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - What's your project's name? travel-tax-calculator
# - In which directory is your code located? ./
# - Auto-detected Next.js. Continue? Yes
# - Override settings? No

# For production deployment:
vercel --prod
```

## After Deployment

### Your Live URL

Vercel will provide you with a URL like:
- `https://travel-tax-calculator.vercel.app`
- Or your custom domain if configured

### Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables

This app uses localStorage for data persistence, so no environment variables are needed for basic functionality.

If you want to add features like database sync or authentication later:

1. Go to Vercel Dashboard → Your Project → "Settings" → "Environment Variables"
2. Add your variables
3. Redeploy

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch = automatic production deployment
- Every pull request = automatic preview deployment

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Build for Production Locally

```bash
npm run build
npm start
```

## Features Included

- ✅ Travel entry form with date pickers
- ✅ Country selection for 10 jurisdictions (AU, NZ, US, KR, HK, IT, UAE, Monaco, UK, JP)
- ✅ Traffic light status indicators (Green/Orange/Red)
- ✅ Calendar year vs. Rolling 12-month calculations
- ✅ Automatic tax threshold monitoring
- ✅ Travel history view with delete functionality
- ✅ Data persistence via localStorage
- ✅ Responsive design (mobile-friendly)
- ✅ Tax rules reference section

## Troubleshooting

### Build Fails

Check the Vercel deployment logs:
1. Go to Vercel Dashboard → Your Project → "Deployments"
2. Click on the failed deployment
3. Review the build logs

### App Not Loading

- Clear browser cache and localStorage
- Check browser console for errors (F12)
- Ensure JavaScript is enabled

### Data Not Saving

- Check if browser allows localStorage
- Try a different browser
- Check privacy/incognito mode settings

## Support

For Vercel-specific issues:
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

For Next.js issues:
- Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

## Future Enhancements

Consider adding:
- Export data to CSV/PDF
- Import travel data
- Database sync across devices (Supabase, Firebase)
- Email notifications for threshold warnings
- Multiple user profiles
- Historical year-over-year analysis
