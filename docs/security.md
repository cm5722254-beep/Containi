# សុវត្ថិភាព Container និងប្រព័ន្ធ (Container Security)

មុខវិជ្ជា៖ **[CTN] Containers**

ឯកសារនេះបង្ហាញពីវិធានការសុវត្ថិភាព (Security Hardening) ទាំង ៨ ចំណុច ដែលត្រូវបានអនុវត្តក្នុងគម្រោងនេះ។

---

## ១. ការដំណើរការ Container ដោយ Non-Root User (Least Privilege)
- តាមលំនាំដើម Docker ដំណើរការ Process ជា `root` (UID 0) នៅក្នុង Container។ ប្រសិនបើ Hacker អាចទម្លុះកម្មវិធីបាន (Container Escape) ពួកគេអាចគ្រប់គ្រងម៉ាស៊ីន Host បាន។
- **ដំណោះស្រាយក្នុងគម្រោងនេះ**៖
  - នៅក្នុង `backend/Dockerfile`:
    ```dockerfile
    USER node
    ```
  - នៅក្នុង `frontend/Dockerfile`:
    ```dockerfile
    RUN addgroup --system --gid 1001 nodejs
    RUN adduser --system --uid 1001 nextjs
    USER nextjs
    ```
  - Process ទាំងអស់ដំណើរការដោយគណនីមានសិទ្ធិកម្រិតទាប (Unprivileged Users)។

---

## ២. ការប្រើប្រាស់ Minimal Base Images (Alpine Linux)
- យើងប្រើប្រាស់ `node:20-alpine`, `nginx:1.25-alpine`, `postgres:16-alpine`, និង `redis:7-alpine`។
- **អត្ថប្រយោជន៍**៖
  - Base Image មានទំហំត្រឹមតែ 5MB ទៅ 40MB។
  - គ្មានដំឡើងកញ្ចប់ដែលមិនចាំបាច់ដូចជា Shell Utilities ធ្ងន់ៗ ឬ Package Manager ធំៗ ដែលជួយកាត់បន្ថយផ្ទៃវាយប្រហារ (Reduced Attack Surface) និងកាត់បន្ថយ CVE Vulnerabilities។

---

## ៣. ការលាក់បាំង Port និងច្រកចូលតែមួយ (Port Isolation via Nginx)
- **គ្មានសេវាកម្មខាងក្នុងណាមួយត្រូវបាន Publish ទៅកាន់ Host ឡើយ**៖
  - Database (`5432`): បិទជិត
  - Redis (`6379`): បិទជិត
  - Backend API (`5000`): បិទជិត
  - Frontend (`3000`): បិទជិត
- មានតែ **Nginx (Port 80)** តែមួយគត់ដែលបើកទទួល Request។ Hacker មិនអាច Scan រក Port Database ពីក្រៅម៉ាស៊ីនបានឡើយ។

---

## ៤. ការគ្រប់គ្រង Environment Variables និងការពារ Secrets
- គ្មាន Password ឬ Secret Key ណាមួយត្រូវបាន Hardcode នៅក្នុង Dockerfile ឬ Source Code ឡើយ។
- រាល់ Configuration ទាំងអស់ត្រូវបានផ្ទុកក្នុង `.env` និង `.env.example`។
- ឯកសារ `.env` ត្រូវបានរារាំងមិនឱ្យ Upload ឡើង GitHub តាមរយៈ `.gitignore` និងមិនឱ្យចម្លងចូល Docker Image តាមរយៈ `.dockerignore`។

---

## ៥. ការការពារការវាយប្រហារ Database (SQL Injection Prevention)
- គ្រប់ Controller ទាំងអស់ក្នុង Express Backend ប្រើប្រាស់ **Parameterized Queries** ជាមួយ `pg` library (ឧទាហរណ៍ `$1`, `$2`)៖
  ```typescript
  await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  ```
- គ្មានការតភ្ជាប់ខ្សែអក្សរដោយផ្ទាល់ (No string concatenation) ដែលធានាថាការវាយប្រហារបែប SQL Injection មិនអាចកើតឡើងបានឡើយ។

---

## ៦. ការ Hash ពាក្យសម្ងាត់ (Password Hashing with Bcrypt)
- ពាក្យសម្ងាត់របស់អ្នកប្រើប្រាស់ត្រូវបាន Hash ដោយប្រើ **Bcrypt** ជាមួយ Salt 10 Rounds។
- គ្មានការរក្សាទុក Plaintext Password នៅក្នុង Database ឡើយ។

---

## ៧. ការផ្ទៀងផ្ទាត់សិទ្ធិតាមរយៈ Stateless JWT Tokens
- ការផ្ទៀងផ្ទាត់អ្នកប្រើប្រាស់ និង Admin ត្រូវបានការពារដោយ **JSON Web Tokens (JWT)** ជាមួយ Secret Key ក្នុង Environment Variable។
- API ទាំងអស់ត្រូវបានការពារដោយ `authenticate` និង `requireAdmin` Middleware។

---

## ៨. HTTP Security Headers តាមរយៈ Nginx
នៅក្នុង `nginx.conf` យើងបានបន្ថែម Security Headers ស្តង់ដារ៖
- `X-Frame-Options: SAMEORIGIN`: ការពារការវាយប្រហារ Clickjacking
- `X-Content-Type-Options: nosniff`: ការពារ MIME-type sniffing
- `X-XSS-Protection: 1; mode=block`: ទប់ស្កាត់ Cross-Site Scripting (XSS)
