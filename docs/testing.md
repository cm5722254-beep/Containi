# ផែនការធ្វើតេស្ត និងការពិសោធន៍ Container Failure (Testing & Failure Simulation)

មុខវិជ្ជា៖ **[CTN] Containers**

ឯកសារនេះរៀបរាប់អំពីរបៀបធ្វើតេស្តប្រព័ន្ធ និងការធ្វើពិសោធន៍ជាក់ស្តែងអំពី **Container Failure & Isolation** សម្រាប់បង្ហាញជូនសាស្ត្រាចារ្យ។

---

## ១. តារាងត្រួតពិនិត្យការធ្វើតេស្ត (Testing Checklist)

| ល.រ | មុខងារដែលត្រូវតេស្ត | ពាក្យបញ្ជា / របៀបតេស្ត | លទ្ធផលរំពឹងទុក | ស្ថានភាព |
|---|---|---|---|---|
| ១ | Build Images ទាំង ៥ | `docker compose build` | Build ជោគជ័យ គ្មាន Error | ✅ PASS |
| ២ | ដំណើរការ Containers | `docker compose up -d` | Containers ទាំង ៥ Up & Healthy | ✅ PASS |
| ៣ | បណ្តាញ Docker Network | `docker network inspect app-network` | ឃើញ 5 Containers ភ្ជាប់គ្នា | ✅ PASS |
| ៤ | ចូលមើល Web UI | Browser ចូល `http://localhost` | ឃើញទំព័រ E-Commerce Next.js | ✅ PASS |
| ៥ | Reverse Proxy Routing | ចូល `http://localhost/api/health` | ទទួល JSON Health ពី Backend | ✅ PASS |
| ៦ | PostgreSQL Connectivity | ពិនិត្យ Response របស់ `/api/health` | `postgresql.status: "connected"` | ✅ PASS |
| ៧ | Redis In-Memory Cache | Request ផលិតផល ២ ដង | លើកទី ២ ឃើញ `X-Cache: HIT-REDIS` | ✅ PASS |
| ៨ | ការចុះឈ្មោះ និង Login | ចូល `/login` និងចុះឈ្មោះគណនីថ្មី | បង្កើត User និងបញ្ជូន JWT Token | ✅ PASS |
| ៩ | ការ Checkout ទំនិញ | ដាក់ទំនិញចូល Cart ហើយចុច Checkout | បង្កើត Order និងកាត់ស្តុកក្នុង DB | ✅ PASS |
| ១០ | Data Persistence | បិទ `docker compose down` រួចបើកវិញ | ទិន្នន័យនៅដដែល មិនបាត់បង់ | ✅ PASS |

---

## ២. ការពិសោធន៍ជាក់ស្តែង៖ Container Failure & Recovery Simulation

> [!IMPORTANT]
> **នេះជាលំហាត់ជាក់ស្តែងដ៏សំខាន់សម្រាប់មុខវិជ្ជា Containers (CTN)** ដើម្បីបង្ហាញពី **Service Isolation** និងភាពធន់ (Resilience) នៃស្ថាបត្យកម្ម Microservices។

### ជំហានទី ១៖ បិទ Backend Container ដោយចេតនា
ដំណើរការពាក្យបញ្ជា៖
```bash
docker stop ctn_backend
```

### ជំហានទី ២៖ សង្កេតមើលលទ្ធផលលើប្រព័ន្ធ
1. **ពិនិត្យមើល Containers ទាំងអស់ (`docker compose ps`)**:
   - `ctn_backend` ធ្លាក់ក្នុងស្ថានភាព `Exited`។
   - ប៉ុន្តែ `ctn_nginx`, `ctn_frontend`, `ctn_postgres`, និង `ctn_redis` **នៅតែបន្តដំណើរការធម្មតា មិនគាំងតាមឡើយ!**
   - នេះជាភស្តុតាងនៃ **Process & Service Isolation**។
2. **ពិនិត្យមើល Web Browser (`http://localhost`)**:
   - ទំព័រ Frontend Next.js នៅតែបង្ហាញរូបរាងធម្មតា។
   - ប៉ុន្តែនៅពេលចូលទាញទិន្នន័យ Nginx នឹងឆ្លើយតប `502 Bad Gateway` ដោយសារ Backend បានបិទ។
3. **ពិនិត្យមើល Database Container**:
   - PostgreSQL នៅតែរង់ចាំដំណើរការធម្មតា គ្មានការខូចខាតទិន្នន័យឡើយ។

### ជំហានទី ៣៖ បើកដំណើរការ Backend ឡើងវិញ (System Recovery)
ដំណើរការពាក្យបញ្ជា៖
```bash
docker start ctn_backend
```
- រង់ចាំប្រហែល ៣ ទៅ ៥ វិនាទី។
- Backend Container នឹងភ្ជាប់ទៅកាន់ PostgreSQL និង Redis ដោយស្វ័យប្រវត្តិតាមរយៈ Docker Network DNS។
- Refresh Web Browser: ប្រព័ន្ធទាំងមូលដំណើរការឡើងវិញជាប្រក្រតី 100%!

---

## ៣. ពាក្យបញ្ជា Curl សម្រាប់ធ្វើតេស្ត API តាម Terminal

### ក. ពិនិត្យសុខភាពប្រព័ន្ធ (Health Check):
```bash
curl -i http://localhost/api/health
```

### ខ. ទាញយកបញ្ជីផលិតផល (Product Catalog):
```bash
curl -i http://localhost/api/products
```

### គ. ចូលប្រើប្រាស់ជា Admin (Admin Login):
```bash
curl -i -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.ctn","password":"admin123"}'
```
