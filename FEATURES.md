# ✈️ Travel Tax Calculator - Feature List

## 🎨 Design
- ✅ Beautiful beige/cream color scheme
- ✅ IBM Plex Mono monospace font throughout
- ✅ Card-based layout with shadow effects
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth hover animations and transitions

## 📅 Calendar Views
- ✅ **Month View** - Large calendar with flag icons per day
- ✅ **Year View** - 12 mini-months overview
- ✅ Arrow navigation (← Prev / Next →)
- ✅ Today's date highlighted with thick border
- ✅ Future dates show faded (no country data)
- ✅ Color-coded by country
- ✅ Legend adapts to view (flags in month, colors only in year)

## 🌍 Country Management
- ✅ 10 pre-configured countries with tax rules
- ✅ Edit any country's threshold (e.g., 183 → 200 days)
- ✅ Switch between Calendar Year and Rolling 12 Months
- ✅ Add custom countries with your own rules
- ✅ Delete custom countries (built-in protected)
- ✅ Country flags throughout the interface

## 📊 Tax Residency Tracking
- ✅ Automatic day counting per country
- ✅ Traffic light status (🟢 Safe / 🟠 Warning / 🔴 Danger)
- ✅ Progress bars showing proximity to threshold
- ✅ Shows all countries with non-zero days
- ✅ Calendar year (Jan-Dec) support
- ✅ Rolling 12-month support
- ✅ Real-time recalculation

## ✏️ Travel Entry Management
- ✅ Add new travel entries
- ✅ Edit existing entries
- ✅ Delete entries with confirmation
- ✅ Form validation
- ✅ Auto-scroll to form when editing
- ✅ Country selection dropdowns
- ✅ Date pickers

## 💾 Data Persistence

### Local Storage (Always Active)
- ✅ Automatic save on every change
- ✅ Loads on app startup
- ✅ Works offline
- ✅ No setup required

### Cloud Sync (Optional)
- ✅ Cross-device synchronization via Supabase
- ✅ Automatic sync on every change
- ✅ Sync status indicator in UI
- ✅ Fallback to localStorage if cloud unavailable
- ✅ Device-based sync (no login required)
- ✅ Free tier support (500MB database)

## 📦 Import/Export
- ✅ Download backup as JSON
- ✅ Import from JSON file
- ✅ Filename includes date
- ✅ Confirmation before import
- ✅ Perfect for migration or archiving

## 🎯 User Experience
- ✅ No "Save" button needed (auto-save)
- ✅ Confirmation dialogs for destructive actions
- ✅ Clear visual feedback
- ✅ Monospace data displays
- ✅ Symbol-based actions (✎ edit, ✕ delete)
- ✅ Emoji section headers
- ✅ Uppercase labels for clarity

## 🚀 Deployment
- ✅ Next.js 14 (App Router)
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Ready for Vercel deployment
- ✅ Environment variable support
- ✅ Production optimized

## 📱 Supported Countries
1. 🇦🇺 Australia (183 days, Calendar Year)
2. 🇳🇿 New Zealand (183 days, Rolling 12mo)
3. 🇺🇸 United States (183 days, Calendar Year)
4. 🇰🇷 South Korea (183 days, Calendar Year)
5. 🇭🇰 Hong Kong (180 days, Calendar Year)
6. 🇮🇹 Italy (183 days, Calendar Year)
7. 🇦🇪 UAE (183 days, Rolling 12mo)
8. 🇲🇨 Monaco (183 days, Calendar Year)
9. 🇬🇧 United Kingdom (183 days, Calendar Year)
10. 🇯🇵 Japan (183 days, Rolling 12mo)
11. ➕ Add your own!

## 🔒 Privacy & Security
- ✅ Data stored locally by default
- ✅ Optional cloud sync
- ✅ No user accounts required
- ✅ Device-based sync (anonymous)
- ✅ Open source

## 📚 Documentation
- ✅ Comprehensive README.md
- ✅ Deployment guide (DEPLOYMENT.md)
- ✅ Supabase setup guide (SUPABASE_SETUP.md)
- ✅ Feature list (this file!)

## 🛠️ Technology Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: IBM Plex Mono (Google Fonts)
- **Icons**: Country Flag Icons library
- **Database**: Supabase (optional)
- **Deployment**: Vercel
- **Storage**: localStorage + PostgreSQL

## 🎉 What Makes It Special
- 🎨 **Beautiful Design** - Not your typical tax calculator
- 📅 **Visual Calendar** - See your travels at a glance
- 🌍 **Flexible** - Add any country with custom rules
- 💾 **Reliable** - Multiple backup options
- 🚀 **Fast** - Instant saves, no loading screens
- 📱 **Responsive** - Works everywhere
- 🆓 **Free** - No subscriptions, no paywalls
- 🔓 **Open Source** - Customize as you wish

---

**Created with** ❤️ **by Romeo Dean**
**Repository**: [github.com/romeodean/travel-tax-calculator](https://github.com/romeodean/travel-tax-calculator)
