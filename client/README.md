# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# PocketLedger - Expense Tracker

A modern, responsive expense tracking application built with React, TypeScript, and Tailwind CSS.

## Features

- 📱 **Mobile-First Design** - Optimized for mobile devices with responsive UI
- 🔐 **Authentication** - Phone number-based login with OTP verification
- 📊 **Dashboard** - Visual expense summary with category breakdowns
- ➕ **Add Expenses** - Easy expense entry with photo upload support
- 🏷️ **Category Management** - Create, edit, and delete expense categories
- 🎨 **Modern UI** - Clean, intuitive interface with smooth animations
- 📱 **Progressive Web App** - Works offline and can be installed on devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: Formik + Yup validation
- **HTTP Client**: Axios
- **Icons**: React Icons

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   └── layout/          # Layout components (Navigation, etc.)
├── pages/               # Page components
│   ├── Onboarding.tsx
│   ├── Login.tsx
│   ├── VerifyOTP.tsx
│   ├── Dashboard.tsx
│   ├── AddExpense.tsx
│   └── ManageCategories.tsx
├── services/            # API service layer
│   ├── apiService.ts    # Base HTTP client
│   ├── authService.ts   # Authentication API
│   ├── expenseService.ts # Expense management API
│   └── categoryService.ts # Category management API
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
└── context/             # React context providers
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your API configuration:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_NAME=PocketLedger
   VITE_APP_VERSION=1.0.0
   VITE_DEV_MODE=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## API Endpoints

The application expects the following API endpoints:

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and authenticate user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get paginated expenses list
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary` - Get expense summary for dashboard

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### 1. Onboarding Screen
- Welcome screen with app illustration
- "Get Started" button to begin user journey

### 2. Authentication Flow
- **Login**: Phone number input with country code (+91)
- **OTP Verification**: 4-digit OTP input with auto-focus and validation
- **Session Management**: Token-based authentication with automatic logout

### 3. Dashboard
- **Monthly Summary**: Total expenses for current month
- **Category Breakdown**: Visual representation of spending by category
- **Recent Transactions**: List of recent expenses with category icons
- **Quick Actions**: Navigate to add expense or manage categories

### 4. Add Expense
- **Form Validation**: Real-time validation using Formik + Yup
- **Category Selection**: Dropdown with available categories
- **Photo Upload**: Optional photo attachment for expenses
- **Date Selection**: Date picker with default to today

### 5. Category Management
- **CRUD Operations**: Create, edit, and delete categories
- **Color Selection**: Choose from predefined color palette
- **Visual Indicators**: Color-coded category display
- **Confirmation Dialogs**: Safe deletion with user confirmation

## Design Features

### Mobile-First Approach
- Responsive design optimized for mobile devices
- Touch-friendly interface elements
- Smooth animations and transitions
- Optimized for small screens

### Visual Design
- Clean, modern interface
- Consistent color scheme
- Intuitive navigation
- Loading states and error handling

### User Experience
- Auto-focus on form inputs
- Auto-submit OTP when complete
- Real-time form validation
- Smooth page transitions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
