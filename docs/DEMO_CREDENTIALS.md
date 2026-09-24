# MANDI MITHRA — Demo Credentials & Role Access

---

### Development Mode OTP
For all phone-based logins when `NODE_ENV=development`:
```
OTP: 123456
```

---

### Pre-Configured Demo Accounts

| Role | Name | Phone / Email | Password | Primary Dashboard Route |
|---|---|---|---|---|
| **Super Admin** | Platform Administrator | `admin@agritrade.gov.in` / `9999999999` | `Admin@123456` | `/admin` |
| **District Officer** | District Agri Commissioner | `district@agritrade.gov.in` / `9888888888` | `Officer@123456` | `/district` |
| **Centre Manager** | Hyderabad Mandi Manager | `manager@agritrade.gov.in` / `9777777777` | `Manager@123456` | `/manager` |
| **Quality Inspector** | Lead Quality Inspector | `inspector@agritrade.gov.in` / `9666666666` | `Inspector@123456` | `/officer/inspect` |
| **B2B Buyer** | Reliance Agri Sourcing | `buyer@agritrade.gov.in` / `9555555555` | `Buyer@123456` | `/buyer` |
| **Logistics Coordinator** | National Fleet Dispatch | `logistics@agritrade.gov.in` / `9444444444` | `Logistics@123456` | `/logistics` |
| **Farmer (Demo 1)** | Ramesh Kumar | `9111111111` | OTP (`123456`) | `/farmer` |
| **Farmer (Demo 2)** | Suresh Patel | `9222222222` | OTP (`123456`) | `/farmer` |

---

### How to Seed Demo Data
To populate the database with complete initial demo crops, centres, warehouses, lots, and buyers:
```bash
cd backend
npm run seed
```
