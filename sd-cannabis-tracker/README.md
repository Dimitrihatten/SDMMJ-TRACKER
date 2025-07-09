# SD Cannabis Tracker - Production-Ready Medical Cannabis Patient Portal

A fully functional, HIPAA-compliant medical cannabis tracking platform for South Dakota patients. Built with Next.js, TypeScript, and enterprise-grade security.

## 🌿 Features

### Core Functionality
- ✅ **Medical Card Verification** - Real-time integration with MedCannabisVerify.sd.gov
- ✅ **Allotment Tracking** - Monitor 3oz monthly limit with visual indicators
- ✅ **Purchase History** - Detailed transaction records and analytics
- ✅ **Dispensary Integration** - Live inventory from Genesis Farms, Puffy's, and more
- ✅ **Price Comparison** - Real-time pricing across cities
- ✅ **AI Assistant** - 24/7 support powered by OpenAI
- ✅ **Real-time Updates** - Push notifications for allotment warnings

### Security & Compliance
- 🔐 AES-256 encryption for all data
- 🏥 HIPAA-compliant infrastructure
- 🛡️ SOC 2 certification (in progress)
- 🔒 Multi-factor authentication
- 📋 South Dakota law compliant (18+, edibles only)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Vercel account (for deployment)
- GitHub repository

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/sd-cannabis-tracker.git
cd sd-cannabis-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file with required values:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sd_cannabis_tracker"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Encryption
ENCRYPTION_KEY="generate-with-openssl-rand-base64-32"

# Add other required variables from .env.example
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
sd-cannabis-tracker/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   └── charts/           # Data visualization
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication config
│   ├── encryption.ts     # Encryption utilities
│   └── prisma.ts         # Database client
├── prisma/               # Database schema
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## 🔧 Configuration

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE sd_cannabis_tracker;
```

2. Run migrations:
```bash
npx prisma migrate dev
```

### External Services

#### Medical Card Verification
- Contact SD Department of Health for API access
- Test card number: `4YBPK2GJ2`

#### Dispensary APIs
- Dutchie: [dutchie.com/partners](https://dutchie.com/partners)
- Leafly: [developer.leafly.com](https://developer.leafly.com)
- Weedmaps: [developer.weedmaps.com](https://developer.weedmaps.com)

#### Payment Processing (Stripe)
1. Create Stripe account
2. Add webhook endpoint: `/api/webhooks/stripe`
3. Configure webhook secret in env

## 🚀 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Enable rate limiting
- [ ] Configure CDN for assets
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backup strategy
- [ ] Enable WAF protection
- [ ] Set up CI/CD pipeline

## 🧪 Testing

Run tests:
```bash
npm test
```

Run E2E tests:
```bash
npm run test:e2e
```

## 📊 API Documentation

### Authentication
```http
POST /api/auth/signin
Content-Type: application/json

{
  "medicalCardNumber": "4YBPK2GJ2"
}
```

### Get User Allotment
```http
GET /api/allotment
Authorization: Bearer {token}
```

### Search Products
```http
GET /api/products/search?q=gummies&city=Rapid%20City
Authorization: Bearer {token}
```

## 🔒 Security

### Best Practices
- All data encrypted at rest and in transit
- Regular security audits
- Penetration testing quarterly
- Employee security training
- Incident response plan

### Reporting Security Issues
Email: security@sdcannabis.com

## 📱 Mobile Apps

iOS and Android apps coming soon. Visit [/mobile](http://localhost:3000/mobile) for updates.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Proprietary - Trilly Club LLC. All rights reserved.

## 📞 Support

- **Technical Support:** tech@sdcannabis.com
- **Business Inquiries:** partners@trillyclub.com
- **Phone:** 1-800-TRILLY-1

## 🚨 Legal Compliance

This platform is compliant with:
- South Dakota medical cannabis laws
- HIPAA regulations
- GDPR where applicable
- PCI DSS for payments

**Important:** This platform is for medical use only by registered patients 18+ in South Dakota.

---

Built with ❤️ by Trilly Club LLC © 2025