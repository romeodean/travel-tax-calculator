# Travel Tax Residency Calculator

A modern web application for tracking international travel and monitoring tax residency status across multiple jurisdictions.

## Features

- **Easy Travel Entry**: Simple form to log your international travel movements
- **Multi-Jurisdiction Support**: Pre-configured for 10 countries with different tax rules
  - Australia, New Zealand, United States, South Korea, Hong Kong
  - Italy, UAE, Monaco, United Kingdom, Japan
- **Smart Calculations**: Automatically tracks days spent in each country
  - Calendar year tracking (Jan-Dec)
  - Rolling 12-month tracking
- **Visual Status Indicators**: Traffic light system shows your tax residency risk
  - 🟢 Green: Safe
  - 🟠 Orange: Approaching threshold (80%+)
  - 🔴 Red: Over threshold
- **Data Persistence**: Your travel data is saved locally in your browser
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd travel-calc

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Adding a Travel Entry

1. Select your **departure country** and **date**
2. Select your **arrival country** and **date**
3. Click "Add Travel Entry"

The app will automatically calculate days spent in each jurisdiction.

### Understanding the Dashboard

Each country card shows:
- Current days spent vs. threshold
- Status indicator (green/orange/red)
- Calculation method (calendar year or rolling 12 months)
- Progress bar showing proximity to threshold

### Managing Your Data

- **View History**: See all your travel entries in the history table
- **Delete Entries**: Remove individual entries if needed
- **Clear All Data**: Reset all travel data (with confirmation)

## Tax Residency Rules

The app includes pre-configured rules for each jurisdiction:

| Country | Threshold | Calculation Period |
|---------|-----------|-------------------|
| Australia | 183 days | Calendar Year |
| New Zealand | 183 days | Rolling 12 Months |
| United States | 183 days | Calendar Year* |
| South Korea | 183 days | Calendar Year |
| Hong Kong | 180 days | Calendar Year |
| Italy | 183 days | Calendar Year |
| UAE | 183 days | Rolling 12 Months |
| Monaco | 183 days | Calendar Year |
| United Kingdom | 183 days | Calendar Year** |
| Japan | 183 days | Rolling 12 Months |

*US uses substantial presence test with weighted calculation
**UK tax year runs April 6 - April 5

> **Note**: This tool provides estimates based on simplified rules. Always consult a tax professional for your specific situation.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to Vercel.

Quick deploy:
```bash
npm i -g vercel
vercel
```

## Technology Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns
- **Storage**: localStorage

## Project Structure

```
travel-calc/
├── app/
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   ├── taxRules.ts       # Country-specific tax rules
│   └── calculations.ts   # Day calculation logic
├── package.json
└── README.md
```

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT

## Disclaimer

This tool is for informational purposes only and should not be considered as tax advice. Tax residency rules are complex and depend on many factors beyond just days spent in a country. Always consult with qualified tax professionals for your specific situation.

## Support

For issues or questions, please open an issue on GitHub.
# Trigger rebuild
