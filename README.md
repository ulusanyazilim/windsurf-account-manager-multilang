# Windsurf Account Manager - Simple

A desktop application for managing multiple Windsurf accounts, built with Tauri + Vue 3 + TypeScript. Features include credit reset, billing queries, one-click account switching, and more.

> ⚠️ **Free Software Notice**: This software is completely free. If you paid for it, you've been scammed!

## 📱 Community Groups

<p align="center">
  <img src="public/交流群.png" alt="WeChat Group QR Code" width="300">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="public/QQ群.jpg" alt="QQ Group QR Code" width="300">
</p>

---

## 🖥️ Application Interface

<p align="center">
  <img src="public/主页.png" alt="Application Home" width="800">
</p>

---

## ✨ Features

### 🔐 Account Management
- ✅ **Add/Edit/Delete Accounts** - Complete account CRUD operations
- ✅ **Account Grouping** - Support custom groups for easy management
- ✅ **Tag System** - Add custom tags to accounts
- ✅ **Real-time Account Status** - Display plan type, credit balance, expiration date, etc.
- ✅ **Batch Account Operations** - Batch select, reset, and delete
- ✅ **Encrypted Password/Token Storage** - AES-256-GCM encryption with keys stored in system keychain

### 💳 Credit Reset
- ✅ **One-Click Credit Reset** - Reset credits via seat update API
- ✅ **Smart Seat Rotation** - Automatically rotate between 3/4/5 seats
- ✅ **Batch Reset** - Support multiple accounts simultaneously (up to 5 concurrent)
- ✅ **Team Batch Reset** - One-click reset for all team members
- ✅ **Auto Reset Schedule** - Set scheduled tasks for automatic credit reset

### 👥 Team Management
- ✅ **View Team Members** - List all team member information
- ✅ **Invite Members** - Invite new members via email
- ✅ **Remove Members** - Remove members from team
- ✅ **Team Credit Management** - Unified credit management for team members

### 🔄 One-Click Account Switching
- ✅ **Quick Account Switch** - Quickly switch to other Windsurf accounts
- ✅ **Auto Token Refresh** - Automatically refresh access tokens using refresh_token
- ✅ **OAuth Callback Trigger** - Auto-complete login via windsurf:// protocol
- ✅ **Machine ID Reset** - Reset device identifier for multi-device use (requires admin rights)

### 🔧 Seamless Account Switching Patch
- ✅ **Auto Detect Windsurf Path** - Automatically find Windsurf installation
- ✅ **One-Click Patch Apply** - Modify extension.js for seamless switching
- ✅ **Remove Timeout Limit** - Remove 180-second OAuth timeout limit
- ✅ **Auto Backup** - Automatically backup original files before patching (keep up to 3 backups)
- ✅ **One-Click Restore** - Restore from backup files
- ✅ **Auto Restart Windsurf** - Automatically restart after patch application

### 💰 Payment Related
- ✅ **Virtual Card Generation** - Generate virtual credit card info for payment testing
- ✅ **Custom Card BIN** - Support custom BIN numbers or ranges
- ✅ **Private Payment Window** - Independent private browser window for Stripe payment
- ✅ **Alipay/WeChat Payment** - Support domestic payment methods (donations)

### 📊 Data Query
- ✅ **Billing Information Query** - Query plan, quota, usage, etc.
- ✅ **Subscription Status View** - Display subscription type, expiration date, next billing date
- ✅ **Usage Statistics** - View credit usage and remaining quota
- ✅ **Global Refresh** - One-click refresh button to update all account information

### ⚙️ System Settings
- ✅ **Proxy Configuration** - Support HTTP proxy settings
- ✅ **Lightweight API Mode** - Use GetPlanStatus instead of GetCurrentUser to reduce requests
- ✅ **Detailed Result Display** - Optional display of detailed API response information
- ✅ **Operation Logs** - Record all operation history with export support

### 🔒 Data Security
- ✅ **System Keychain** - Use Windows Credential Manager to store encryption keys
- ✅ **AES-256-GCM Encryption** - All sensitive information encrypted
- ✅ **Local Storage** - Data stored locally only, no server uploads
- ✅ **Operation Logs** - Complete operation records for audit purposes

## Technology Stack

### Frontend
- **Framework**: Vue 3 + TypeScript
- **UI Components**: Element Plus
- **State Management**: Pinia
- **Build Tool**: Vite
- **Styling**: CSS3 + Element Plus Theme

### Backend
- **Framework**: Tauri 2.x
- **Language**: Rust
- **Encryption**: AES-256-GCM
- **Key Management**: Windows Credential Manager / Keyring
- **HTTP Client**: Reqwest
- **Async Runtime**: Tokio

## Installation and Running

### Prerequisites
- Node.js 16+
- Rust 1.70+
- Windows 10/11 (currently Windows only)

### Development Environment

```bash
# Clone the project
git clone [project-url]
cd windsurf-account-manager

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Build Release Version

```bash
# Build Windows installer
npm run tauri build
```

After building, the installer is located at `src-tauri/target/release/bundle/`

## Usage Guide

### 1. First Time Use

1. After starting the application, click "Add Account" button
2. Enter Windsurf account information:
   - Email: Your Windsurf account email
   - Password: Account password
   - Nickname: Name for easy identification
   - Group (optional): Account group
   - Tags (optional): Custom tags
3. Click OK to save the account

### 2. Credit Reset

1. Click "Reset Credits" button on the account card
2. The application will automatically:
   - Login and get Token (if needed)
   - Execute one seat update (auto-rotate between 3/4/5)
   - Complete credit reset upon successful seat update
3. Operation results will be shown via notifications
4. Enable "Show Detailed Results" in settings to view seat update details

### 3. Batch Operations

1. Check multiple account cards
2. Click "Batch Reset Credits" or "Batch Delete" button at the top
3. Confirm the operation to execute in batch

### 4. Account Grouping

1. Click "Groups" menu in the sidebar
2. Select existing group or add new group
3. Select group when adding/editing accounts

### 5. View Logs

1. Click "Operation Logs" in the sidebar
2. View all operation records
3. Can clear or export logs

## Data Storage

Application data is stored locally:
- **Windows**: `%APPDATA%\com.chao.windsurf-account-manager\accounts.json`

Data structure includes:
- Account information (encrypted passwords and tokens)
- Group list
- System settings
- Operation logs

## Security Notice

1. **Password Security**: All passwords encrypted with AES-256-GCM
2. **Key Management**: Encryption keys stored in system keychain
3. **Token Refresh**: Tokens automatically refreshed 5 minutes before expiration
4. **Local Storage**: All data stored locally only, never uploaded to any server

## Important Notes

1. Keep your account information safe
2. Regularly backup the `accounts.json` file
3. Be aware of API rate limits during batch operations
4. Recommended to use grouping feature for managing multiple accounts

## Development Guide

### Project Structure

```
windsurf-account-manager/
├── src/                    # Vue frontend source code
│   ├── views/             # Page components
│   ├── components/        # Reusable components
│   ├── store/            # Pinia state management
│   ├── api/              # API wrapper
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── src-tauri/            # Rust backend source code
│   ├── src/
│   │   ├── models/       # Data models
│   │   ├── repository/   # Data access layer
│   │   ├── services/     # Business logic layer
│   │   ├── commands/     # Tauri command layer
│   │   └── utils/        # Utility functions
│   └── Cargo.toml        # Rust dependencies
├── package.json          # Node dependencies
└── vite.config.ts        # Vite configuration
```

### API Integration

The application integrates the following Windsurf APIs:
- Firebase Authentication API
- Seat Management API (UpdateSeats)
- Billing Query API (GetTeamBilling)
- Plan Update API (UpdatePlan)

#### UpdateSeats API Response Data

The parsed JSON response from seat update API contains:
- `success`: Whether operation succeeded
- `total_seats`: Total seats (corresponds to int_4 field)
- `used_seats`: Used seats (corresponds to int_5 field)
- `seat_usage`: Seat usage info (e.g., "1 / 5")
- `seat_usage_percentage`: Seat usage percentage (calculated)
- `price_per_seat`: Monthly price per seat (corresponds to float_3 field, in USD)
- `total_monthly_price`: Total monthly price (corresponds to float_6 field, in USD)
- `billing_start_time`: Current billing period start time (corresponds to subMesssage_7.int_1 timestamp)
- `next_billing_time`: Next billing time (corresponds to subMesssage_8.int_1 timestamp)
- `billing_start_timestamp`: Billing start Unix timestamp
- `next_billing_timestamp`: Next billing Unix timestamp

**Protobuf Field Mapping**:
- `float_3`: Monthly price per seat (e.g., 60 = $60/month/seat)
- `int_4`: Total seats (e.g., 5)
- `int_5`: Used seats (e.g., 1)
- `float_6`: Total monthly price (e.g., 300 = $300/month)
- `subMesssage_7.int_1`: Current billing period start timestamp
- `subMesssage_8.int_1`: Next billing timestamp

#### GetTeamBilling API Response Data

The parsed JSON response from billing query API contains:
- `plan_name`: Plan name
- `base_quota`: Plan base quota (corresponds to int_8 field)
- `extra_credits`: Extra credits (corresponds to int_4 field, optional)
- `total_quota`: Total quota (base_quota + extra_credits)
- `used_quota`: Used quota (corresponds to int_6 field, optional, default 0)
- `cache_limit`: Cache limit (corresponds to int_9 field)
- `payment_method`: Payment method information
- `next_billing_date`: Next billing date
- `invoice_url`: Invoice link
- `monthly_price`: Monthly price

**Protobuf Field Mapping**:
- `int_4`: Extra credits (bonus or purchased credits, may not exist)
- `int_6`: Used credits (used quota, may not exist)
- `int_8`: Plan quota (base plan quota)
- `int_9`: Plan cache limit (usage beyond this limit will be blocked)

**Note**: When cache usage reaches the cache limit, you cannot continue using even if total quota remains.

## FAQ

### Q: Why does credit reset fail?
A: Please check:
1. Is the account password correct?
2. Is the network connection normal?
3. Is the token expired? (Try logging in again)

### Q: How to backup account data?
A: Copy `%APPDATA%\com.chao.windsurf-account-manager\accounts.json` to a safe location

### Q: What if I forgot my account password?
A: Passwords stored in the application are encrypted and cannot be viewed in plaintext. You need to add the account again.

## Contributing Guide

Issues and Pull Requests are welcome!

## License

AGPL-3.0

## Disclaimer

This tool is for learning and personal use only. Please comply with Windsurf Terms of Service. The author is not responsible for any issues arising from the use of this tool.

## 🌍 Localization & Credits / Yerelleştirme ve Teşekkür / 本地化与致谢

### English
This multi-language version (English, Turkish, Default Chinese) was developed by **@ulusanyazilim**. 
We would like to extend our sincere thanks to the original creators of this repository.

For support, help, or inquiries, you can reach us at:
- 📧 `teknosenator@gmail.com`
- 📧 `ulusanyazilim@gmail.com`

🔗 **Repository:** [https://github.com/ulusanyazilim/windsurf-account-manager-multilang](https://github.com/ulusanyazilim/windsurf-account-manager-multilang)

---

### Türkçe
Bu çok dilli versiyon (İngilizce, Türkçe, Varsayılan Çince) **@ulusanyazilim** tarafından geliştirilmiştir.
Orijinal depo sahiplerine emekleri için teşekkür ederiz.

Destek, yardım veya sorularınız için bize şu adreslerden ulaşabilirsiniz:
- 📧 `teknosenator@gmail.com`
- 📧 `ulusanyazilim@gmail.com`

🔗 **Repo:** [https://github.com/ulusanyazilim/windsurf-account-manager-multilang](https://github.com/ulusanyazilim/windsurf-account-manager-multilang)

---

### 简体中文
此多语言版本（英语、土耳其语、默认中文）由 **@ulusanyazilim** 开发。
我们要向本仓库的原作者致以诚挚的谢意。

如需支持、帮助或咨询，请通过以下方式联系我们：
- 📧 `teknosenator@gmail.com`
- 📧 `ulusanyazilim@gmail.com`

🔗 **仓库地址:** [https://github.com/ulusanyazilim/windsurf-account-manager-multilang](https://github.com/ulusanyazilim/windsurf-account-manager-multilang)
