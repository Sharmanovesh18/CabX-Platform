# Authentication Debugging Guide

## The Problem
When you register with credentials (email + password), then try to login with the same credentials, you get "Invalid email or password" error.

## Root Causes (In Order of Likelihood)

### 1. **Registration is not actually saving the user**
   - The registration response looks successful, but the user is NOT in the database
   - **Check:** After registration, verify the user exists in MongoDB

### 2. **MongoDB Connection Issue**
   - Database connection failed or times out
   - Registration appears successful but data isn't saved

### 3. **Password Hashing Issue**
   - Password is hashed during registration but something went wrong
   - bcrypt comparison fails even though password is correct

### 4. **Collection Mismatch**
   - Registration saves to `UsersData` collection
   - Login looks in wrong collection

---

## Step-by-Step Debugging

### **Step 1: Start Backend with Detailed Logs**

```powershell
cd backend
npm run dev
```

Keep this terminal open and watch for logs.

### **Step 2: Clear Old Test Data (IMPORTANT)**

```powershell
# Delete the old database so you start fresh
# Open MongoDB directly (using mongosh or MongoDB Compass)
# Or run this command from another terminal:

# If using mongosh:
mongosh --eval "use cab_booking; db.usersdatas.deleteMany({}); db.bookings.deleteMany({});"
```

### **Step 3: Register a New User (Watch Console Logs)**

In your browser (http://localhost:5173):
1. Click login button
2. Switch to "Register" tab
3. Fill in:
   - **Full Name:** `testuser123`
   - **Phone:** `9999888888`
   - **Email:** `testuser123@example.com`
   - **Password:** `password123`
4. Click "Sign Up"

**Watch the backend console for these logs:**
```
📝 REGISTRATION ATTEMPT: { name: 'testuser123', email: 'testuser123@example.com', phone: '9999888888', passwordLength: 11 }
🔐 Password hashed, hash length: 60
✅ User registered and saved to DB: { id: '...', email: 'testuser123@example.com', name: 'testuser123' }
```

**If you DON'T see these logs**, registration is failing silently. Check browser console for errors.

### **Step 4: Verify User Was Saved to Database**

Open a new browser tab and go to:
```
http://localhost:5000/api/debug/check-email/testuser123@example.com
```

**You should see:**
```json
{
  "ok": true,
  "message": "Email found",
  "user": {
    "id": "...",
    "name": "testuser123",
    "email": "testuser123@example.com"
  }
}
```

**If you see `"ok": false, "message": "Email not found"`:**
- ❌ Registration did NOT save the user
- Go back to Step 3 and check the backend logs

### **Step 5: Attempt Login**

In your browser:
1. Go back to auth modal
2. Switch to "Login" tab
3. Enter:
   - **Email:** `testuser123@example.com`
   - **Password:** `password123`
4. Click "Sign In"

**Watch backend console for these logs:**
```
🔐 LOGIN ATTEMPT: { email: 'testuser123@example.com', passwordLength: 11 }
🔍 Searching for user in Users collection...
✅ Found user in Users collection: { id: '...', email: 'testuser123@example.com', name: 'testuser123' }
🔐 Comparing password... stored hash length: 60
Password match result: true
✅ Login successful for user: testuser123@example.com
```

---

## Common Issues & Fixes

### ❌ **Issue 1: "Email not found" in step 4**

**Cause:** User was not saved during registration

**Solution:**
1. Check MongoDB is running (`mongosh` should connect)
2. Check `.env` file has correct `MONGODB_URI`
3. Verify the connection string is: `mongodb://127.0.0.1:27017/cab_booking`

```powershell
# Verify MongoDB is running:
mongosh --eval "db.version()"
```

**If MongoDB not running:**
```powershell
# Start MongoDB (Windows)
# Option 1: If installed as service
net start MongoDB

# Option 2: If MongoDB is installed but not as service
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

### ❌ **Issue 2: "Password match result: false"**

**Cause:** Password doesn't match what was stored

**Solution:**
1. Make sure you're using EXACTLY the same password (no spaces!)
2. Try registering again with a simpler password like `123456`
3. Check if there are trailing/leading spaces in your input

### ❌ **Issue 3: Backend crashes on registration**

**Cause:** Schema validation error or database error

**Solution:**
1. Check all required fields are filled: name, email, phone, password
2. Make sure email is valid format
3. Check backend console for the exact error message

### ❌ **Issue 4: "User already exists" error**

**Cause:** You already registered with that email

**Solution:**
1. Use a different email: `testuser456@example.com`
2. Or delete the user from database and try again:
```powershell
mongosh
use cab_booking
db.usersdatas.deleteOne({email: "testuser123@example.com"})
exit
```

---

## Data Flow Diagram

```
REGISTRATION:
┌─────────────────────────────────────┐
│ Frontend AuthModal                  │
│ - name, email, phone, password      │
└────────────┬────────────────────────┘
             │ POST /api/auth/register
             ▼
┌─────────────────────────────────────┐
│ Backend Register Endpoint           │
│ 1. Validate all fields exist        │
│ 2. Check if email exists (findOne)  │
│ 3. Hash password with bcrypt        │
│ 4. Save user to Users collection    │
│ 5. Generate JWT token              │
│ 6. Return user + token             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ MongoDB (UsersData collection)      │
│ {                                   │
│   _id: ObjectId,                    │
│   name: "testuser123",              │
│   email: "testuser123@example.com", │
│   phone: "9999888888",              │
│   password: "$2a$10$HASH...",       │
│   app_role: "Passenger"             │
│ }                                   │
└─────────────────────────────────────┘


LOGIN:
┌─────────────────────────────────────┐
│ Frontend AuthModal                  │
│ - email, password                   │
└────────────┬────────────────────────┘
             │ POST /api/auth/login
             ▼
┌─────────────────────────────────────┐
│ Backend Login Endpoint              │
│ 1. Receive email + password         │
│ 2. Find user by email (findOne)     │
│ 3. Compare password with hash       │
│    (bcrypt.compare)                 │
│ 4. Generate JWT token              │
│ 5. Return user + token             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ MongoDB Query                       │
│ db.usersdatas.findOne({             │
│   email: "testuser123@example.com"  │
│ })                                  │
└─────────────────────────────────────┘
```

---

## Checklist Before Contacting Support

- [ ] MongoDB is running (`mongosh` connects successfully)
- [ ] Backend server started with `npm run dev`
- [ ] Frontend server running on port 5173
- [ ] You've registered and seen ✅ logs
- [ ] Email check endpoint (Step 4) shows user exists
- [ ] You're using EXACT same email and password for login
- [ ] No spaces or typos in email/password

---

## Useful Commands

```powershell
# Check MongoDB connection
mongosh --eval "db.version()"

# Start MongoDB
net start MongoDB

# Check backend logs in real-time (keep terminal open)
cd backend
npm run dev

# Manually check if user exists
mongosh --eval "use cab_booking; db.usersdatas.find({email: 'testuser123@example.com'})"

# Clear test users
mongosh --eval "use cab_booking; db.usersdatas.deleteMany({email: /testuser/})"
```

---

## Next Steps

Run through the debugging steps above and share:
1. The exact backend console logs during registration
2. The response from the email check endpoint (Step 4)
3. The exact backend console logs during login
4. Any error messages you see

This will help identify exactly where the issue is!
