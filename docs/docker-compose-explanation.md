# ការពន្យល់អំពី Docker Compose (Docker Compose Explanation)

មុខវិជ្ជា៖ **[CTN] Containers**

ឯកសារនេះពន្យល់គ្រប់ Keyword និង Directive សំខាន់ៗទាំងអស់ដែលមាននៅក្នុង `docker-compose.yml` របស់គម្រោង។

---

## ១. តើអ្វីជា Docker Compose?
Docker Compose គឺជាឧបករណ៍ (Tool) សម្រាប់កំណត់ និងដំណើរការកម្មវិធី Multi-Container Docker។ ជំនួសឱ្យការវាយពាក្យបញ្ជា `docker run` និង `docker network create` ដោយដៃម្តងមួយៗ យើងសរសេរប្លង់កំណត់រចនាសម្ព័ន្ធ (Declarative Configuration) នៅក្នុងឯកសារ `docker-compose.yml` តែមួយ ហើយដំណើរការប្រព័ន្ធទាំងមូលដោយប្រើពាក្យបញ្ជាតែមួយគត់៖ `docker compose up -d`។

---

## ២. ការពន្យល់លម្អិតអំពី Directives នីមួយៗក្នុង `docker-compose.yml`

### ក. `version: '3.8'`
កំណត់កំណែ Syntax របស់ Docker Compose File ដែលគាំទ្រមុខងារទំនើបៗដូចជា Advanced Healthcheck Conditions និង Custom Network Drivers។

### ខ. `services:`
ផ្នែកសម្រាប់ប្រកាសឈ្មោះ Containers ដែលត្រូវបង្កើត៖
1. `nginx`: Reverse Proxy
2. `frontend`: Next.js Client
3. `backend`: Express.js API
4. `postgres`: Relational Database
5. `redis`: In-Memory Caching

### គ. `build:` និង `image:`
- `build: context: ./backend`: ប្រាប់ Docker ឱ្យស្វែងរក `Dockerfile` នៅក្នុង Folder នោះ ដើម្បីធ្វើការ Build ជា Image ថ្មី។
- `image: postgres:16-alpine`: ទាញយក Image ផ្លូវការស្រាប់ពី Docker Hub (មិនបាច់សរសេរ Dockerfile ផ្ទាល់ខ្លួន)។

### ឃ. `container_name:`
កំណត់ឈ្មោះជាក់លាក់ឱ្យ Container នៅពេលដំណើរការ (ឧទាហរណ៍ `ctn_backend`, `ctn_postgres`) ដើម្បីងាយស្រួលមើលក្នុង `docker ps` និង `docker logs`។

### ង. `restart: unless-stopped`
គោលការណ៍គ្រប់គ្រង Container Lifecycle។ ប្រសិនបើ Container គាំង (Crash) ដោយសារបញ្ហាអ្វីមួយ Docker នឹង Restart វាឡើងវិញដោយស្វ័យប្រវត្តិ។

### ច. `ports` vs `expose`
- `ports: - "80:80"`: ប្រើតែលើ `nginx` ប៉ុណ្ណោះ ដើម្បី Bind ច្រកចូលពី Host Machine ទៅក្នុង Container។
- `expose: - "5000"`: ប្រើលើ `backend` និង `frontend` ដើម្បីអនុញ្ញាតឱ្យតែ Container នៅក្នុងបណ្តាញ `app-network` មើលឃើញគ្នាទៅវិញទៅមកប៉ុណ្ណោះ។

### ឆ. `depends_on` ជាមួយ `condition: service_healthy`
នេះជាចំណុចគន្លឹះនៃ CTN Project៖
```yaml
depends_on:
  postgres:
    condition: service_healthy
  redis:
    condition: service_healthy
```
- នៅក្នុង Docker Compose ធម្មតា ការប្រើ `depends_on: [postgres]` គ្រាន់តែរង់ចាំឱ្យ Container `postgres` ចាប់ផ្តើមដំណើរការ (State: Started) ប៉ុណ្ណោះ ប៉ុន្តែ Database Engine ប្រហែលជាមិនទាន់រួចរាល់សម្រាប់ទទួល SQL Connection នៅឡើយទេ។
- **ការប្រើ `condition: service_healthy`**: បង្ខំឱ្យ Backend រង់ចាំរហូតដល់ Healthcheck របស់ PostgreSQL បញ្ជាក់ថា "Ready to accept connections" ជាមុនសិន ទើបអនុញ្ញាតឱ្យ Backend ចាប់ផ្តើម។ នេះជៀសវាងបញ្ហា "Database Connection Refused" ដាច់ខាត!

### ជ. `healthcheck`
ត្រួតពិនិត្យសុខភាពសេវាកម្មជាប្រចាំ៖
- `test`: ពាក្យបញ្ជាដែលត្រូវដំណើរការក្នុង Container (ឧទាហរណ៍ `pg_isready` សម្រាប់ Postgres, `redis-cli ping` សម្រាប់ Redis, `curl -f /health` សម្រាប់ Backend)។
- `interval: 15s`: ធ្វើតេស្តម្តងរៀងរាល់ ១៥ វិនាទី។
- `timeout: 5s`: បើលើសពី ៥ វិនាទីមិនឆ្លើយតប ចាត់ទុកថាបរាជ័យ (Fail)។
- `retries: 3`: បើបរាជ័យ ៣ ដងជាប់គ្នា ចាត់ទុកថា Container ធ្លាក់ក្នុងស្ថានភាព "unhealthy"។
- `start_period: 10s`: ទុកពេលឱ្យសេវាកម្ម Boot Up ដំបូងមុនពេលចាប់ផ្តើមរាប់ Healthcheck។

### ឈ. `volumes:`
- `postgres_data:/var/lib/postgresql/data`: ភ្ជាប់ Named Volume ទៅកាន់ Folder ផ្ទុកទិន្នន័យរបស់ PostgreSQL។
- `./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro`: Mount ឯកសារ SQL Schema ចូលទៅដំណើរការ Seed Data ដោយស្វ័យប្រវត្តិតែក្នុងពេលបង្កើត Container លើកដំបូង (`ro` = Read Only)។

### ញ. `networks:`
ភ្ជាប់សេវាកម្មទាំងអស់ចូលទៅក្នុង Custom Bridge Network តែមួយឈ្មោះ `app-network`។
