# ការដាក់ឱ្យដំណើរការលើ Production (Production Deployment Guide)

មុខវិជ្ជា៖ **[CTN] Containers**

ឯកសារនេះបង្ហាញពីរបៀបដាក់ឱ្យដំណើរការ (Deploy) នូវប្រព័ន្ធ Multi-Container E-Commerce នេះនៅលើ Production Server (ដូចជា Ubuntu Linux Server, AWS EC2, DigitalOcean Droplet)។

---

## ១. តម្រូវការជាមុន (Prerequisites)
នៅលើ Server ត្រូវតែមានដំឡើង៖
1. **Docker Engine** (កំណែ 24.0 ឬថ្មីជាងនេះ)
2. **Docker Compose Plugin** (កំណែ v2.20 ឬថ្មីជាងនេះ)
3. **Git**

---

## ២. ជំហានដាក់ឱ្យដំណើរការ (Deployment Steps)

### ជំហានទី ១៖ Clone កូដគម្រោងពី Git
```bash
git clone <your-repository-url> ctn-ecommerce
cd ctn-ecommerce
```

### ជំហានទី ២៖ រៀបចំឯកសារបរិស្ថាន (.env)
ចម្លងឯកសារគំរូ និងកែសម្រួលលេខសម្ងាត់សម្រាប់ Production៖
```bash
cp .env.example .env
nano .env
```
> **ចំណាំ**: សូមប្តូរ `POSTGRES_PASSWORD` និង `JWT_SECRET` ទៅជាលេខកូដសម្ងាត់ខ្លាំងៗ និងស្មុគស្មាញ។

### ជំហានទី ៣៖ Build និងដំណើរការ Containers
ដំណើរការពាក្យបញ្ជាដើម្បីទាញយក Base Images, Build Multi-Stage Dockerfiles, និង Start សេវាកម្មទាំងអស់ក្នុង Background៖
```bash
docker compose up -d --build
```

### ជំហានទី ៤៖ ផ្ទៀងផ្ទាត់ស្ថានភាព Containers
```bash
docker compose ps
```
ត្រូវប្រាកដថា Containers ទាំង ៥ (`ctn_nginx`, `ctn_frontend`, `ctn_backend`, `ctn_postgres`, `ctn_redis`) មានស្ថានភាព **`Up (healthy)`**។

---

## ៣. ការត្រួតពិនិត្យ Logs និងការគ្រប់គ្រងប្រព័ន្ធ (Maintenance)

- **មើល Logs នៃប្រព័ន្ធទាំងមូលតាម Real-time**:
  ```bash
  docker compose logs -f
  ```
- **មើល Logs នៃសេវាកម្មជាក់លាក់ (ឧទាហរណ៍ Backend)**:
  ```bash
  docker compose logs -f backend
  ```
- **ពិនិត្យមើលការប្រើប្រាស់ RAM និង CPU របស់ Containers (Resource Monitoring)**:
  ```bash
  docker stats
  ```
- **ចាប់ផ្តើមសេវាកម្មឡើងវិញ (Restart Single Service)**:
  ```bash
  docker compose restart backend
  ```
- **បិទប្រព័ន្ធ (Stop containers while keeping database data)**:
  ```bash
  docker compose down
  ```
- **បិទ និងលុបទិន្នន័យ Volume ទាំងអស់ចោល (Full Reset)**:
  ```bash
  docker compose down -v
  ```
