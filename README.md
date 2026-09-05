# គម្រោងសាកលវិទ្យាល័យ៖ ប្រព័ន្ធគ្រប់គ្រងពាណិជ្ជកម្មអេឡិចត្រូនិកដោយប្រើប្រាស់ Containers
# University Project: Containerized E-Commerce Management System Using Docker

> **មុខវិជ្ជា (Subject):** [CTN] Containers  
> **ជំនាញ (Major):** វិទ្យាសាស្ត្រកុំព្យូទ័រ និងវិស្វកម្ម Cloud/DevOps (Computer Science, Cloud & DevOps)  
> **ប្រធានបទគម្រោង (Project Title):** Containerized E-Commerce Management System Using Docker  
> **បច្ចេកវិទ្យាស្នូល (Core Tech):** Docker, Docker Compose, Nginx, Next.js, Express.js, TypeScript, PostgreSQL, Redis  

---

## តារាងមាតិកា (Table of Contents)
1. [សេចក្តីផ្តើមនៃគម្រោង (Project Introduction)](#១-សេចក្តីផ្តើមនៃគម្រោង-project-introduction)
2. [បញ្ហាដែលត្រូវដោះស្រាយ (Problem Statement)](#២-បញ្ហាដែលត្រូវដោះស្រាយ-problem-statement)
3. [គោលបំណងនៃគម្រោង (Project Objectives)](#៣-គោលបំណងនៃគម្រោង-project-objectives)
4. [មុខងារចម្បងរបស់ប្រព័ន្ធ (System Features)](#៤-មុខងារចម្បងរបស់ប្រព័ន្ធ-system-features)
5. [ដ្យាក្រាមស្ថាបត្យកម្មប្រព័ន្ធ (Architecture Diagram)](#៥-ដ្យាក្រាមស្ថាបត្យកម្មប្រព័ន្ធ-architecture-diagram)
6. [ស្ថាបត្យកម្ម Containers ទាំង ៥ (Container Architecture)](#៦-ស្ថាបត្យកម្ម-containers-ទាំង-៥-container-architecture)
7. [ស្ថាបត្យកម្មបច្ចេកវិទ្យា Docker (Docker Architecture)](#៧-ស្ថាបត្យកម្មបច្ចេកវិទ្យា-docker-docker-architecture)
8. [បច្ចេកវិទ្យាដែលបានប្រើប្រាស់ (Technology Stack)](#៨-បច្ចេកវិទ្យាដែលបានប្រើប្រាស់-technology-stack)
9. [ការពន្យល់អំពី Dockerfiles និង Multi-Stage Builds](#៩-ការពន្យល់អំពី-dockerfiles-និង-multi-stage-builds)
10. [ការពន្យល់អំពី Docker Compose (`docker-compose.yml`)](#១០-ការពន្យល់អំពី-docker-compose-docker-composeyml)
11. [ការពន្យល់អំពី Docker Network និង Embedded DNS](#១១-ការពន្យល់អំពី-docker-network-និង-embedded-dns)
12. [ការពន្យល់អំពី Docker Volumes និង Data Persistence](#១២-ការពន្យល់អំពី-docker-volumes-និង-data-persistence)
13. [ការកំណត់ Environment Variables](#១៣-ការកំណត់-environment-variables)
14. [ការដំឡើង និងដំណើរការគម្រោង (Installation & Running)](#១៤-ការដំឡើង-និងដំណើរការគម្រោង-installation--running)
15. [ការពន្យល់ពាក្យបញ្ជា Docker សំខាន់ៗ (Docker Commands)](#១៥-ការពន្យល់ពាក្យបញ្ជា-docker-សំខាន់ៗ-docker-commands)
16. [មគ្គុទ្ទេសក៍បង្ហាញគ្រូ ១៥ ជំហាន (CTN Classroom Demo Guide)](#១៦-មគ្គុទ្ទេសក៍បង្ហាញគ្រូ-១៥-ជំហាន-ctn-classroom-demo-guide)
17. [ការធ្វើតេស្តពេល Container គាំង (Container Failure Simulation)](#១៧-ការធ្វើតេស្តពេល-container-គាំង-container-failure-simulation)
18. [ដំណោះស្រាយបញ្ហាទូទៅ (Troubleshooting)](#១៨-ដំណោះស្រាយបញ្ហាទូទៅ-troubleshooting)
19. [ការដាក់ឱ្យដំណើរការលើ Production (Deployment)](#១៩-ការដាក់ឱ្យដំណើរការលើ-production-deployment)
20. [សេចក្តីសន្និដ្ឋាន និងការអភិវឌ្ឍទៅមុខ (Conclusion & Future Improvements)](#២០-សេចក្តីសន្និដ្ឋាន-និងការអភិវឌ្ឍទៅមុខ-conclusion--future-improvements)

---

## ១. សេចក្តីផ្តើមនៃគម្រោង (Project Introduction)
គម្រោងនេះត្រូវបានបង្កើតឡើងសម្រាប់មុខវិជ្ជា **[CTN] Containers** នៅសាកលវិទ្យាល័យ។ នេះមិនមែនគ្រាន់តែជាគេហទំព័រ E-Commerce ធម្មតានោះទេ ប៉ុន្តែជាការអនុវត្តជាក់ស្តែងនូវបច្ចេកវិទ្យា **Containerization** ពេញលេញមួយ។ ប្រព័ន្ធទាំងមូលត្រូវបានបំបែកជា ៥ សេវាកម្មឯករាជ្យពីគ្នា (Microservices) ដែលរត់លើ Docker Containers និងភ្ជាប់គ្នាដោយ **Docker Custom Network** និងប្រើ **Docker Named Volumes** សម្រាប់រក្សាទុកទិន្នន័យអចិន្ត្រៃយ៍។

---

## ២. បញ្ហាដែលត្រូវដោះស្រាយ (Problem Statement)
- **បញ្ហា "It works on my machine"**: កម្មវិធីពិបាក Deploy នៅពេលបរិស្ថាន Host ខុសគ្នា។
- **ការខ្វះ Service Isolation**: បើ Service មួយគាំង នាំឱ្យគាំងទាំងមូល។
- **Port Collisions**: ការជាន់គ្នានៃ Port ពេលដំឡើងសេវាកម្មច្រើនលើ OS តែមួយ។
- **ទំហំ Image ធំពេក**: ការប្រើ Dockerfile ធម្មតាធ្វើឱ្យ Image ឡើងដល់រាប់ជីហ្គាបៃ (GB) ពិបាកទាញយក និងមិនមានសុវត្ថិភាព។

---

## ៣. គោលបំណងនៃគម្រោង (Project Objectives)
- វេចខ្ចប់សេវាកម្មនីមួយៗឱ្យដំណើរការលើ Container ដាច់ដោយឡែកពីគ្នា។
- អនុវត្ត **Multi-Stage Dockerfile** ដើម្បីកាត់បន្ថយទំហំ Image មកត្រឹម ~100MB - 180MB។
- ប្រើប្រាស់ **Docker Compose** ដើម្បីគ្រប់គ្រង Container Lifecycle ទាំងអស់។
- បង្កើត **Custom Bridge Network (`app-network`)** ជាមួយ DNS Service Discovery ដោយដាច់ខាតមិនប្រើ `localhost` រវាង Containers។
- ប្រើប្រាស់ **Docker Named Volumes (`postgres_data`)** ដើម្បីការពារទិន្នន័យកុំឱ្យបាត់បង់ពេលបិទ Container។
- អនុវត្ត **Nginx Reverse Proxy** ជាច្រកទ្វារតែមួយ (Single Public Entry Point) លើ Port 80។

---

## ៤. មុខងារចម្បងរបស់ប្រព័ន្ធ (System Features)

### ផ្នែកអតិថិជន (Customer):
- ចុះឈ្មោះ និង Login (JWT Authentication)
- មើលកាតាឡុកទំនិញ ស្វែងរក (Search) និងចម្រាញ់តាមប្រភេទ (Categories)
- ប្រព័ន្ធ In-Memory Caching ជាមួយ Redis (ទាញទិន្នន័យលឿនខ្លាំង `X-Cache: HIT-REDIS`)
- កន្ត្រកទំនិញ (Shopping Cart) កែប្រែចំនួនទំនិញ និងគណនាតម្លៃសរុប
- ការ Checkout បញ្ជាទិញទំនិញ (កាត់ស្តុកក្នុង Database ដោយស្វ័យប្រវត្តិ)
- មើលប្រវត្តិនៃការបញ្ជាទិញ (Order History)

### ផ្នែកអ្នកគ្រប់គ្រង (Admin):
- ផ្ទាំងស្ថិតិ Dashboard (ចំណូលសរុប, ចំនួន Orders, ចំនួនទំនិញក្នុងស្តុក, បញ្ជីទំនិញជិតអស់ពីស្តុក)
- គ្រប់គ្រងផលិតផល (Product CRUD) ជាមួយការ Auto Invalidate Redis Cache
- គ្រប់គ្រងប្រភេទផលិតផល (Category Management)
- គ្រប់គ្រងការបញ្ជាទិញ (Update Status: Pending, Processing, Completed, Cancelled)
- គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ (User Management)
- **ផ្ទាំងពិនិត្យមើល Docker Container Topology ផ្ទាល់លើ Web UI (Live Health & Architecture Monitor)**

---

## ៥. ដ្យាក្រាមស្ថាបត្យកម្មប្រព័ន្ធ (Architecture Diagram)

```mermaid
graph TD
    Client["🌐 Client Browser (Internet)"] -->|HTTP Port 80| Nginx["Nginx Reverse Proxy Container\n(Service: nginx | Port: 80)"]
    
    subgraph Docker_Network ["Docker Custom Network: app-network"]
        Nginx -->|Proxy: /| Frontend["Frontend Container: Next.js 14\n(Service: frontend | Port: 3000)"]
        Nginx -->|Proxy: /api/| Backend["Backend Container: Express.js + TS\n(Service: backend | Port: 5000)"]
        
        Backend -->|Query: postgres:5432| DB[("PostgreSQL 16 Container\n(Service: postgres | Port: 5432)")]
        Backend -->|Cache: redis:6379| Redis[("Redis 7 Container\n(Service: redis | Port: 6379)")]
    end

    DB --- VolPG[("Persistent Volume\npostgres_data")]
    Redis --- VolRD[("Persistent Volume\nredis_data")]
```

---

## ៦. ស្ថាបត្យកម្ម Containers ទាំង ៥ (Container Architecture)

| ឈ្មោះ Container | Service Name | Base Image | Port ខាងក្នុង | Port ខាងក្រៅ (Host) | តួនាទី |
|---|---|---|---|---|---|
| **ctn_nginx** | `nginx` | `nginx:1.25-alpine` | `80` | **`80:80`** | Reverse Proxy ច្រកចូលតែមួយ |
| **ctn_frontend** | `frontend` | `node:20-alpine` | `3000` | *គ្មាន* (Isolated) | Next.js 14 Web Application |
| **ctn_backend** | `backend` | `node:20-alpine` | `5000` | *គ្មាន* (Isolated) | Express.js REST API Service |
| **ctn_postgres** | `postgres` | `postgres:16-alpine` | `5432` | *គ្មាន* (Isolated) | PostgreSQL Relational Database |
| **ctn_redis** | `redis` | `redis:7-alpine` | `6379` | *គ្មាន* (Isolated) | Redis In-Memory Cache Store |

---

## ៧. ស្ថាបត្យកម្មបច្ចេកវិទ្យា Docker (Docker Architecture)
- **Container Isolation**: ប្រើ Linux Namespaces (PID, NET, IPC, MNT, UTS) ដើម្បីញែកដំណើរការរបស់សេវាកម្មនីមួយៗឱ្យនៅដាច់ពីគ្នា។
- **Resource Control**: ប្រើ Cgroups ក្នុងការគ្រប់គ្រង Memory និង CPU។
- **Layered Filesystem**: ប្រើ Overlay2 Storage Driver ដែលជួយឱ្យ Image Layers អាចចែករំលែកគ្នាបាន និងចំណេញទំហំ Disk។

---

## ៨. បច្ចេកវិទ្យាដែលបានប្រើប្រាស់ (Technology Stack)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript, PG (PostgreSQL Client Pool), IORedis, BcryptJS, JWT
- **Database**: PostgreSQL 16 Alpine
- **Cache**: Redis 7 Alpine
- **Gateway**: Nginx 1.25 Alpine Reverse Proxy
- **Orchestration**: Docker Engine, Docker Compose v2, Docker Networks, Docker Volumes

---

## ៩. ការពន្យល់អំពី Dockerfiles និង Multi-Stage Builds

### ហេតុអ្វីបានជាត្រូវប្រើ Multi-Stage Builds?
Multi-stage build អនុញ្ញាតឱ្យយើងបែងចែកការងារជា ៣ ដំណាក់កាល៖
1. **deps (Dependencies)**: ដំឡើង Dependencies ទាំងអស់
2. **builder**: Compile TypeScript ទៅជា Production JavaScript (`dist/` ឬ `.next/standalone`)
3. **runner**: យកតែ File ដែល Compile រួចមកដំណើរការលើ Base Image តូចបំផុត (`alpine`) ដោយមិនយក DevDependencies ឬ Compiler មកជាមួយឡើយ។

**លទ្ធផល**:
- Backend Image: សល់ត្រឹម **~140MB**
- Frontend Image: សល់ត្រឹម **~180MB**
- **Non-Root User Execution**: ដំណើរការដោយ `USER node` និង `USER nextjs` ដើម្បីការពារសុវត្ថិភាព (Least Privilege Principle)។

---

## ១០. ការពន្យល់អំពី Docker Compose (`docker-compose.yml`)
- `services`: ប្រកាសសេវាកម្មទាំង ៥
- `healthcheck`: ត្រួតពិនិត្យភាពរស់រវើកនៃសេវាកម្មនីមួយៗជាប្រចាំ
- `depends_on` ជាមួយ `condition: service_healthy`: ធានាថា Backend ចាប់ផ្តើមតែនៅពេលដែល PostgreSQL និង Redis មានសុខភាពល្អ និងត្រៀមខ្លួនទទួល Connection រួចរាល់ប៉ុណ្ណោះ។
- `restart: unless-stopped`: បើក Container ឡើងវិញដោយស្វ័យប្រវត្តិបើមានបញ្ហាគាំង។

---

## ១១. ការពន្យល់អំពី Docker Network និង Embedded DNS

### ហេតុអ្វីបានជាមិនត្រូវប្រើ `localhost` រវាង Containers?
- នៅក្នុង Container នីមួយៗ ពាក្យថា `localhost` ឬ `127.0.0.1` សំដៅលើ **Network Namespace ផ្ទាល់ខ្លួនរបស់ Container នោះប៉ុណ្ណោះ**។
- ប្រសិនបើ Backend ភ្ជាប់ទៅ `localhost:5432` វានឹងស្វែងរក Database នៅក្នុង Container របស់វាផ្ទាល់ ដែលបណ្តាលឱ្យចេញកំហុស `ECONNREFUSED`។
- **ដំណោះស្រាយ**: យើងប្រើប្រាស់ **Docker Custom Network (`app-network`)**។ Docker Engine នឹងបើកដំណើរការ Embedded DNS Server ដោយស្វ័យប្រវត្តិ ដែលអនុញ្ញាតឱ្យ Backend ភ្ជាប់ទៅកាន់ Service Name ដោយផ្ទាល់៖
  - Backend ទៅ PostgreSQL: `postgres:5432`
  - Backend ទៅ Redis: `redis:6379`
  - Nginx ទៅ Frontend: `frontend:3000`
  - Nginx ទៅ Backend: `backend:5000`

---

## ១២. ការពន្យល់អំពី Docker Volumes និង Data Persistence

### Container Writable Layer vs Docker Named Volume
- **Container Writable Layer**: បាត់បង់ទិន្នន័យភ្លាមៗនៅពេល Container ត្រូវបាន Remove (`docker compose down`)។
- **Docker Named Volume (`postgres_data`)**: ឯកសារទិន្នន័យពិតប្រាកដត្រូវបានរក្សាទុកនៅលើ Host Machine ឯករាជ្យពី Container Lifecycle។ ទោះបីជា Container ត្រូវបានលុបចោល ឬ Upgrade ក៏ទិន្នន័យ Database នៅតែគង់វង្ស 100%។

---

## ១៣. ការកំណត់ Environment Variables
ឯកសារ `.env` ផ្ទុកទិន្នន័យ Configuration ទាំងអស់ដោយមិនមានការ Hardcode ក្នុងកូដឡើយ៖
```env
POSTGRES_DB=ecommerce
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_university_password_2026
POSTGRES_PORT=5432
DATABASE_URL=postgresql://admin:secure_university_password_2026@postgres:5432/ecommerce
REDIS_URL=redis://redis:6379
JWT_SECRET=super_secret_jwt_key_ctn_containers_2026
```

---

## ១៤. ការដំឡើង និងដំណើរការគម្រោង (Installation & Running)

### ជំហានទី ១៖ រៀបចំឯកសារបរិស្ថាន
```bash
cp .env.example .env
```

### ជំហានទី ២៖ Build Docker Images ទាំងអស់
```bash
docker compose build
```

### ជំហានទី ៣៖ ដំណើរការ Containers ទាំងអស់ក្នុង Background
```bash
docker compose up -d
```

### ជំហានទី ៤៖ ចូលមើលកម្មវិធីតាមរយៈ Web Browser
បើក Browser រួចចូលទៅកាន់៖
- **Web Application & Storefront:** [http://localhost](http://localhost)
- **API Health Check Endpoint:** [http://localhost/api/health](http://localhost/api/health)
- **Admin Dashboard:** [http://localhost/admin](http://localhost/admin)

### គណនីសាកល្បងសម្រាប់ Demo (Credentials):
- **Admin:** អ៊ីមែល `admin@ecommerce.ctn` | ពាក្យសម្ងាត់ `admin123`
- **Customer:** អ៊ីមែល `customer@ecommerce.ctn` | ពាក្យសម្ងាត់ `customer123`
*(នៅលើទំព័រ Login មានប៊ូតុងចុច 1-Click Autofill ងាយស្រួលបង្ហាញគ្រូ)*

---

## ១៥. ការពន្យល់ពាក្យបញ្ជា Docker សំខាន់ៗ (Docker Commands)

| ពាក្យបញ្ជា | ការពន្យល់បច្ចេកទេស |
|---|---|
| `docker compose build` | ដំណើរការ Build Images ទាំងអស់តាម Dockerfile នីមួយៗ |
| `docker compose up` | បើកដំណើរការ Containers ទាំងអស់ និងបង្ហាញ Logs លើ Terminal ផ្ទាល់ |
| `docker compose up -d` | បើកដំណើរការ Containers ទាំងអស់ជា Background Daemon (Detached mode) |
| `docker compose ps` | បង្ហាញស្ថានភាព (State) និង Healthcheck របស់ Containers ទាំងអស់ |
| `docker compose logs` | មើល Logs រួមរបស់ប្រព័ន្ធទាំងមូល |
| `docker compose logs backend` | មើល Logs ជាក់លាក់របស់សេវាកម្ម Backend |
| `docker compose up --build` | បង្ខំឱ្យ Rebuild Image ឡើងវិញមុនពេល Start Containers |
| `docker compose down` | បញ្ឈប់ និងលុប Containers រួមទាំង Networks (ប៉ុន្តែ **រក្សាទុក** ទិន្នន័យ Volumes) |
| `docker compose down -v` | បញ្ឈប់ លុប Containers និង **លុបចោល Volumes ទាំងអស់** (Reset Database ទាំងស្រុង) |

---

## ១៦. មគ្គុទ្ទេសក៍បង្ហាញគ្រូ ១៥ ជំហាន (CTN Classroom Demo Guide)

អនុវត្តតាម ១៥ ជំហាននេះ ធានាថានឹងទទួលបានពិន្ទុអតិបរមាក្នុងការការពារគម្រោង៖

- **STEP 1 (បង្ហាញស្ថាបត្យកម្ម):** បើកឯកសារ `README.md` បង្ហាញដ្យាក្រាម Mermaid និងពន្យល់អំពីតួនាទីរបស់ Containers ទាំង ៥។
- **STEP 2 (បង្ហាញ Dockerfiles):** បើក `backend/Dockerfile` និង `frontend/Dockerfile` បង្ហាញពីបច្ចេកទេស Multi-Stage Build និង Non-root user `USER node`។
- **STEP 3 (បង្ហាញ docker-compose.yml):** ពន្យល់អំពី `depends_on: condition: service_healthy`, `networks: app-network`, និង `volumes: postgres_data`។
- **STEP 4 (ដំណើរការប្រព័ន្ធ):** វាយពាក្យបញ្ជា `docker compose up -d` លើ Terminal។
- **STEP 5 (ពិនិត្យ Container Status):** វាយពាក្យបញ្ជា `docker compose ps` បង្ហាញថា Containers ទាំង ៥ មានស្ថានភាព `Up (healthy)`។
- **STEP 6 (ពិនិត្យ Docker Images):** វាយ `docker images` បង្ហាញពីទំហំ Image ដ៏តូចរបស់ Backend និង Frontend។
- **STEP 7 (បង្ហាញ Docker Networks):** វាយ `docker network ls` បង្ហាញឈ្មោះបណ្តាញ `app-network`។
- **STEP 8 (Inspect Network):** វាយ `docker network inspect app-network` បង្ហាញថា Containers ទាំង ៥ ស្ថិតក្នុង Subnet តែមួយ និងមាន IP ដាច់ដោយឡែក។
- **STEP 9 (ចូលមើល Web UI):** បើក Browser ចូល `http://localhost` បង្ហាញកាតាឡុកទំនិញ និងបង្ហាញ Badge "Docker Network Live Status" នៅលើ Navbar។
- **STEP 10 (បង្កើតផលិតផលថ្មី):** ចូល Admin Dashboard (`/admin`) រួចបង្កើតផលិតផលថ្មីមួយ (ឧទាហរណ៍៖ "Dell Alienware 18").
- **STEP 11 (ផ្ទៀងផ្ទាត់ក្នុង Database Container):** ដំណើរការពាក្យបញ្ជាចូលទៅមើលទិន្នន័យក្នុង PostgreSQL Container ដោយផ្ទាល់៖
  ```bash
  docker exec -it ctn_postgres psql -U admin -d ecommerce -c "SELECT id, name, price, stock FROM products ORDER BY id DESC LIMIT 1;"
  ```
  បង្ហាញគ្រូថាទិន្នន័យបានចូលក្នុង PostgreSQL Container ពិតប្រាកដ!
- **STEP 12 (តេស្ត Redis Cache):** ចូលទំព័រដើម Refresh ម្តង ឃើញផ្លាក `MISS-POSTGRES` ហើយ Refresh ម្តងទៀតឃើញផ្លាក `HIT-REDIS` (បញ្ជាក់ពីការតភ្ជាប់រវាង Backend និង Redis Container)។
- **STEP 13 (តេស្ត Data Persistence):** បិទ Containers ទាំងអស់ចោលដោយប្រើ `docker compose down` រួចបើកឡើងវិញដោយ `docker compose up -d`។ បង្ហាញគ្រូថាផលិតផលដែលបានបង្កើតនៅជំហានទី ១០ នៅតែមានវត្តមានដដែល ដោយសារ Docker Volume `postgres_data`!
- **STEP 14 (បង្ហាញ Nginx Reverse Proxy):** បង្ហាញថា Port 3000 និង Port 5000 មិនត្រូវបានបើកជាសាធារណៈទេ គឺរាល់ការចូលទាំងអស់ត្រូវឆ្លងកាត់ Nginx Port 80។
- **STEP 15 (បង្ហាញ Container Isolation):** ដំណើរការតេស្ត Container Failure ខាងក្រោម។

---

## ១៧. ការធ្វើតេស្តពេល Container គាំង (Container Failure Simulation)

### ជំហានពិសោធន៍ជាក់ស្តែង៖
1. **បិទ Backend Container ដោយចេតនា:**
   ```bash
   docker stop ctn_backend
   ```
2. **សង្កេតមើលលទ្ធផល (`docker compose ps`):**
   - `ctn_backend` ធ្លាក់ក្នុងស្ថានភាព `Exited`។
   - ប៉ុន្តែ `ctn_postgres`, `ctn_redis`, `ctn_frontend`, និង `ctn_nginx` **នៅតែបន្តរត់ធម្មតា មិនគាំងតាមឡើយ**!
   - នេះបញ្ជាក់ពី **Service Isolation** ក្នុង Container Architecture។
3. **បើក Backend ឡើងវិញ:**
   ```bash
   docker start ctn_backend
   ```
   ប្រព័ន្ធនឹង Auto-reconnect ទៅកាន់ PostgreSQL & Redis ហើយដំណើរការធម្មតាឡើងវិញ 100%។

---

## ១៨. ដំណោះស្រាយបញ្ហាទូទៅ (Troubleshooting)

### ១. បញ្ហា Port 80 ត្រូវបានប្រើប្រាស់ដោយកម្មវិធីផ្សេង (ឧទាហរណ៍ IIS ឬ Skype)
- **ដំណោះស្រាយ**: ប្តូរ Port ក្នុង `docker-compose.yml` ត្រង់ nginx ទៅ `"8080:80"` រួចចូលតាម `http://localhost:8080`។

### ២. បញ្ហា Database Connection Refused
- **មូលហេតុ**: Backend ចាប់ផ្តើមមុនពេល PostgreSQL Ready។
- **ដំណោះស្រាយ**: ក្នុងគម្រោងនេះ យើងបានដោះស្រាយរួចរាល់តាមរយៈ `condition: service_healthy` និង Retry Logic ក្នុង `backend/src/config/db.ts`។

### ៣. ចង់ Reset Database ឱ្យនៅសភាពដើមវិញ
- ដំណើរការពាក្យបញ្ជា៖
  ```bash
  docker compose down -v
  docker compose up -d
  ```

---

## ១៩. ការដាក់ឱ្យដំណើរការលើ Production (Deployment)
សម្រាប់ជំហានលម្អិតនៃការដាក់ឱ្យដំណើរការលើ Linux Server (Ubuntu VPS, AWS, DigitalOcean) សូមអានឯកសារ [Production Deployment Guide](file:///d:/ContaineiDoker/docs/deployment.md)។

---

## ២០. សេចក្តីសន្និដ្ឋាន និងការអភិវឌ្ឍទៅមុខ (Conclusion & Future Improvements)

### សេចក្តីសន្និដ្ឋាន
គម្រោង "Containerized E-Commerce Management System" នេះបានបង្ហាញយ៉ាងច្បាស់លាស់នូវការអនុវត្តបច្ចេកវិទ្យា Containerization ក្នុងកម្រិតឧស្សាហកម្មពិតប្រាកដ។ តាមរយៈការប្រើប្រាស់ Docker, Docker Compose, Multi-Stage Builds, Custom Networks, Persistent Volumes, និង Nginx Reverse Proxy ប្រព័ន្ធនេះទទួលបាននូវភាពឯករាជ្យ សុវត្ថិភាពខ្ពស់ និងការគ្រប់គ្រងធនធានប្រកបដោយប្រសិទ្ធភាពខ្ពស់បំផុត។

### គម្រោងអភិវឌ្ឍន៍ទៅមុខ (Future Improvements)
- ការផ្លាស់ប្តូរពី Docker Compose ទៅកាន់ **Kubernetes (K8s)** សម្រាប់ការគ្រប់គ្រងកម្រិតស្វ័យប្រវត្តិ (Auto-scaling, Rolling Updates)។
- ការបន្ថែម **CI/CD Pipeline** ជាមួយ GitHub Actions សម្រាប់ធ្វើ Automated Build & Test។
- ការបន្ថែម **Prometheus & Grafana Container** សម្រាប់ប្រព័ន្ធតាមដាន Metrics កម្រិតខ្ពស់។
